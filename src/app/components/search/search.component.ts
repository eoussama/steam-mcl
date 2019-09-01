import { Component, OnInit } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  cards = [
    {
      icon: 'games',
      title: 'Games',
      description: 'Lookup prequesl, sequels, spin-offs and all games that are related to what you already own.'
    },
    {
      icon: 'widgets',
      title: 'DLCs',
      description: 'Lookup missing DLCs for the games you already own.'
    },
    {
      icon: 'apps',
      title: 'Packages',
      description: 'Lookup packages that includes games you already own.'
    }
  ];

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
      .then((data: any) => {
        if (data.response.success === 1) {
          console.log(data.response.steamid);
        } else {
          console.log('failed');
        }
      });
  }
}
