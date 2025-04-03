import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  async setItem(key: string, value: string) {
    await Preferences.set({ key, value });
  }

  async getItem(key: string): Promise<string | null> {
    const item = await Preferences.get({ key });
    return item.value;
  }
}
