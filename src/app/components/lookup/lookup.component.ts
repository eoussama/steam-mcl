import { Component, OnInit } from '@angular/core';

import { SearchService } from 'src/app/services/search.service';

import { ISearchResult } from 'src/app/models/searchresult';
import { ESearchResultTypes } from 'src/app/enums/searchresulttypes.enum';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.scss']
})
export class LookupComponent implements OnInit {

  //#region Properties

  /**
   * The loaded content 
   */
  content: ISearchResult;

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
    this.searchService.searchEvent.subscribe((searchResult: ISearchResult) => {
      this.content = searchResult;
      console.log({ content: this.content });
    });
  }

  //#endregion
}
