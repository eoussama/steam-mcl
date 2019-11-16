import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { Scopes } from 'src/app/enums/scopes.enum';

/**
 * The translation helper
 */
export class TranslateHelper {

  //#region Properties

  /**
   * The current language
   */
  static currentLanguage: string = '';

  //#endregion

  //#region Methods

  /**
   * Initializes the translation service
   */
  static init(translate: TranslateService): void {
    translate.addLangs(['en']);
    translate.setDefaultLang('en');
    translate.use('en');

    TranslateHelper.currentLanguage = translate.currentLang;
  }

  /**
   * Returns translations given their scope
   *
   * @param scope The scope of the translation
   */
  static loader(scope: Scopes): any {
    return (http: HttpClient) => new TranslateHttpLoader(http, `./../assets/i18n/${scope}/`, '.json');
  }

  //#endregion
}
