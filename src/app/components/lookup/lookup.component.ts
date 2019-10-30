import { Component, OnInit, OnDestroy } from '@angular/core';

import { SearchService } from 'src/app/services/search.service';

import { ISearchResult } from 'src/app/models/searchresult';
import { ESearchResultTypes } from 'src/app/enums/searchresulttypes.enum';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class LookupComponent implements OnInit, OnDestroy {

  //#region Properties

  /**
   * The loaded content 
   */
  content: ISearchResult;

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
    private searchService: SearchService
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Getting the search results
    const searchResult: ISearchResult = window.history.state['searchResult'] || null;

    // Checking if the search result object is valid
    if (searchResult) {
      this.content = searchResult;
    }

    // Subscribing to the search event
    this.searchSubscription = this.searchService.searchEvent.subscribe((searchResult: ISearchResult) => {
      this.content = searchResult;

      if (searchResult.state === ESearchResultTypes.Success) {
        this.searchService
          .getOwnedGames(searchResult.data['id'])
          .then((games: any) => {
            console.log({ games });
          });
      }
    });
  }

  ngOnDestroy(): void {

    // Unsubscribing from the search event
    this.searchSubscription.unsubscribe();
  }

  //#endregion
}
