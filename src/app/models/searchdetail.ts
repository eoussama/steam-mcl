import { ESteamIDTypes } from '../enums/steamidtypes.enum';
import BaseError from '../errors/base.error';
import { ISearchMetaData } from './searchmetadata';

/**
 * The Steam ID result type
 */
export interface ISearchDetails {

  /**
   * Meta data about the search
   */
  meta?: ISearchMetaData

  /**
   * The error tied to the search
   */
  error?: BaseError,

  /**
   * The result of the search
   */
  result?: any,
}
