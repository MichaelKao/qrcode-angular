import { Injectable } from '@angular/core';
import { CITIES, DISTRICTS } from '../data/city-data';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  getCities() {
    return CITIES;
  }

  getDistricts(cityId: number) {
    return DISTRICTS.filter(d => d.cityId === cityId);
  }

  getPostCode(cityId: number, districtId: number) {
    const district = DISTRICTS.find(d => d.cityId === cityId && d.id === districtId);
    return district?.postCode || '';
  }
}
