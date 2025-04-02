import { Component, OnInit, Renderer2 } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { GeolocationService } from '../services/geolocation.service';
import { StorageService } from '../services/storage.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentWeather: any;
  forecast: any;
  filteredForecast: any[] = [];
  userLocation: string = 'Loading...';

  constructor(
    private weatherService: WeatherService,
    private geoService: GeolocationService,
    private storageService: StorageService,
    private renderer: Renderer2 // ✅ Inject Renderer2 here
  ) {}

  async ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      await this.getUserWeather();
    } else {
      this.getWeatherByCity('Cebu'); // Default city
    }
  }

  async getUserWeather() {
    const location = await this.geoService.getCurrentLocation();
    if (location) {
      this.getWeatherByCoords(location.lat, location.lon);
    } else {
      this.getWeatherByCity('Cebu'); // Fallback location
    }
  }

  async getWeatherByCoords(lat: number, lon: number) {
    this.currentWeather = await this.weatherService.getWeatherByCoords(lat, lon);
    this.forecast = await this.weatherService.getForecastByCoords(lat, lon);
    this.userLocation = this.currentWeather?.name || 'Unknown Location';

    this.filterForecast(this.forecast.list);

    // Save to cache
    this.storageService.setItem('cachedWeather', this.currentWeather);
    this.storageService.setItem('cachedForecast', this.forecast);
  }

  async getWeatherByCity(city: string) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=41bb7c762e395055d99764504c4d7c3e&units=metric`;
    try {
      const response = await fetch(url);
      this.currentWeather = await response.json();
      this.userLocation = city;

      const forecastData = await this.weatherService.getForecastByCoords(
        this.currentWeather.coord.lat,
        this.currentWeather.coord.lon
      );

      this.filterForecast(forecastData.list);
    } catch (error) {
      console.error('Error fetching city weather:', error);
    }
  }

  // Filter forecast to get one entry per day (around 12:00 PM)
  filterForecast(forecastList: any[]) {
    this.filteredForecast = forecastList.filter((item) =>
      item.dt_txt.includes('12:00:00')
    );
  }

  // ✅ Add this function for theme toggling
  toggleTheme(event: any) {
    if (event.detail.checked) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }
}
