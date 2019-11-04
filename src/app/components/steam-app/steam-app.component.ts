import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-steam-app',
  templateUrl: './steam-app.component.html',
  styleUrls: ['./steam-app.component.scss']
})
export class SteamAppComponent {

  @Input() app: any;

  //#region Constructor

  /**
   * The search component constructor
   */
  constructor() { }

  //#endregion
}
