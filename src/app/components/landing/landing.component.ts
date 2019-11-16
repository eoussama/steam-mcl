import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { TranslateHelper } from 'src/app/helpers/translate/translate.helper';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  //#region Properties

  cards = [
    {
      icon: 'games',
      title: 'Games',
      description: 'Lookup prequels, sequels, spin-offs, and everything related to the games you already own.\
      Putting together a collection has never been easier.'
    },
    {
      icon: 'widgets',
      title: 'DLCs',
      description: 'Lookup missing DLCs for the games you already own by the press of a button. \
      Line up together every piece of extra content of the games you own. Svae up the pain of manually looking \
      them up, and invest more time and energy in enjoying them instead.'
    },
    {
      icon: 'apps',
      title: 'Packages',
      description: 'Lookup packages that your games are part of for easier related content consumption.\
       You never want to bother with manually looking up the games that make your favorite franchise. \
       Have them all reported to you with no more hassle.'
    }
  ];

  //#endregion

  //#region Constructor

  constructor(
    private translate: TranslateService
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Initializing the translation service
    TranslateHelper.init(this.translate);
  }

  //#endregion
}
