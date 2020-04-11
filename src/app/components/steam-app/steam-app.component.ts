import { Component, Input } from '@angular/core';

import { App } from 'src/app/models/app';

@Component({
  selector: 'app-steam-app',
  templateUrl: './steam-app.component.html',
  styleUrls: ['./steam-app.component.scss']
})
export class SteamAppComponent {

  @Input() app: App;

  //#region Constructor

  /**
   * The search component constructor
   */
  constructor() { }

  //#endregion
}
