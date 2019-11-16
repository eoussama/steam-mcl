import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { LandingComponent } from './landing.component';

import { TranslateHelper } from 'src/app/helpers/translate/translate.helper';
import { Scopes } from 'src/app/enums/scopes.enum';

const routes: Routes = [
  { path: '', component: LandingComponent }
];

@NgModule({
  declarations: [LandingComponent],
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHelper.loader(Scopes.Landing),
        deps: [HttpClient]
      }
    }),
  ]
})
export class LandingModule { }
