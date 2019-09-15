import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {

  // The cards
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
}
