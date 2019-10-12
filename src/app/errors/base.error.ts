/**
 * The base error's interface.
 */
interface IBaseError {

  /**
   * The name of the error.
   */
  readonly name: string;

  /**
   * The message of the error.
   */
  message: string;
}


/**
* The base error's class.
*/
export default class BaseError extends Error implements IBaseError {

  //#region Property

  /**
   * The name of the error
   */
  public readonly name: string = 'BaseError';

  /**
   * The message of the error
   */
  public message: string = "Something went wrong!";

  //#endregion

  //#region Constructor

  /**
   * Constructor with parameters
   * 
   * @param message The message of the error
   */
  constructor(message: string) {

    // Calling the parent class
    super();

    // Updating the error's message
    this.message = message.length > 0 ? message : this.message;
  }

  //#endregion
}