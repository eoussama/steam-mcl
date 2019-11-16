import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { SearchComponent } from './search.component';

@NgModule({
  declarations: [SearchComponent],
  imports: [
    CommonModule,
    RouterModule,
    HttpClientModule,
    TranslateModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule
  ],
  exports: [SearchComponent]
})
export class SearchModule { }
