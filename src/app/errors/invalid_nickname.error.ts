/**
 * The error thrown when a nickname is invalid
 */

import BaseError from "./base.error";

export default class InvalidNicknameError extends BaseError {

  //#region Properties

  /**
   * The name of the error
   */
  public name: string = "InvalidNicknameError";

  /**
   * The message of the error
   */
  public message: string = "The nickname is invalid";

  //#endregion

  //#region Constructor

  /**
   * Constructor with parameters
   * 
   * @param message The message of the error
   */
  constructor(message: string) {

    // Calling the parent class
    super('');

    // Updating the error's message
    this.message = message.length > 0 ? message : this.message;
  }

  //#endregion
}