import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { SearchModule } from './components/search/search.module';
import { DisplayModule } from './components/display/display.module';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SearchModule,
    DisplayModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
