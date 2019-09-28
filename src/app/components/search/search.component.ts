import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SearchService } from 'src/app/services/search.service';

import { ISteamIDResult } from 'src/app/models/steamidresult';
import { ESearchResultTypes } from 'src/app/enums/searchresulttypes.enum';
import { collapseAnimation } from 'src/app/animations/searchcollapse';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: collapseAnimation
})
export class SearchComponent implements OnInit {

  //#region Properties

  /**
   * The search component collapse state
   */
  collapse: boolean = false;

  //#endregion

  //#region Constructor

  /**
   * The search component constructor
   * @param search The search service
   */
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private search: SearchService
  ) { }

  //#endregion

  //#region Functions

  /**
   * Gets the proper state of the collapse trigger
   */
  getState = () => this.collapse ? 'closed' : 'opened';

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {
    this.route.url.subscribe((x) => {
      console.log({ x });
    });
    // Updating the collapse state
    this.collapse = window.location.href.includes('lookup');
  }

  //#endregion

  //#region Event listeners

  /**
   * The event listener of the search input
   *
   * @param e The event object
   */
  onSearchChanged(e: Event) {

    // Getting the input
    const searchTerm = (<HTMLInputElement>e.target).value.trim();

    // Checking if the search term is valid
    if (searchTerm && searchTerm.length > 0) {

      // Emitting the loading event
      this.search.searchEvent.emit({
        state: ESearchResultTypes.Loading
      });

      // Updating the collapse state
      this.collapse = true;

      // Navigating to the lookup page
      this.router.navigate(['lookup']);

      // Invoking the search function
      this.search
        .getSteamID(searchTerm)
        .then((res: ISteamIDResult) => {

          // Emitting the loading-success event
          this.search.searchEvent.emit({
            state: ESearchResultTypes.Success,
            data: res
          });
        })
        .catch((err: string) => {

          // Emitting the loading-fail event
          this.search.searchEvent.emit({
            state: ESearchResultTypes.Fail,
            error: err
          });
        });
    }
  }

  //#endregion
}
