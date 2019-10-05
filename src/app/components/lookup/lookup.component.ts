import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-lookup',
  templateUrl: './lookup.component.html',
  styleUrls: ['./lookup.component.css']
})
export class LookupComponent implements OnInit {

  //#region Constructor

  /**
   * The constructor of the lookup component
   * 
   * @param route The route injector
   */
  constructor(
    private route: ActivatedRoute
  ) { }

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    this.route.url.subscribe(e => {
      console.log({ e });
    });
  }

  //#endregion
}
