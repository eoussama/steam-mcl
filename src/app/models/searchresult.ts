import { ESearchStates } from '../enums/searchresulttypes.enum';
import { ESearchTypes } from '../enums/searchtypestype.enum';

import { ISearchDetails } from './searchdetail';

/**
 * The search result type
 */
export interface ISearchResult {
    type: ESearchTypes,
    state: ESearchStates,
    details?: ISearchDetails
}