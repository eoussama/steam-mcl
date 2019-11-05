import { IApp } from './app';

/**
 * The user's interface
 */
export interface IUser {

  /**
   * The Steam ID of the user
   */
  steamid: string;

  /**
   * The name of the user
   */
  personaname: string;

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
  timecreated: number | Date;

  /**
   * Last log-off timestamp
   */
  lastlogoff: number | Date;

  /**
   * The apps list
   */
  apps?: IApp[];
}


/**
 * The user's class
 */
export class User {

  //#region Properties

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
  timecreated: Date;

  /**
   * Last log-off timestamp
   */
  lastlogoff: Date;

  /**
   * The apps list
   */
  apps: IApp[];

  //#endregion

  //#region The constructor

  /**
   * Instantiates a new user object
   *
   * @param user The user object
   */
  constructor(user: IUser) {
    this.id = user.steamid;
    this.username = user.personaname;
    this.realname = user.realname;
    this.profileurl = user.profileurl;
    this.avatar = user.avatar;
    this.timecreated = new Date(user.timecreated);
    this.lastlogoff = new Date(user.lastlogoff);
    this.apps = user.apps;
  }

  //#endregion

}