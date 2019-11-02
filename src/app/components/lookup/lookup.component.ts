import { Component, OnInit, OnDestroy } from '@angular/core';

import { SearchService } from 'src/app/services/search.service';

import { ISearchResult } from 'src/app/models/searchresult';
import { ESearchStates } from 'src/app/enums/searchresulttypes.enum';
import { Subscription } from 'rxjs';

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
  user: any = {};

  /**
   * The loading progress
   */
  progress: any;

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
    private search: SearchService
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Getting the search results
    const searchResult: ISearchResult = window.history.state['searchResult'] || null;

    // Checking if the search result object is valid
    if (searchResult) {

      // Updating the progress object
      this.progress = {
        state: searchResult.state,
        error: searchResult['details']['error']
      };

      // Checking if the search was successful
      if (searchResult.state === ESearchStates.Success) {

        // Updating the loader user ID
        this.user.id = searchResult['details']['result'];
      }
    }

    // Subscribing to the search event
    this.searchSubscription = this.search.searchEvent.subscribe((searchResult: ISearchResult) => {

      // Checking if the search was successful
      if (searchResult.state === ESearchStates.Success) {

        // Updating the loader user ID
        this.user.id = searchResult['details']['result'];

        // Updating the progress object
        this.progress = {
          state: ESearchStates.Loading
        };

        // Getting the owned games list
        this.search
          .getOwnedGames(this.user.id)
          .then((games: any) => {
            console.log({ games });

            // Updating the progress object
            this.progress = {
              state: ESearchStates.Success
            };
          })
          .catch(() => {

            // Updating the progress object
            this.progress = {
              state: ESearchStates.Failure,
              error: 'err'
            };
          });
      } else {

        // Updating the progress object
        this.progress = {
          state: searchResult.state,
          error: searchResult['details']['error']
        };
      }
    });
  }

  ngOnDestroy(): void {

    // Unsubscribing from the search event
    this.searchSubscription.unsubscribe();
  }

  //#endregion
}
