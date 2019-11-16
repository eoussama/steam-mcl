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

  cards = [];

  //#endregion

  //#region Constructor

  constructor(
    private translate: TranslateService
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Initializing the translation service
    TranslateHelper.init(this.translate)
      .then(() => {

        // Populating the cards' information
        this.cards = [
          {
            icon: 'games',
            title: this.translate.instant('landing.cards.games.title'),
            description: this.translate.instant('landing.cards.games.description')
          },
          {
            icon: 'widgets',
            title: this.translate.instant('landing.cards.dlcs.title'),
            description: this.translate.instant('landing.cards.games.description')
          },
          {
            icon: 'apps',
            title: this.translate.instant('landing.cards.packages.title'),
            description: this.translate.instant('landing.cards.games.description')
          }
        ];
      });
  }

  //#endregion
}
