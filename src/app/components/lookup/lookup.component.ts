import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SearchService } from 'src/app/services/search.service';

import { ISearchResult } from 'src/app/models/searchresult';
import { ESearchResultTypes } from 'src/app/enums/searchresulttypes.enum';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.css']
})
export class LookupComponent implements OnInit {

  //#region Constructor

  /**
   * The constructor of the lookup component
   * 
   * @param route The route injector
   */
  constructor(
    private router: Router,
    private search: SearchService
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Subscribing to the search event
    this.search.searchEvent.subscribe((searchObj: ISearchResult) => {
      console.log({ searchObj });

      // Cycling through the different loading states
      switch (searchObj.state) {
        case ESearchResultTypes.Loading: {
          break;
        }
        case ESearchResultTypes.Fail: {
          break;
        }
        case ESearchResultTypes.Success: {

          // Navigating to the lookup page
          this.router.navigate(['lookup', searchObj.data.id]);
          break;
        }
      }
    });
  }

  //#endregion
}
