import { ESearchResultTypes } from '../enums/searchresulttypes.enum';

import BaseError from '../errors/base.error';

/**
 * The search result type
 */
export interface ISearchResult {
    state: ESearchResultTypes,
    input: string,
    error?: BaseError,
    data?: any
}