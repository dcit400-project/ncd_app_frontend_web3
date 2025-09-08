import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TutoPage } from './tuto.page';

const routes: Routes = [
  {
    path: '',
    component: TutoPage,
 
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TutoPageRoutingModule {}
