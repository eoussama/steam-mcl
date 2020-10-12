import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Validator } from '../../helpers/validator';

import { environment } from '../../../environments/environment';

import { App } from '../../models/app';
import { IUser } from '../../models/user';
import { ISearchResult } from '../../models/searchresult';
import { ESteamIDTypes } from '../../enums/steamidtypes.enum';
import { ESearchStates } from '../../enums/searchresulttypes.enum';
import { ESearchTypes } from '../../enums/searchtypestype.enum';

import InvalidSteamID64Error from '../../errors/invalid_id64.error';
import InvalidNicknameError from '../../errors/invalid_nickname.error';
import InvalidProfileURLError from '../../errors/invalid_url.error';
import InvalidPermalinkError from '../../errors/invalid_permalink.error';

import BaseError from '../../errors/base.error';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  //#region Events

  /**
   * The search event
   */
  searchEvent: EventEmitter<ISearchResult>;

  /**
   * The state of the search
   */
  searchActivated: boolean;

  //#endregion

  //#region Constructor

  /**
   * The constructor of the search ID service
   *
   * @param http The HTTP object
   */
  constructor(private http: HttpClient) {

    // Initializing the search event
    this.searchEvent = new EventEmitter<ISearchResult>();
  }

  //#endregion

  //#region Functions

  /**
   * Starts the core search
   *
   * @param searchTerm The search term
   */
  start(searchTerm: string): Promise<any> {

    // Getting the Steam ID
    return new Promise(
      (resolve, reject) => {
        this.getSteamID(searchTerm)
          .then(async (user: IUser) => {

            // Checking if the search is active or not
            if (this.searchActivated) {

              // Getting the result
              const result: any = await this.getSteamLevel(user.steamid);

              // Getting the Steam level
              const steamLvl: number = result['response']['player_level'];

              // Setting the Steam level
              user.level = steamLvl;

              // Emitting the Steam ID search result
              this.searchEvent.emit({
                state: ESearchStates.Success,
                type: ESearchTypes.SteamIDRetrieval,
                details: {
                  result: user,
                  meta: { input: searchTerm }
                }
              });

              // Getting the owned apps
              this.getOwnedApps(user.steamid)
                .then((rawApps: any) => {

                  // Emitting the Steam library fetch success event
                  this.searchEvent.emit({
                    state: ESearchStates.Success,
                    type: ESearchTypes.SteamLibraryFetch,
                    details: {
                      result: rawApps,
                      meta: { input: searchTerm }
                    },
                  });

                  // Processing the retrieved apps
                  this.processApps(rawApps['response']['games'])
                    .then((processedApps: App[]) => {

                      // Emitting the Steam library process success event
                      this.searchEvent.emit({
                        state: ESearchStates.Success,
                        type: ESearchTypes.SteamLibraryProcess,
                        details: {
                          result: processedApps,
                          meta: { input: searchTerm }
                        }
                      });

                      // Resolving the promise
                      resolve();
                    })
                    .catch((error: BaseError) => {

                      // Emitting the Steam library process failure event
                      this.searchEvent.emit({
                        state: ESearchStates.Failure,
                        type: ESearchTypes.SteamLibraryProcess,
                        details: {
                          error,
                          meta: { input: searchTerm }
                        }
                      });

                      // Rejecting the promise
                      reject();
                    });
                })
                .catch((error: BaseError) => {

                  // Emitting the Steam library fetch failure event
                  this.searchEvent.emit({
                    state: ESearchStates.Failure,
                    type: ESearchTypes.SteamLibraryFetch,
                    details: {
                      error,
                      meta: { input: searchTerm }
                    }
                  });

                  // Rejecting the promise
                  reject();
                });
            }

          })
          .catch((error: BaseError) => {

            // Checking if the search is active or not
            if (this.searchActivated) {

              // Emitting the Steam ID search failure
              this.searchEvent.emit({
                state: ESearchStates.Failure,
                type: ESearchTypes.SteamIDRetrieval,
                details: {
                  error,
                  meta: { input: searchTerm }
                }
              });
            }

            // Rejecting the promise
            reject();
          });
      });
  }

  /**
   * Gets the Steam ID from a search term
   *
   * @param searchTerm The search term
   */
  async getSteamID(searchTerm: string): Promise<IUser> {

    // Checking of the input is available
    if (searchTerm.length > 0) {

      // Checking of the input is numeric
      if (Validator.isNumeric(searchTerm)) {

        // Getting the Steam ID validity
        const result = await this.isValidID(searchTerm, ESteamIDTypes.ID64);

        // Getting the user's info
        const user = result.response.players[0] as IUser;

        // Checking if the Steam ID is valid
        if (user) {
          return user;
        } else {
          throw new InvalidSteamID64Error(`Steam ID64 “${searchTerm}” is invalid`);
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
              const res: any = await this.getSteamIDFromName(route[1], ESteamIDTypes.ProfileURL);

              // Getting the Steam ID
              const steamid: string = res.response.steamid;

              // Validating the steamid
              const result = await this.isValidID(steamid, ESteamIDTypes.ProfileURL);

              // Getting the user's info
              const user = result.response.players[0] as IUser;

              // Checking if the Steam ID is valid
              if (user) {
                return user
              } else {
                throw new InvalidProfileURLError(`Profile URL “${searchTerm}” is invalid`);
              }

              // Checking if URL is pointing at profiles
            } else if (route[0] === 'profiles') {

              // Getting the Steam ID validity
              const result = await this.isValidID(route[1], ESteamIDTypes.ProfilePermalink);

              // Getting the user's info
              const user = result.response.players[0] as IUser;

              // Checking if the Steam ID is valid
              if (user) {
                return user;
              } else {
                throw new InvalidPermalinkError(`Permalink “${searchTerm}” is invalid`);
              }
            }
          }
        } else {

          // Getting the Steam results
          const res: any = await this.getSteamIDFromName(searchTerm, ESteamIDTypes.Nickname);

          // Getting the Steam ID
          const steamid: string = res.response.steamid;

          // Validating the steamid
          const result = await this.isValidID(steamid, ESteamIDTypes.Nickname);

          // Getting the user's info
          const user = result.response.players[0] as IUser;

          // Checking if the Steam ID is valid
          if (user) {
            return user;
          } else {
            throw new InvalidNicknameError(`The nickname “${searchTerm}” is invalid`);
          }
        }
      }
    }
  }

  /**
   * Gets the Steam ID 64
   *
   * @param input The input to get the steam ID off of
   */
  async getSteamIDFromName(input: number | string, type: ESteamIDTypes): Promise<any> {

    // Emitting the Steam ID search event
    this.searchEvent.emit({
      state: ESearchStates.Loading,
      type: ESearchTypes.SteamIDRetrieval,
      details: {
        meta: { input, type }
      }
    });

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
  async isValidID(id: string, type: ESteamIDTypes): Promise<any> {

    // Emitting the Steam ID validation event
    this.searchEvent.emit({
      state: ESearchStates.Loading,
      type: ESearchTypes.SteamIDValidation,
      details: {
        meta: { input: id, type }
      }
    });

    return this.http
      .get(
        `${environment.cors}${environment.apiEndpoint}ISteamUser/GetPlayerSummaries/v0002/?key=${environment.apiKey}&steamids=${id}`
      )
      .toPromise();
  }

  /**
   * Gets a list of owned games
   * for a specific Steam user
   *
   * @param steamId The Steam ID of the owner
   */
  async getOwnedApps(steamId: string): Promise<any> {

    // Emitting the Steam library fetch event
    this.searchEvent.emit({
      state: ESearchStates.Loading,
      type: ESearchTypes.SteamLibraryFetch
    });

    return this.http
      .get(
        `${environment.cors}${environment.apiEndpoint}IPlayerService/GetOwnedGames/v0001/?key=${environment.apiKey}&steamid=${steamId}&format=json`)
      .toPromise();
  }

  /**
   * Loops through a list of app IDs
   * and retrieves all of their data
   *
   * @param rawApps The list of app IDs to process
   */
  async processApps(rawApps: any[]): Promise<App[]> {
    return new Promise((resolve, reject) => {

      // Emitting the Steam library process event
      this.searchEvent.emit({
        state: ESearchStates.Loading,
        type: ESearchTypes.SteamLibraryProcess
      });

      // Preparing the data list
      const apps: App[] = [];

      // Looping through the apps list
      (rawApps || []).forEach(async (app: string, index: number) => {

        // Getting the app's ID
        const appId: number = app['appid'];

        // Getting the result
        const result = await this.getApp(appId);

        if (result && result[appId]['success']) {

          // Getting the current app's info
          const appInfo: App = new App(result[appId]['data']);

          // Checking the validity of the app
          if (appInfo) {

            // Adding the processed app to the list
            apps.push(appInfo);
          }
        }

        if (index >= (rawApps || []).length - 1) {

          // Returning the processed list
          resolve(apps);
        }
      });
    });
  }

  /**
   * Gets information about
   * a specified app ID
   *
   * @param appId The app ID of the game
   */
  async getApp(appid: number): Promise<any> {
    return this.http
      .get(
        `${environment.cors}//store.steampowered.com/api/appdetails/?appids=${appid}`)
      .toPromise();
  }

  /**
   * Gets a user's Steam ID
   *
   * @param steamId The Steam ID
   */
  async getSteamLevel(steamId: string): Promise<any> {
    return this.http
      .get(
        `${environment.cors}${environment.apiEndpoint}IPlayerService/GetSteamLevel/v1?key=${environment.apiKey}&steamid=${steamId}`)
      .toPromise();
  }

  //#endregion
}
