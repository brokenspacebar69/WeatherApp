import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  async setItem(key: string, value: any) {
    await Preferences.set({ key, value: JSON.stringify(value) });
  }

  async getItem(key: string): Promise<any> {
    const item = await Preferences.get({ key });
    return item.value ? JSON.parse(item.value) : null;
  }
}
