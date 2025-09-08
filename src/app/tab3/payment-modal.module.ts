// payment-modal.module.ts (if exists)
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentModalComponent } from './payment-modal.component';

@NgModule({
  declarations: [PaymentModalComponent],
  imports: [IonicModule, CommonModule, FormsModule],
  exports: [PaymentModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // ✅ Allow Ionic custom elements
})
export class PaymentModalModule {}
