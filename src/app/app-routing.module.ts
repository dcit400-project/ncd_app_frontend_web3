import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'tuto',
    loadChildren: () => import('./tuto/tuto.module').then(m => m.TutoPageModule)
  },
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
    
	//loadChildren: () => import('./test/test.module').then(m => m.TestPageModule) //skip to Test page
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
  },
  
  {
    path: 'test',
    loadChildren: () => import('./test/test.module').then(m => m.TestPageModule)
  },
  
 /*  
  {
	    
    path: 'tabs/tab1',
    loadChildren: () => import('./tab1/tab1.module').then( m =>m.Tab1PageModule )
  },
  {
    path: 'tabs/tab2',
    loadChildren: () => import('./tab2/tab2.module').then( m =>m.Tab2PageModule )
  },               */
  
  // 👇 wildcard route — must be last
  {
    path: '**',
    loadChildren: () => import('./auth/auth.module').then( m => m.AuthPageModule)
   
  },
  
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
