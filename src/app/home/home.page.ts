import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { WeatherService } from '../services/weather.service';
import { GeolocationService } from '../services/geolocation.service';
import { StorageService } from '../services/storage.service';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  currentWeather: any;
  forecast: any;
  filteredForecast: any[] = [];
  hourlyForecast: any[] = [];  
  userLocation: string = 'Loading...';
  isCelsius: boolean = true; 
  alertsEnabled: boolean = false;
  isDarkMode: boolean = false;
  isOnline: boolean = true;
  networkListener: any;

  constructor(
    private weatherService: WeatherService,
    private geoService: GeolocationService,
    private storageService: StorageService,
    private renderer: Renderer2
  ) {}

  async ngOnInit() {
    this.isOnline = await this.checkNetworkStatus();

    if (this.isOnline) {
      await this.getUserWeather();
    } else {
      this.loadCachedWeather();
    }

    this.alertsEnabled = (await this.storageService.getItem('alertsEnabled')) === 'true';
    this.isDarkMode = (await this.storageService.getItem('darkMode')) === 'true';

    this.applyTheme();

    this.networkListener = Network.addListener('networkStatusChange', async (status) => {
      this.isOnline = status.connected;
      if (this.isOnline) {
        console.log('Back online. Refreshing weather data...');
        await this.getUserWeather();
      }
    });
  }

  applyTheme() {
    if (this.isDarkMode) {
      this.renderer.addClass(document.body, 'dark-mode');
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
    }
  }

  toggleTheme(event: any) {
    this.isDarkMode = event.detail.checked;
    this.storageService.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();  
  }
  
  toggleTemperature() {
    this.isCelsius = !this.isCelsius;

    if (this.isOnline) {
      
      if (this.currentWeather?.coord) {
        this.getWeatherByCoords(this.currentWeather.coord.lat, this.currentWeather.coord.lon);
      }
    } else {
      
      this.loadCachedWeather();
    }
  }
 
  toggleWeatherAlerts(event: any) {
    this.alertsEnabled = event.detail.checked;
    this.storageService.setItem('alertsEnabled', this.alertsEnabled.toString());
  }
  
  async getUserWeather() {
    const location = await this.geoService.getCurrentLocation();
    if (location) {
      this.getWeatherByCoords(location.lat, location.lon);
    } else {
      this.getWeatherByCity('Cebu City'); 
    }
  }

  async getWeatherByCoords(lat: number, lon: number) {
    const celsiusWeather = await this.weatherService.getWeatherByCoords(lat, lon, 'metric');
    const fahrenheitWeather = await this.weatherService.getWeatherByCoords(lat, lon, 'imperial');
    const celsiusForecast = await this.weatherService.getForecastByCoords(lat, lon, 'metric');
    const fahrenheitForecast = await this.weatherService.getForecastByCoords(lat, lon, 'imperial');

    this.currentWeather = this.isCelsius ? celsiusWeather : fahrenheitWeather;
    this.forecast = this.isCelsius ? celsiusForecast : fahrenheitForecast;
    this.userLocation = this.currentWeather?.name || 'Unknown';

    this.filterForecast(this.forecast?.list || []);

    
    this.storageService.setItem('cachedWeatherCelsius', celsiusWeather);
    this.storageService.setItem('cachedWeatherFahrenheit', fahrenheitWeather);
    this.storageService.setItem('cachedForecastCelsius', celsiusForecast);
    this.storageService.setItem('cachedForecastFahrenheit', fahrenheitForecast);
  }

  async getWeatherByCity(city: string) {
    const celsiusWeather = await this.weatherService.getWeatherByCity(city, 'metric');
    const fahrenheitWeather = await this.weatherService.getWeatherByCity(city, 'imperial');
    const celsiusForecast = await this.weatherService.getForecastByCity(city, 'metric');
    const fahrenheitForecast = await this.weatherService.getForecastByCity(city, 'imperial');

    this.currentWeather = this.isCelsius ? celsiusWeather : fahrenheitWeather;
    this.forecast = this.isCelsius ? celsiusForecast : fahrenheitForecast;
    this.userLocation = city;

    this.filterForecast(this.forecast?.list || []);

    
    this.storageService.setItem('cachedWeatherCelsius', celsiusWeather);
    this.storageService.setItem('cachedWeatherFahrenheit', fahrenheitWeather);
    this.storageService.setItem('cachedForecastCelsius', celsiusForecast);
    this.storageService.setItem('cachedForecastFahrenheit', fahrenheitForecast);
  }
  
  filterForecast(forecastList: any[]) {
    const today = new Date().getDate();

    
    this.hourlyForecast = forecastList.filter((item) => new Date(item.dt_txt).getDate() === today);

    
    this.filteredForecast = forecastList.filter((item) =>
      item.dt_txt.includes('12:00:00')
    );
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

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    return status.connected;
  }

  async loadCachedWeather() {
    const cachedWeatherCelsius = await this.storageService.getItem('cachedWeatherCelsius');
    const cachedWeatherFahrenheit = await this.storageService.getItem('cachedWeatherFahrenheit');
    const cachedForecastCelsius = await this.storageService.getItem('cachedForecastCelsius');
    const cachedForecastFahrenheit = await this.storageService.getItem('cachedForecastFahrenheit');

    
    this.currentWeather = this.isCelsius ? cachedWeatherCelsius : cachedWeatherFahrenheit;
    this.forecast = this.isCelsius ? cachedForecastCelsius : cachedForecastFahrenheit;
    this.userLocation = this.currentWeather?.name || 'Unknown';

    if (this.forecast) {
      this.filterForecast(this.forecast.list || []);
    }
  }

  ngOnDestroy() {
    if (this.networkListener) {
      this.networkListener.remove();
    }
  }
}