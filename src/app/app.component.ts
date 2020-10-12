import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TranslateService } from '@ngx-translate/core';
import { SearchService } from './services/search/search.service';

import { ISearchResult } from './models/searchresult';
import { ESearchTypes } from './enums/searchtypestype.enum';
import { TranslateHelper } from './helpers/translate/translate.helper';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  //#region Constructor

  constructor(
    private router: Router,
    private searchService: SearchService,
    private translate: TranslateService
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Initializing the translation service
    TranslateHelper.init(this.translate);

    // Subscribing to the search service
    this.searchService.searchEvent.subscribe((searchResult: ISearchResult) => {

      // Checking if the search type is that of retrieving/validating the Steam ID
      if ([ESearchTypes.SteamIDRetrieval, ESearchTypes.SteamIDValidation].includes(searchResult.type)) {

        // Getting the search input
        const input = searchResult.details.meta.input || '';

        // Navigating to the lookup page
        this.router.navigate(['lookup', input], { state: { searchResult } });
      }
    });
  }

  //#endregion
}
