import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = '41bb7c762e395055d99764504c4d7c3e'; // Replace with your actual API key
  private baseUrl = 'https://api.openweathermap.org/data/2.5/';

  constructor() {}

  // ✅ Fetch Weather by Coordinates with Unit Option
  async getWeatherByCoords(lat: number, lon: number, unit: string): Promise<any> {
    const url = `${this.baseUrl}weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${unit}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  // ✅ Fetch Forecast by Coordinates with Unit Option
  async getForecastByCoords(lat: number, lon: number, unit: string): Promise<any> {
    const url = `${this.baseUrl}forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${unit}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return null;
    }
  }

  // ✅ Fetch Weather by City with Unit Option
  async getWeatherByCity(city: string, unit: string): Promise<any> {
    const url = `${this.baseUrl}weather?q=${city}&appid=${this.apiKey}&units=${unit}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching city weather:', error);
      return null;
    }
  }
}
