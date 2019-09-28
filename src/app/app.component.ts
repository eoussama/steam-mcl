import { Component } from '@angular/core';

import { ISearchResult } from './models/searchresult';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  /**
   * The loading event listener
   *
   * @param loading The loading event object
   */
  seachEventListener(loading: ISearchResult): void {
    console.log({ loading });
  }
}
