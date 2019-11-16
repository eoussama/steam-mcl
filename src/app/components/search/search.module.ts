import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { SearchComponent } from './search.component';

import { TranslateHelper } from 'src/app/helpers/translate/translate.helper';
import { Scopes } from 'src/app/enums/scopes.enum';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    TranslateModule.forChild({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHelper.loader(Scopes.Search),
        deps: [HttpClient]
      }
    }),
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  exports: [SearchComponent]
})
export class SearchModule { }
