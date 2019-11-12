import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { LookupComponent } from './lookup.component';
import { SteamAppComponent } from '../steam-app/steam-app.component';

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
    RouterModule.forChild(routes)
  ]
})
export class LookupModule { }
