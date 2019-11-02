import { ESteamIDTypes } from '../enums/steamidtypes.enum';
import BaseError from '../errors/base.error';

/**
 * The Steam ID result type
 */
export interface ISearchDetails {
  error?: BaseError,
  result?: any,
  meta?: any
}
