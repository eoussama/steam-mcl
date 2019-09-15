import { SteamIDTypes } from '../enums/steamidtypes.enum';

/**
 * The seam ID result type
 */
export interface ISteamIDResult {
  id: string;
  input: string;
  type: SteamIDTypes;
}
