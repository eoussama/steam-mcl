import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SearchService } from 'src/app/services/search/search.service';

import { User } from 'src/app/models/user';
import { ISearchResult } from 'src/app/models/searchresult';
import { ESearchStates } from 'src/app/enums/searchresulttypes.enum';
import { ESearchTypes } from 'src/app/enums/searchtypestype.enum';
import { EPersonStates } from 'src/app/enums/personstates.enum';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHelper } from 'src/app/helpers/translate/translate.helper';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class LookupComponent implements OnInit, OnDestroy {

  //#region Properties

  /**
   * The Steam user
   */
  user: User;

  /**
   * The loading progress
   */
  currentSearch: ISearchResult;

  /**
   * The active search subscription
   */
  searchSubscription: Subscription;

  //#endregion

  //#region Constructor

  /**
   * The constructor of the lookup component
   *
   * @param route The route injector
   */
  constructor(
    private search: SearchService,
    private translate: TranslateService
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Initializing the translation service
    TranslateHelper.init(this.translate);

    // Getting the search results
    const searchResult: ISearchResult = window.history.state.searchResult || null;

    // Checking if the search result object is valid
    if (searchResult) {

      // Updating the progress object
      this.currentSearch = searchResult;

      // Checking if the search was successful
      if (searchResult.state === ESearchStates.Success) {

        // Updating the loader user ID
        this.user = new User(searchResult.details.result);
      }
    }

    // Subscribing to the search event
    this.searchSubscription = this.search.searchEvent.subscribe((subSearchResult: ISearchResult) => {

      // Updating the progress object
      this.currentSearch = subSearchResult;

      // Checking the search type
      switch (subSearchResult.type) {

        // Steam ID retrieval
        case ESearchTypes.SteamIDRetrieval: {

          // Checking if the search was successful
          if (subSearchResult.state === ESearchStates.Success) {

            // Updating the loading status
            this.currentSearch.state = ESearchStates.Loading;

            // Storing the user's data
            this.user = new User(subSearchResult.details.result);
          }

          break;
        }

        // Steam library  fetch
        case ESearchTypes.SteamLibraryProcess: {

          // Checking if the search was successful
          if (searchResult.state === ESearchStates.Success) {
            this.user.apps = this.currentSearch.details.result;
            console.log(this.user);
          }

          break;
        }
      }
    });
  }

  ngOnDestroy(): void {

    // Unsubscribing from the search event
    this.searchSubscription.unsubscribe();
  }

  //#endregion

  //#region Methods

  /**
   * Gets the appropriate loading message
   * given the type of the search
   *
   * @param type The search's type
   */
  getLoadingMessage = (type: ESearchTypes = this.currentSearch.type): string => [
    'Retrieving the Steam ID',
    'Validating the Steam ID',
    'Fetching the Steam library',
    'Processing the Steam library'
  ][type]

  /**
   * Checks if the loading is finished
   */
  loadingFinished = (): boolean =>
    this.currentSearch.type === ESearchTypes.SteamLibraryProcess
    && this.currentSearch.state !== ESearchStates.Loading

  /**
   * Gets the Steam state for the loaded user
   */
  getSteamState = (state: EPersonStates) => [
    'offline',
    'online',
    'busy',
    'away',
    'snooze',
    'toTrade',
    'toPlay'
  ][state]

  //#endregion
}
