import { HttpClient } from "@angular/common/http";
import { inject, Service } from "@angular/core";
import { Observable } from "rxjs";
import { FirePoint } from "../interfaces/Fire-point";

@Service()
export class Fires {

   private http = inject(HttpClient);
   private apiKey = '5debd4895e8737a37a7c55ff6454dc16';
   private baseUrl = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv';
   

   getFires(): Observable<string>{
      const url = `${this.baseUrl}/${this.apiKey}/VIIRS_SNPP_NRT/-9.5,35.9,3.4,43.8/2`;
      return this.http.get(url, { responseType: 'text' });
   }

   parseCsv(csvText: string): FirePoint[] {
   const lines = csvText.trim().split('\n');
   const headers = lines[0].split(',');

   return lines.slice(1).map(line => {
      const values = line.split(',');
      return {
         latitude: parseFloat(values[headers.indexOf('latitude')]),
         longitude: parseFloat(values[headers.indexOf('longitude')]),
         frp: parseFloat(values[headers.indexOf('frp')]),
         acq_date: values[headers.indexOf('acq_date')],
      };
   });
   }



}
