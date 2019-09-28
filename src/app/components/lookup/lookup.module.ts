import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { LookupComponent } from './lookup.component';

const routes: Routes = [
  { path: '**', component: LookupComponent }
];

@NgModule({
  declarations: [LookupComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LookupModule { }
