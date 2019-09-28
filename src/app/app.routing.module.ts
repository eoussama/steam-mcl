import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', loadChildren: () => import('./components/landing/landing.module').then(m => m.LandingModule) },
  { path: 'lookup', loadChildren: () => import('./components/lookup/lookup.module').then(m => m.LookupModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
