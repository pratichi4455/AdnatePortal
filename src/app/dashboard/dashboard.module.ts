import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Add FormsModule for ngModel

import { DashboardRoutingModule } from './dashboard-routing.module';
import { PortalComponent } from './portal/portal.component';


@NgModule({
  declarations: [
    PortalComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Add it here
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
