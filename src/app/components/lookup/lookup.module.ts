import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LookupComponent } from './lookup.component';

const routes: Routes = [
  { path: '**', component: LookupComponent }
];

@NgModule({
  declarations: [LookupComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    RouterModule.forChild(routes)
  ]
})
export class LookupModule { }
