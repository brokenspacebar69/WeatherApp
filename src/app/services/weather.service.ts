import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private apiKey = '41bb7c762e395055d99764504c4d7c3e'; // Replace with your actual API key
  private baseUrl = 'https://api.openweathermap.org/data/2.5/';

  constructor() {}

  // Get weather by coordinates
  async getWeatherByCoords(lat: number, lon: number): Promise<any> {
    const url = `${this.baseUrl}weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return null;
    }
  }

  // Get 5-day forecast
  async getForecastByCoords(lat: number, lon: number): Promise<any> {
    const url = `${this.baseUrl}forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return null;
    }
  }
}
