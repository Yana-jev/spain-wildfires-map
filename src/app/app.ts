import type { OnInit } from "@angular/core";
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, signal } from "@angular/core";
import { Fires } from "./services/fires";

// Optional: If you're loading secure web maps
// import { configureOAuth } from "../auth/configureOAuth";
// configureOAuth({
//   // Default portalUrl is ArcGIS Online
//   // Only set if using other portals
//   portalUrl: "YOUR_PORTAL_URL",
//   appId: "YOUR_APP_ID",
// });

// Individual imports for each Map, Chart and Calcite component
import "@arcgis/map-components/components/arcgis-expand";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-search";
import "@arcgis/map-components/components/arcgis-zoom";
import "@arcgis/charts-components/components/arcgis-chart";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-navigation";
import "@esri/calcite-components/components/calcite-navigation-logo";
import "@esri/calcite-components/components/calcite-shell-panel";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-list-item";
import "@esri/calcite-components/components/calcite-loader";
import "@esri/calcite-components/components/calcite-label";
import "@esri/calcite-components/components/calcite-select";
import "@esri/calcite-components/components/calcite-option";
import "@esri/calcite-components/components/calcite-slider";
import '@esri/calcite-components/dist/components/calcite-segmented-control';
import '@esri/calcite-components/dist/components/calcite-segmented-control-item';
import GeoJSONLayer from "@arcgis/core/layers/GeoJSONLayer.js";
import type { ArcgisMap } from "@arcgis/map-components/components/arcgis-map";
import { FirePoint } from "./interfaces/Fire-point";

@Component({
  selector: "app-root",
  templateUrl: "./app.html",
  styleUrl: "./app.css",
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class App implements OnInit {
  title: string = "map-components-angular-sample";
  navHeading: string = "";
  navDescription: string = "";
  totalFires = signal(0);
  maxIntensity = signal(0);
  isLoading = signal(true);
  selectedDays = signal(3);
  minIntensity = signal(0);
  maxIntensityFilter = signal(999999);
  allFires: FirePoint[] = [];
  private fireService = inject(Fires);
  private mapView?: ArcgisMap;
  private firesLayer?: GeoJSONLayer;

  ngOnInit(): void {
    console.log("OnInit");
  }

  getColorForIntensity(frp: number): number[] {
  if (frp < 5) {
    return [255, 255, 0];      
  } else if (frp < 20) {
    return [255, 165, 0];     
  } else if (frp < 50) {
    return [255, 69, 0];      
  } else {
    return [200, 0, 0];      
  }
}

  arcgisViewReadyChange(event: CustomEvent): void {
    const viewElement = event.target as ArcgisMap;
    this.mapView = viewElement;
    if (viewElement.view) {
      viewElement.view.popup!.dockOptions = {
        buttonEnabled: true,
        breakpoint: false,
        position: "bottom-right"
      }
    }
    this.navHeading = "Incendios Forestales en España";
    this.navDescription = "Datos de NASA FIRMS en tiempo real";

    this.loadFires()
  }



loadFires(): void {
  this.isLoading.set(true);
  this.fireService.getFires(this.selectedDays()).subscribe( data => {
    this.allFires = this.fireService.parseCsv(data);
    this.applyFilter(); 
  } )
}
renderFires(fires: FirePoint[]): void {
  this.totalFires.set(fires.length);
  this.maxIntensity.set(fires.length > 0 ? Math.max(...fires.map(f => f.frp)) : 0);
  this.isLoading.set(false);

  if (!this.mapView) return;


  if (this.firesLayer) {
    this.mapView.map!.remove(this.firesLayer);
  }

const geojson = {
  type: "FeatureCollection",
  features: fires.map((fire, index) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [fire.longitude, fire.latitude] },
    properties: { frp: fire.frp, date: fire.acq_date, OBJECTID: index }
  }))
};

  const blob = new Blob([JSON.stringify(geojson)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  this.firesLayer = new GeoJSONLayer({
  url: url,
  title: "Incendios activos",
  geometryType: "point",
  objectIdField: "OBJECTID",
  fields: [
    { name: "OBJECTID", type: "oid" },
    { name: "frp", type: "double" },
    { name: "date", type: "string" }
  ],
  renderer: {
    type: "class-breaks",
    field: "frp",
    classBreakInfos: [
      { minValue: 0, maxValue: 5, symbol: { type: "simple-marker", color: [255, 255, 0], size: 8, outline: { color: "white", width: 1 } } },
      { minValue: 5, maxValue: 20, symbol: { type: "simple-marker", color: [255, 165, 0], size: 8, outline: { color: "white", width: 1 } } },
      { minValue: 20, maxValue: 50, symbol: { type: "simple-marker", color: [255, 69, 0], size: 8, outline: { color: "white", width: 1 } } },
      { minValue: 50, maxValue: 999999, symbol: { type: "simple-marker", color: [200, 0, 0], size: 8, outline: { color: "white", width: 1 } } },
    ]
  } as any,
  popupTemplate: {
    title: "Incendio detectado",
    content: "Fecha: {date}<br>Intensidad (FRP): {frp}"
  }
});

  this.mapView.map!.add(this.firesLayer);
}

  onDaysChange(event: any): void {
    this.isLoading.set(true);
  this.selectedDays.set(Number(event.target.value));
  this.loadFires();
}

onIntensityChange(event: any): void {
  const value = event.target.value;

  switch (value) {
    case '0':
      this.minIntensity.set(0);
      this.maxIntensityFilter.set(999999);
      break;
    case '5':
      this.minIntensity.set(5);
      this.maxIntensityFilter.set(20);
      break;
    case '20':
      this.minIntensity.set(20);
      this.maxIntensityFilter.set(50);
      break;
    case '50':
      this.minIntensity.set(50);
      this.maxIntensityFilter.set(999999);
      break;
  }

  this.applyFilter();
}

applyFilter(): void {
  const filtered = this.allFires.filter(
    fire => fire.frp >= this.minIntensity() && fire.frp < this.maxIntensityFilter()
  );

  this.totalFires.set(filtered.length);
  this.maxIntensity.set(filtered.length > 0 ? Math.max(...filtered.map(f => f.frp)) : 0);
  this.isLoading.set(false);

  this.renderFires(filtered);
}
}
