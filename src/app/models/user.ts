import { IApp } from './app';

/**
 * The user's interface
 */
export interface IUser {

  /**
   * The Steam ID of the user
   */
  id: string;

  /**
   * The name of the user
   */
  username: string;

  /**
   * The real name of the user
   */
  realname: string;

  /**
   * The profile's url
   */
  profileurl: string;

  /**
   * The avatar's link
   */
  avatar: string;

  /**
   * Creation timestamp
   */
  timecreated: number;

  /**
   * Last log-off timestamp
   */
  lastlogoff: number;

  /**
   * The apps list
   */
  apps: IApp[];
}
