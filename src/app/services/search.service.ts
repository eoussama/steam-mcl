import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validator } from './../helpers/validator';
import { ISteamIDResult } from '../models/steamidresult';

import { environment } from './../../environments/environment';
import { ESteamIDTypes } from '../enums/steamidtypes.enum';

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
  async getSteamID(searchTerm: string): Promise<ISteamIDResult> {

    // Checking of the input is available
    if (searchTerm.length > 0) {

      // Checking of the input is numeric
      if (Validator.isNumeric(searchTerm)) {

        // Getting the Steam ID validity
        const validity = await this.isValidID(searchTerm);

        // Checking if the Steam ID is valid
        if (validity.response.players.length > 0) {

          return {
            id: searchTerm,
            input: searchTerm,
            type: ESteamIDTypes.ID64
          };
        } else {
          throw new Error();
        }
      } else {

        // Declaring the URL expression
        const regex = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

        // Checking if the input is a valid steam URL
        if (searchTerm.match(regex) !== null) {

          // Parsing the URL
          const url: URL = new URL(searchTerm);

          // Check if the URL is pointing to Steam
          if (url.hostname.includes('steamcommunity')) {

            // Getting the route
            const route: string[] = url
              .pathname
              .split('/')
              .filter((str: string) => str.length > 0);

            // Checking if URL is pointing at id
            if (route[0] === 'id') {

              // Getting the Steam results
              const res: any = await this.getSteamIDFromName(route[1]);

              // Getting the Steam ID
              const steamid: string = res.response.steamid;

              // Checking if the Steam ID is valid
              if (steamid) {

                return {
                  id: steamid,
                  input: searchTerm,
                  type: ESteamIDTypes.ProfileURL
                };
              } else {
                throw new Error();
              }

              // Checking if URL is pointing at profiles
            } else if (route[0] === 'profiles') {

              // Getting the Steam ID validity
              const validity = await this.isValidID(route[1]);

              // Checking if the Steam ID is valid
              if (validity.response.players.length > 0) {

                return {
                  id: route[1],
                  input: searchTerm,
                  type: ESteamIDTypes.ProfilePermalink
                };
              } else {
                throw new Error();
              }
            }
          }
        } else {

          // Getting the Steam results
          const res: any = await this.getSteamIDFromName(searchTerm);

          // Getting the Steam ID
          const steamid: string = res.response.steamid;

          // Checking if the Steam ID is valid
          if (steamid) {

            return {
              id: steamid,
              input: searchTerm,
              type: ESteamIDTypes.Nickname
            };
          } else {
            throw new Error();
          }
        }
      }
    }
  }

  /**
   * Gets the steam ID 64
   *
   * @param input The input to get the steam ID off of
   */
  async getSteamIDFromName(input: number | string): Promise<any> {
    return this.http
      .get(
        `${environment.cors}${environment.apiEndpoint}ISteamUser/ResolveVanityURL/v0001/?key=${environment.apiKey}&vanityurl=${input}`
      )
      .toPromise();
  }

  /**
   * Checkings if a Steam ID is valid
   *
   * @param id The Steam ID to verify
   */
  async isValidID(id: string): Promise<any> {
    return this.http
      .get(
        `${environment.cors}${environment.apiEndpoint}ISteamUser/GetPlayerSummaries/v0002/?key=${environment.apiKey}&steamids=${id}`
      )
      .toPromise();
  }
}
