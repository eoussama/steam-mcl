import { ESearchResultTypes } from '../enums/searchresulttypes.enum';

/**
 * The search result type
 */
export interface ISearchResult {
    state: ESearchResultTypes,
    input: string,
    error?: any,
    data?: any
}