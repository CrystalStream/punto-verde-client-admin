import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SectorsRoutesModule } from './sectors.route.module';

import { SectorsComponent } from './sectors.component';

@NgModule({
  declarations: [
  	SectorsComponent
  ],
  imports: [
    CommonModule,
    SectorsRoutesModule
  ]
})
export class SectorsModule { }
