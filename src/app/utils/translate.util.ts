import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/**
 * Returns translations given their scope
 *
 * @param scope The scope of the translation
 */
export const createTranslateLoader = (scope: string) =>
  (http: HttpClient) => new TranslateHttpLoader(http, `./../assets/i18n/${scope}/`, '.json');
