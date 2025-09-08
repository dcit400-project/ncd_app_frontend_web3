import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ModalController } from '@ionic/angular';
import { PaymentModalComponent } from './payment-modal.component';
import { PaymentDetailsComponent } from './payment-details.component'; // 👈 we'll create this

import { SQLiteService } from '../auth/auth.service'; // <-- our DB service
import { AlertController , ToastController} from '@ionic/angular';


interface Payment {
  id: number;
  amount: number;
  date: string;
  status: string;
  method: string;
  userId: string;
}

@Component({
  selector: 'app-test',
  templateUrl: 'test.page.html',
  styleUrls: ['test.page.scss'], standalone: false
})
export class TestPage {
  payments: Payment[] = [];
  selectedPayment: Payment | null = null;

  constructor(private modalCtrl: ModalController, private sqliteService: SQLiteService, 
				private alertCtrl: AlertController, private toastCtrl: ToastController,) {}

  async ionViewWillEnter() {
    await this.loadPayments();
  }

  async loadPayments() {
  const userId = localStorage.getItem('user_id') || 'Unknown';

  const stored = await Preferences.get({ key: 'payments' });
  const allPayments = stored.value ? JSON.parse(stored.value) : [];

  //this.payments = allPayments.filter((p: Payment) => p.userId === userId);
  try{
  this.payments = await this.sqliteService.getAllPayments();
  }catch(err){ this.showMessage(' Payments Er '+err); }
  
  //this.showMessage(' Payments = '+ this.payments);
}

/*
  showDetails(payment: Payment) {
    this.selectedPayment = payment;
  }
*/
  closeDetails() {
    this.selectedPayment = null;
  }

  async openPaymentModal() {
    const modal = await this.modalCtrl.create({
      component: PaymentModalComponent,
    });

    modal.onDidDismiss().then(async (res) => {
      if (res.data?.submitted) {
        await this.loadPayments();
      }
    });

    await modal.present();
  }
  
  
  
  async showDetails(payment: any) {
    const modal = await this.modalCtrl.create({
      component: PaymentDetailsComponent,
      componentProps: { payment }
    });
    return await modal.present();
  }
  
  
  //--------------Alert
  
  
	private async showMessage(
		message: string,
		color: 'danger' | 'success' | 'warning' | 'primary' = 'danger',
		alsoAlert = false
	  ) {
		const toast = await this.toastCtrl.create({
		  message,
		  color,
		  duration: 3000,
		  position: 'bottom',
		});
		await toast.present();

		if (alsoAlert) {
		  const alert = await this.alertCtrl.create({
			header: 'Payment Status',
			message,
			buttons: ['OK'],
		  });
		  await alert.present();
		}
	  }
}
