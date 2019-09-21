import { Component, OnInit, EventEmitter, Output } from '@angular/core';

import { SearchService } from 'src/app/services/search.service';
import { ISteamIDResult } from 'src/app/models/steamidresult';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  /**
   * The loading state event emitter
   */
  @Output() loadingChanged: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private search: SearchService) { }

  /**
   * The event of the search input
   *
   * @param e The event object
   */
  onSearchChanged(e: Event) {

    // Emitting the loading event
    this.loadingChanged.emit(true);

    // Getting the input
    const searchInput = e.target as HTMLInputElement;

    // Getting the value
    const searchTerm = searchInput.value;

    this.search
      .getSteamID(searchTerm)
      .then((res: ISteamIDResult) => {
        console.log(res);
      })
      .catch((err: string) => {
        console.error(err);
      })
      .finally(() => {

        // Emitting the loading event
        this.loadingChanged.emit(false);
      });
  }
}
