/**
 * The core valiadtor
 */
export class Validator {

  /**
   * Checks if a string is numeric
   *
   * @param input The input ti verify
   */
  static isNumeric = (input: string): boolean => {

    // Looping through the input's characters
    for (let i = 0; i < input.length; i++) {

      // Getting the character code
      const charCode: number = input.charCodeAt(i);

      // Checking if the character is a number
      if (!(48 <= charCode && charCode <= 57)) {
        return false;
      }
    }

    return true;
  }

  static isValidID = (id: string): boolean => {
    return true;
  }
}
