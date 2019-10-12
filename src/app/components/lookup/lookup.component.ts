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
  content: {
    state: ESearchResultTypes,
    input: string
  };

  //#endregion

  //#region Constructor

  /**
   * The constructor of the lookup component
   * 
   * @param route The route injector
   */
  constructor(
    private searchService: SearchService
  ) {

    // Initializing the content
    this.content = {
      state: ESearchResultTypes.Loading,
      input: ''
    };
  }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Getting the search results
    const searchResult: ISearchResult = window.history.state['searchResult'] || null;

    // Checking if the search result object is valid
    if (searchResult) {
      console.log({ searchResult });
      this.content.state = searchResult.state;
      this.content.input = searchResult.input;
    }

    // Subscribing to the search event
    this.searchService.searchEvent.subscribe((searchResult: ISearchResult) => {
      console.log({ searchResult });
      // this.content.state = searchResult.state;
      this.content.input = searchResult.input;
    });
  }

  //#endregion
}
