import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Scopes } from '../enums/scopes.enum';

/**
 * Returns translations given their scope
 *
 * @param scope The scope of the translation
 */
export const createTranslateLoader = (scope: Scopes) =>
  (http: HttpClient) => new TranslateHttpLoader(http, `./../assets/i18n/${scope}/`, '.json');
