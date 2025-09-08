import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';


import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController } from '@ionic/angular';
import { SQLiteService } from '../auth/auth.service'; // <-- our DB service
import { Browser } from '@capacitor/browser';

import { Capacitor } from '@capacitor/core';
 


import { registerPlugin } from '@capacitor/core';
const PaystackPlugin = registerPlugin<PaystackPlugin>('PaystackPlugin');
import { UserService, User } from '../auth/userService'; // <-- our DB service

export interface PaystackPlugin {
  initializePayment(options: { email: string; amount: number }): Promise<{ status: boolean; data: any }>;
  verifyPayment(options: { reference: string }): Promise<{ status: boolean; data: any }>;
  savePayment(options: { payment: any; userId: string }): Promise<void>;
}


const API_URL = "https://ncdttspaystack.netlify.app/api";
host = "https://ncdttspaystack.netlify.app/api";
	


@Component({
  standalone: true, // ✅ ensure this is set
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrls: ['./payment-modal.component.scss'],
  imports: [CommonModule, FormsModule, IonicModule] // ✅ IMPORTS HERE
})

export class PaymentModalComponent {
  email = 'example@gmail.com';
  amount: number = 10;

  constructor( private modalCtrl: ModalController, private router: Router, 
				private http: HttpClient,
				private toastCtrl: ToastController,
				private alertCtrl: AlertController,
				private sqliteService: SQLiteService,
				private userService: UserService,
				private loadingCtrl: LoadingController,
				
				) {}

	//---------------Pay Button--------------------
	async pay() {
		//const userId = localStorage.getItem('user_id') || 'Unknown';
		const userId = this.userService.getcurrentUser()?.id || '';
		
		const platform = Capacitor.getPlatform();

		if (platform === 'web') {
			await this.payAPI(this.email, this.amount, userId);
		}else{
			await this.payPlugin(this.email, this.amount, userId);

		}
	}
	
	
	//---------Close Button--------------------------------
	closePage() {
		this.modalCtrl.dismiss( { refresh: true}  );
	}








	//-------------------------------Use Plugin------------------
	 
	  async payPlugin(email: string, amount: number, userId: string) {
		try {
		  let res;

		  
			// Call native plugin
			res = await PaystackPlugin.initializePayment({ email, amount });
			if (res.status) {
			  const dataObj = JSON.parse(res.data);       // parse the JSON string
			  const checkoutUrl = dataObj.authorization_url;
			  const ref = dataObj.reference;
				//window.open(checkoutUrl, '_system');   // open Paystack checkout
				await Browser.open({ url: checkoutUrl, windowName: '_blank' });


				//Loader
					// Create loading with initial message
					  const loading = await this.loadingCtrl.create({
						message: 'Verifying payment... 20s',
						spinner: 'crescent',
						backdropDismiss: false,
					  });
					  await loading.present();

					let countdown = 20; // seconds
					  const interval = setInterval(() => {
						countdown--;
						loading.message = `Verifying payment... ${countdown}s`;
						if (countdown <= 0) clearInterval(interval);
					  }, 1000);
					  
					  
					  
					  
			  // Wait a few seconds and verify
			  setTimeout(async () => {
				  
				try{
					const verifyRes = await PaystackPlugin.verifyPayment({ reference: ref });
					const verifyData = JSON.parse(verifyRes.data);
					if (verifyRes.status && verifyData.status === "success") {

						
						try{
					  await this.savePayment(verifyData, userId);
					  this.showMessage('✅ Payment successful!', 'success', true);
					  }catch(err: any){ this.showMessage('❌ Payment failed'+err); } 
					}
				}catch(err: any){ this.showMessage('❌ Payment failed'+err); } 
				finally { await loading.dismiss(); }
				
				
			  }, 20000);
			}
		  
			
		  
		} catch (err: any) {
		  this.showMessage('Payment error: ' + err, 'danger', true);
		}
	  }
	  
	  
	  
	  
	  
	  //--------------------------Use API---------------	  
		/*  */
		  //private host = "http://192.168.255.194:5000/api";
		
		  async payAPI(email: string, amount: number, userId: string) {
			  this.initializePayment(this.email, this.amount).subscribe({
				next: async (res) => {
				  if (res.status && res.data.authorization_url) {
					const ref = res.data.reference;

					// open Paystack checkout
					window.open(res.data.authorization_url, '_system');



					//Loader
					// Create loading with initial message
					  const loading = await this.loadingCtrl.create({
						message: 'Verifying payment... 20s',
						spinner: 'crescent',
						backdropDismiss: false,
					  });
					  await loading.present();

					let countdown = 20; // seconds
					  const interval = setInterval(() => {
						countdown--;
						loading.message = `Verifying payment... ${countdown}s`;
						if (countdown <= 0) clearInterval(interval);
					  }, 1000);
					  
					// give user some time, then verify
					setTimeout(() => {
					  this.verifyPayment(ref).subscribe(async (verifyRes) => {
						  
						  try{
						if (verifyRes.status && verifyRes.data.status === "success") {
						  //const userId = localStorage.getItem('user_id') || 'Unknown';
						  await this.savePayment(verifyRes.data, userId);

						  // ✅ success popup
						  //this.showMessage("✅ Payment successful!" + "Your payment was completed successfully.");
						} else {
						  // ❌ failure popup
						  this.showMessage("❌ Payment failed" + "Payment was incomplete or failed. Please try again.");
						}
						
						}catch(err: any){ this.showMessage('❌ Payment failed'+err); } 
						 finally { await loading.dismiss(); }
					  });
					}, 20000); // check after 10s
				  }
				},
				error: (err) => {
				  console.error('Init error', err);
				  this.showMessage("⚠️ Error" + "Could not initialize payment. Please try again later."+JSON.stringify(err));
				},
			  });
			}
		  
		  

		  initializePayment(email: string, amount: number) {
			return this.http.post<any>(`${API_URL}/pay`, { email, amount });
		  }

		  verifyPayment(ref: string) {
			return this.http.get<any>(`${API_URL}/verify/${ref}`);
		  }

	
		//-----------------Save--------------
		
		
		async savePayment(payment: any, userId: string) {
			const stored = await Preferences.get({ key: 'payments' });
			
			const payments = stored.value ? JSON.parse(stored.value) : [];

			payments.push({
			  id: Date.now(),
			  amount: payment.amount / 100,
			  date: new Date().toISOString(),
			  status: payment.status,
			  method: payment.channel,
			  userId,
			});

			await Preferences.set({ key: 'payments', value: JSON.stringify(payments) });
			
			const amount = payment.amount / 100;
			const date = new Date().toISOString()
			
			try{ this.showMessage('Payment recorded. You can refresh your payment history', 'success', true); 
			await this.sqliteService.addPaymentRecord(amount , date, payment.status, payment.channel, userId );
			}catch(err: any){ this.showMessage('❌ Payment recording '+err); } 
		  }
		  
		  
		  
		  
		  
		  
		  
		  
		  
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
			

			if (alsoAlert) {
			  const alert = await this.alertCtrl.create({
				header: 'Payment Status',
				message,
				buttons: [
				  {
					text: 'OK',
					handler: () => {
					  this.closePage(); // navigate to Tab 3
					}
				  }
				],
			  });
			  await alert.present();
			}else{
				await toast.present();
			}
		  }
		
		
		refreshP(){
			//this.tab3.loadPayments()
		}
		
		
		


}
import { LoadingController } from '@ionic/angular';

