import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SearchService } from './services/search.service';

import { ISearchResult } from './models/searchresult';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  //#region Constructor

  constructor(
    private router: Router,
    private searchService: SearchService
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Subscribing to the search service
    this.searchService.searchEvent.subscribe((searchResult: ISearchResult) => {

      // Navigating to the lookup page
      this.router.navigate(['lookup', searchResult.input], { state: { searchResult } });
    });
  }

  //#endregion
}
