import { Component, EventEmitter, Output } from '@angular/core';

import { SearchService } from 'src/app/services/search.service';

import { ISteamIDResult } from 'src/app/models/steamidresult';
import { ISearchResult } from 'src/app/models/searchresult';
import { ESearchResultTypes } from 'src/app/enums/searchresulttypes.enum';
import { collapseAnimation } from 'src/app/animations/searchcollapse';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: collapseAnimation
})
export class SearchComponent {

  //#region Output

  /**
   * The loading state event emitter
   */
  @Output() searchEvent: EventEmitter<ISearchResult> = new EventEmitter<ISearchResult>();

  //#endregion

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
  constructor(private search: SearchService) { }

  //#endregion

  //#region Functions

  /**
   * Gets the proper state of the collapse trigger
   */
  getState = () => this.collapse ? 'closed' : 'opened';

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
      this.searchEvent.emit({
        state: ESearchResultTypes.Loading
      });

      // Updating the collapse state
      this.collapse = true;

      this.search
        .getSteamID(searchTerm)
        .then((res: ISteamIDResult) => {

          // Emitting the loading-success event
          this.searchEvent.emit({
            state: ESearchResultTypes.Success,
            data: res
          });
        })
        .catch((err: string) => {

          // Emitting the loading-fail event
          this.searchEvent.emit({
            state: ESearchResultTypes.Fail,
            error: err
          });
        });
    }
  }

  //#endregion
}
