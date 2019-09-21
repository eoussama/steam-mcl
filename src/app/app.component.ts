import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  /**
   * The loading event listener
   *
   * @param loading The loading state
   */
  loadingEventListener(loading: boolean): void {
    console.log({ loading });
  }
}
