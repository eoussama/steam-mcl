import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';

import { LookupComponent } from './lookup.component';

const routes: Routes = [
  { path: '**', component: LookupComponent }
];

@NgModule({
  declarations: [LookupComponent],
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule.forChild(routes)
  ]
})
export class LookupModule { }
