import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { SearchService } from 'src/app/services/search.service';

import { ISteamIDResult } from 'src/app/models/steamidresult';
import { ESearchResultTypes } from 'src/app/enums/searchresulttypes.enum';

import { collapseAnimation } from 'src/app/animations/searchcollapse';

import BaseError from 'src/app/errors/base.error';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  animations: collapseAnimation
})
export class SearchComponent implements OnInit {

  //#region Properties

  /**
   * The search component collapse state
   */
  collapse: boolean = false;

  //#endregion

  //#region View children

  /**
   * The search input's reference
   */
  @ViewChild('searchInputRef', { static: true }) searchInputRef: ElementRef;

  //#endregion

  //#region Constructor

  /**
   * The search component constructor
   * @param search The search service
   */
  constructor(
    private search: SearchService
  ) { }

  //#endregion

  //#region Functions

  /**
   * Gets the proper state of the collapse trigger
   */
  getState = () => this.collapse ? 'closed' : 'opened';

  //#endregion

  //#region Lifecycle

  ngOnInit(): void {

    // Getting the search input
    const searchInput: HTMLInputElement = this.searchInputRef.nativeElement;

    // Getting the current URL
    const url: string = document.location.pathname;

    // Extracting URL fragments
    const urlFragments: string[] = url.split('/').filter((uf: string) => uf.length > 0);
    // Extracting the route name
    const route: string = urlFragments[0] || null;

    // Extracting the Steam ID
    const steamID: string = decodeURIComponent(urlFragments[1]) || null;

    // Checking if the route is pointing to the lookup page
    if (route === 'lookup') {

      // Populating the search input
      searchInput.value = steamID;

      // Firing the change event
      searchInput.dispatchEvent(new Event('change'));
    }
  }

  //#endregion

  //#region Event listeners

  /**
   * The event listener of the search input
   *
   * @param e The event object
   */
  onSearchChanged(e: Event) {

    // Getting the input
    const searchInput: HTMLInputElement = this.searchInputRef.nativeElement;

    // Getting the search term
    const searchTerm = searchInput.value;

    // Checking if the search term is valid
    if (searchTerm && searchTerm.length > 0) {

      // Emitting the loading event
      this.search.searchEvent.emit({
        state: ESearchResultTypes.Loading,
        input: searchTerm
      });

      // Updating the collapse state
      this.collapse = true;

      // Invoking the search function
      this.search
        .getSteamID(searchTerm)
        .then((res: ISteamIDResult) => {

          // Emitting the loading-success event
          this.search.searchEvent.emit({
            state: ESearchResultTypes.Success,
            input: searchTerm,
            data: res
          });
        })
        .catch((err: BaseError) => {

          // Emitting the loading-fail event
          this.search.searchEvent.emit({
            state: ESearchResultTypes.Failure,
            input: searchTerm,
            error: err
          });
        });
    }
  }

  //#endregion
}
