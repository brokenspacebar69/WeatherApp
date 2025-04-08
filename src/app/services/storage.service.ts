import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  async setItem(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async getItem(key: string): Promise<any> {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  }
}
