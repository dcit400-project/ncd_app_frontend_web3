import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestPage } from './test.page';

const routes: Routes = [
  {
    path: '',
    component: TestPage,
 
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
export class TestPageRoutingModule {}
