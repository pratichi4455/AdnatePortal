import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PortalComponent } from './portal/portal.component';
import { AdminComponent } from './admin/admin.component';


const routes: Routes = [
  { path: '', component: PortalComponent },
  { path: 'admin', component: AdminComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
