import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { Scopes } from 'src/app/enums/scopes.enum';

/**
 * The translation helper
 */
export class TranslateHelper {

  /**
   * Returns translations given their scope
   *
   * @param scope The scope of the translation
   */
  static loader(scope: Scopes) {
    return (http: HttpClient) => new TranslateHttpLoader(http, `./../assets/i18n/${scope}/`, '.json');
  }
}
