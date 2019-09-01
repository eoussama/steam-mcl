import { Injectable } from '@angular/core';
import * as SteamAPI from 'steamapi';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  steam: any;

  constructor() {
    this.steam = new SteamAPI(environment.apiKey);
  }

  /**
   * Gets the Steam ID from a search term
   *
   * @param searchTerm The search term
   */
  async getSteamID(searchTerm: string): Promise<number> {
    return await this.steam.resolve(`https://steamcommunity.com/id/${searchTerm}`);
  }
}
