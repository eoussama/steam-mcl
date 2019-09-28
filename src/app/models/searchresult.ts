import { ISteamIDResult } from './steamidresult';
import { ESearchResultTypes } from '../enums/searchresulttypes.enum';

/**
 * The search result type
 */
export interface ISearchResult {
    state: ESearchResultTypes,
    error?: any,
    data?: ISteamIDResult
}