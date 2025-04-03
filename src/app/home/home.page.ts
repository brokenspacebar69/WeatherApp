import { Component, OnInit, Renderer2 } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
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
  hourlyForecast: any[] = [];  // ✅ Store hourly weather
  userLocation: string = 'Loading...';
  isCelsius: boolean = true; // ✅ Default to Celsius
  alertsEnabled: boolean = false;
  isDarkMode: boolean = false;

  constructor(
    private weatherService: WeatherService,
    private geoService: GeolocationService,
    private storageService: StorageService,
    private renderer: Renderer2
  ) {}

  async ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      await this.getUserWeather();
    } else {
      this.getWeatherByCity('Cebu City'); // Default city
    }
  
    // ✅ Load preferences
    this.alertsEnabled = (await this.storageService.getItem('alertsEnabled')) === 'true';
    this.isDarkMode = (await this.storageService.getItem('darkMode')) === 'true';
  
    // ✅ Apply theme
    this.applyTheme();
  }

  // New method to apply the theme
  applyTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  // ✅ Toggle theme
  toggleTheme(event: any) {
    this.isDarkMode = event.detail.checked;
    this.storageService.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();  
  }
  

  async getUserWeather() {
    const location = await this.geoService.getCurrentLocation();
    if (location) {
      this.getWeatherByCoords(location.lat, location.lon);
    } else {
      this.getWeatherByCity('Cebu City'); // Fallback location
    }
  }

  async getWeatherByCoords(lat: number, lon: number) {
    const unit = this.isCelsius ? 'metric' : 'imperial';
    this.currentWeather = await this.weatherService.getWeatherByCoords(lat, lon, unit);
    this.forecast = await this.weatherService.getForecastByCoords(lat, lon, unit);
    this.userLocation = this.currentWeather?.name || 'Unknown';

    this.filterForecast(this.forecast?.list || []);

    this.storageService.setItem('cachedWeather', this.currentWeather);
    this.storageService.setItem('cachedForecast', this.forecast);
  }

  async getWeatherByCity(city: string) {
    const unit = this.isCelsius ? 'metric' : 'imperial';
    this.currentWeather = await this.weatherService.getWeatherByCity(city, unit);
    this.userLocation = city;

    if (this.currentWeather?.coord) {
      const forecastData = await this.weatherService.getForecastByCoords(
        this.currentWeather.coord.lat,
        this.currentWeather.coord.lon,
        unit
      );
      this.filterForecast(forecastData?.list || []);
    }
  }

  filterForecast(forecastList: any[]) {
    // ✅ Get hourly updates only for today
    const today = new Date().getDate();
    this.hourlyForecast = forecastList.filter((item) => new Date(item.dt_txt).getDate() === today);

    this.filteredForecast = forecastList.filter((item) =>
      item.dt_txt.includes('12:00:00')
    );
  }

  // ✅ Toggle Celsius ↔ Fahrenheit
  toggleTemperature() {
    this.isCelsius = !this.isCelsius;
    if (this.currentWeather?.coord) {
      this.getWeatherByCoords(this.currentWeather.coord.lat, this.currentWeather.coord.lon);
    }
  }

  toggleWeatherAlerts(event: any) {
    this.alertsEnabled = event.detail.checked;
    this.storageService.setItem('alertsEnabled', this.alertsEnabled.toString());
  }

  async checkForSevereWeather(weather: any) {
    if (weather.main.temp > 35 || weather.main.temp < 0 || weather.weather[0].main === 'Thunderstorm') {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Severe Weather Alert!',
            body: `Extreme conditions detected: ${weather.weather[0].description}`,
            id: 1,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            smallIcon: 'ic_stat_name',
            iconColor: '#FF0000'
          }
        ]
      });
    }
  }
}