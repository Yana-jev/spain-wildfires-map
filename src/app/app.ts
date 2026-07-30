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

// Import modules and types from the SDK's core API
import Graphic from "@arcgis/core/Graphic.js";
import Point from "@arcgis/core/geometry/Point.js";
import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
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
  allFires: FirePoint[] = [];
  private fireService = inject(Fires);
  private mapView?: ArcgisMap;

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

  renderFires(fires: FirePoint[]): void{
    this.totalFires.set(fires.length);
    this.maxIntensity.set(Math.max(...fires.map(f => f.frp)));
    this.isLoading.set(false)
    console.log('Всего:', this.totalFires, 'Макс. интенсивность:', this.maxIntensity);

    if  (!this.mapView) return;
    this.mapView.graphics.removeAll();

    fires.forEach(fire => {
      const point = new Point({
        longitude: fire.longitude,
        latitude: fire.latitude
      });

    const symbol = new SimpleMarkerSymbol({
      style: "circle",
      size: 8,
      color: this.getColorForIntensity(fire.frp),
      outline: new SimpleLineSymbol({ color: "orange", width: 1 })
    });

      const graphic = new Graphic({
      geometry: point,
      symbol: symbol,
      attributes: {
        date: fire.acq_date,
        intensity: fire.frp
      },
      popupTemplate: {
        title: "Incendio detectado",
        content: "Fecha: {date}<br>Intensidad (FRP): {intensity}"
      }
    });

    this.mapView!.graphics.add(graphic);
    })
  }

  onDaysChange(event: any): void {
    this.isLoading.set(true);
  this.selectedDays.set(Number(event.target.value));
  this.loadFires();
}

onIntensityChange(event: any): void {
  this.minIntensity.set(Number(event.target.value));
  this.applyFilter();
}

applyFilter(): void {
  
  const filtered = this.allFires.filter(fire => fire.frp >= this.minIntensity());

  this.totalFires.set(filtered.length);
  this.maxIntensity.set(filtered.length > 0 ? Math.max(...filtered.map(f => f.frp)) : 0);
  this.isLoading.set(false);

  this.renderFires(filtered);
}
}
