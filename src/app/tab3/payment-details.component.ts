import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';


@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar >
        <ion-title>💳 Payment Details</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" color="light" (click)="close()">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding receipt-content">
      <ion-card class="receipt-card">
        <ion-card-header>
          <ion-card-title class="amount">
            ₵{{ payment?.amount }}
          </ion-card-title>
          <ion-card-subtitle>
            {{ payment?.date }}
          </ion-card-subtitle>
        </ion-card-header>

        <ion-card-content>
          <ion-list lines="none">
            <ion-item>
              <ion-label>
                <h3>Status</h3>
                <p [ngClass]="payment?.status === 'Success' ? 'success' : 'failed'">
                  {{ payment?.status }}
                </p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>Payment Method</h3>
                <p>{{ payment?.method }}</p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-label>
                <h3>ID</h3>
                <p>{{ payment?.user_id }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <ion-button expand="block" color="success" shape="round" (click)="close()">
        Done
      </ion-button>
    </ion-content>
  `,
  styles: [`
    .custom-header {
      --background: #4da6ff; /* lighter blue */
      --color: white;
      border-radius: 0 0 20px 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .receipt-card {
      border-radius: 20px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
      animation: fadeInUp 0.3s ease-in-out;
    }
    .amount {
      font-size: 2rem;
      font-weight: bold;
      color: var(--ion-color-success);
      text-align: center;
    }
    ion-card-subtitle {
      text-align: center;
      font-size: 0.9rem;
      color: var(--ion-color-medium);
    }
    .success {
      color: var(--ion-color-success);
      font-weight: bold;
    }
    .failed {
      color: var(--ion-color-danger);
      font-weight: bold;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})



export class PaymentDetailsComponent {
  @Input() payment: any; // receives the clicked payment

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss({ refresh: true });
  }
}
