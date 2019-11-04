import { EAppTypes } from '../enums/apptypes';

/**
 * The app's interface
 */
export interface IApp {

  /**
   * The app's Steam ID
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
}
