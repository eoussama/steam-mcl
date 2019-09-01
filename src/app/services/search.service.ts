import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from './../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private http: HttpClient) { }

  /**
   * Gets the Steam ID from a search term
   *
   * @param searchTerm The search term
   */
  async getSteamID(searchTerm: string): Promise<any> {
    return this.http
      .get(
        `${environment.cors}${environment.apiEndpoint}ISteamUser/ResolveVanityURL/v0001/?key=${environment.apiKey}&vanityurl=${searchTerm}`
      )
      .toPromise();
  }
}
