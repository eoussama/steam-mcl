import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

import { AppRoutingModule } from './app.routing.module';
import { SearchModule } from './components/search/search.module';

import { AppComponent } from './app.component';

import { TranslateHelper } from './helpers/translate/translate.helper';
import { Scopes } from './enums/scopes.enum';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      isolate: true,
      loader: {
        provide: TranslateLoader,
        useFactory: TranslateHelper.loader(Scopes.App),
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    SearchModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
