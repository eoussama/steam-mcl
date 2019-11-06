import { EAppTypes } from '../enums/apptypes';

/**
 * The app's interface
 */
export interface IApp {

  /**
   * The app's Steam ID
   */
  steam_appid: number;

  /**
   * The app's title
   */
  name: string;

  /**
   * The app's description
   */
  about_the_game: string;

  /**
   * The app's type
   */
  type: EAppTypes;

  /**
   * The app's genres
   */
  genres: string[];

  /**
   * The header's picture link
   */
  header_image: string,

  /**
   * The background's picture link
   */
  background: string
}

/**
 * The app's class
 */
export class App {

  //#region Properties

  /**
   * The app's ID
   */
  id: number;

  /**
   * The app's title
   */
  name: string;

  /**
   * The app's description
   */
  description: string;

  /**
   * The app's type
   */
  type: EAppTypes;

  /**
   * The app's genres
   */
  genres: string[];

  /**
   * Media links
   */
  media: {

    /**
     * The header's picture link
     */
    header: string,

    /**
     * The background's picture link
     */
    background: string
  }


  //#endregion

  //#region The constructor

  /**
   * Instantiates a new user object
   *
   * @param app The app object
   */
  constructor(app: IApp) {
    this.id = app.steam_appid;
    this.name = app.name;
    this.description = app.about_the_game;
    this.type = app.type;
    this.genres = app.genres;
    this.media = {
      header: app.header_image,
      background: app.background
    };
  }

  //#endregion

}