import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { ISteamIDResult } from 'src/app/models/steamidresult';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  constructor(private search: SearchService) { }

  ngOnInit(): void { }

  /**
   * The event of the search input
   *
   * @param e The event object
   */
  onSearchChanged(e: Event) {

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
      });
  }
}
