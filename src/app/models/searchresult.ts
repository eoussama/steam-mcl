import { ESearchStates } from '../enums/searchresulttypes.enum';
import { ESearchTypes } from '../enums/searchtypestype.enum';

import { ISearchDetails } from './searchdetail';

/**
 * The search result type
 */
export interface ISearchResult {

    /**
     * The type of the search
     */
    type: ESearchTypes,

    /**
     * The state of the search
     */
    state: ESearchStates,

    /**
     * The details of the search
     */
    details?: ISearchDetails
}