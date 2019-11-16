import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LookupComponent } from './lookup.component';
import { SteamAppComponent } from '../steam-app/steam-app.component';

import { TranslateHelper } from 'src/app/helpers/translate/translate.helper';
import { Scopes } from 'src/app/enums/scopes.enum';

const routes: Routes = [
  { path: '**', component: LookupComponent }
];

@NgModule({
  declarations: [LookupComponent, SteamAppComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHelper.loader(Scopes.Lookup),
        deps: [HttpClient]
      }
    }),
  ]
})
export class LookupModule { }
