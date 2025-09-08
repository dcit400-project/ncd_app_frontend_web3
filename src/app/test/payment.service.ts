import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController, AlertController } from '@ionic/angular';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

import { registerPlugin } from '@capacitor/core';
const PaystackPlugin = registerPlugin<PaystackPlugin>('PaystackPlugin');

export interface PaystackPlugin {
  initializePayment(options: { email: string; amount: number }): Promise<{ status: boolean; data: any }>;
  verifyPayment(options: { reference: string }): Promise<{ status: boolean; data: any }>;
  savePayment(options: { payment: any; userId: string }): Promise<void>;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  // Use plugin if available, otherwise fallback to HTTP
  async pay(email: string, amount: number, userId: string) {
    try {
      let res;

      
        // Call native plugin
        res = await PaystackPlugin.initializePayment({ email, amount });
        if (res.status) {
		  const dataObj = JSON.parse(res.data);       // parse the JSON string
		  const checkoutUrl = dataObj.authorization_url;
		  const ref = dataObj.reference;
			window.open(checkoutUrl, '_system');   // open Paystack checkout

          // Wait a few seconds and verify
          setTimeout(async () => {
            const verifyRes = await PaystackPlugin.verifyPayment({ reference: ref });
            if (verifyRes.status && verifyRes.data.status === "success") {
              await this.savePayment(verifyRes.data, userId);
              this.showMessage('✅ Payment successful!', 'success', true);
            } else {
              this.showMessage('❌ Payment failed or incomplete', 'danger', true);
            }
          }, 10000);
        }
      
        
      
    } catch (err: any) {
      this.showMessage('Payment error: ' + err, 'danger', true);
    }
  } 
  
  // Backend Plugin calls
  async initializePayment(email: string, amount: number) {
    return await PaystackPlugin.initializePayment({ email, amount });
  }

  async verifyPayment(ref: string) {
    return await PaystackPlugin.verifyPayment({ reference: ref });
  }
  
  
  
  
  
  
  
  
  /*  
  private host = "http://192.168.255.194:5000/api";

  async payAPI(email: string, amount: number, userId: string) {
    try {
      let res;

      
        // Fallback: call backend API
        res = await this.initializePayment(email, amount).toPromise();
        if (res.status && res.data.authorization_url) {
          const ref = res.data.reference;
          window.open(res.data.authorization_url, '_system');

          setTimeout(async () => {
            const verifyRes = await this.verifyPayment(ref).toPromise();
            if (verifyRes.status && verifyRes.data.status === "success") {
              await this.savePayment(verifyRes.data, userId);
              this.showMessage('✅ Payment successful!', 'success', true);
            } else {
              this.showMessage('❌ Payment failed or incomplete', 'danger', true);
            }
          }, 10000);
        }
      
    } catch (err: any) {
      this.showMessage('Payment error: ' + err, 'danger', true);
    }
  }

  // Backend HTTP calls
  initializePayment(email: string, amount: number) {
    return this.http.post<any>(`${this.host}/pay`, { email, amount }).pipe(
      catchError(async (error) => {
        await this.showMessage("Error: " + (error.error?.error || "Payment failed"), "danger", true);
        return throwError(() => error);
      })
    );
  }

  verifyPayment(ref: string) {
    return this.http.get<any>(`${this.host}/verify/${ref}`).pipe(
      catchError(async (error) => {
        await this.showMessage("Error: " + (error.error?.error || "Verification failed"), "danger", true);
        return throwError(() => error);
      })
    );
  }
*/


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
