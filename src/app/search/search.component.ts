import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
  }
}
