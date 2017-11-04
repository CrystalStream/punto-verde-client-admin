import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { SectorsComponent } from './sectors.component';

const sectorRoutes: Routes = [
  { path: 'sectors', component: SectorsComponent }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(sectorRoutes)
  ],
  exports: [RouterModule]
})
export class SectorsRoutesModule { }