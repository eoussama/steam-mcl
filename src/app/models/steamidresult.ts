import { ESteamIDTypes } from '../enums/steamidtypes.enum';

/**
 * The Steam ID result type
 */
export interface ISteamIDResult {
  id: string;
  type: ESteamIDTypes;
}
