import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { PortalComponent } from './portal/portal.component';
import { AdminComponent } from './admin/admin.component';




@NgModule({
  declarations: [
    PortalComponent,
    AdminComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
