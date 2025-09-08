import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { ModalController } from '@ionic/angular';
import { PaymentModalComponent } from './payment-modal.component';
import { PaymentDetailsComponent } from './payment-details.component'; // 👈 we'll create this

import { SQLiteService } from '../auth/auth.service'; // <-- our DB service
import { AlertController , ToastController} from '@ionic/angular';
import { UserService, User } from '../auth/userService'; // <-- our DB service


interface Payment {
  amount: number;
  date: string;
  status: string;
  method: string;
  user_id: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'], standalone: false
})
export class Tab3Page {
  payments: Payment[] = [];
  selectedPayment: Payment | null = null;

  constructor(private modalCtrl: ModalController, private sqliteService: SQLiteService, 
  private userService: UserService,
				private alertCtrl: AlertController, private toastCtrl: ToastController,) {}

  async ionViewWillEnter() {
    await this.loadPayments();
  }

  public async loadPayments() {

  //const userId = localStorage.getItem('user_id') || 'Unknown';
  const userId = this.userService.getcurrentUser()?.id || '';

  const stored = await Preferences.get({ key: 'payments' });
  const allPayments = stored.value ? JSON.parse(stored.value) : [];

  //this.payments = allPayments.filter((p: Payment) => p.userId === userId);
  
  try{
  //this.payments = await this.sqliteService.getAllPayments();
  this.payments = await this.sqliteService.getPaymentRecordById(userId);
  }catch(err){ this.showMessage(' Payments Er '+err); }
  
  //this.showMessage(' Payments = '+ JSON.stringify(this.payments));
  
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
	  
	  
	    try{
    const modal = await this.modalCtrl.create({
      component: PaymentModalComponent,
    });

    modal.onDidDismiss().then(async (res) => {
      if (res.data?.submitted) {
		  
		 
        await this.loadPayments();
		 
      }
    });

    await modal.present();
	
	}catch(err){ this.showMessage(' Payments Er '+err); }
  }
  
  
  
  async showDetails(payment: any) {
    const modal = await this.modalCtrl.create({
      component: PaymentDetailsComponent,
      componentProps: { payment }
    });
	
	   modal.onDidDismiss().then(async (res) => {
		// if modal signals refresh, reload payments
		if (res.data?.refresh) {
		  await this.loadPayments();
		}
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
