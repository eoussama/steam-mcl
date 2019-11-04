import { Component, Input } from '@angular/core';

import { IApp } from 'src/app/models/app';

@Component({
  selector: 'app-steam-app',
  templateUrl: './steam-app.component.html',
  styleUrls: ['./steam-app.component.scss']
})
export class SteamAppComponent {

  @Input() app: IApp;

  //#region Constructor

  /**
   * The search component constructor
   */
  constructor() { }

  //#endregion
}
