import { Component, EventEmitter, Output } from '@angular/core';

import { SearchService } from 'src/app/services/search.service';

import { ISteamIDResult } from 'src/app/models/steamidresult';
import { ISearchResult } from 'src/app/models/searchresult';
import { ESearchResultTypes } from 'src/app/enums/searchresulttypes.enum';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  /**
   * The loading state event emitter
   */
  @Output() searchEvent: EventEmitter<ISearchResult> = new EventEmitter<ISearchResult>();

  constructor(private search: SearchService) { }

  /**
   * The event of the search input
   *
   * @param e The event object
   */
  onSearchChanged(e: Event) {

    // Emitting the loading event
    this.searchEvent.emit({
      state: ESearchResultTypes.Loading
    });

    // Getting the input
    const searchInput = e.target as HTMLInputElement;

    // Getting the value
    const searchTerm = searchInput.value;

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
