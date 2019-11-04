/**
 * The app's interface
 */
export interface IApp {

  /**
   * The app's ID
   */
  id: number;

  /**
   * The app's title
   */
  title: string;

  /**
   * The app's description
   */
  description: string;

  /**
   * The app's type
   */
  type: string;

  /**
   * The app's genres
   */
  genres: string[];
}
