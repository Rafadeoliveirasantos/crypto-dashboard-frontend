import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { routes } from './dashboard.routes';
import { CryptoListComponent } from './crypto-list/crypto-list.component';

import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    FormsModule,
    CryptoListComponent,
    RouterModule.forChild(routes) // <-- Importante!
  ]
})
export class DashboardModule { }