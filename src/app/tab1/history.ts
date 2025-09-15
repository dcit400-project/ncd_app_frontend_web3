import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-historyPage',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-title> History </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" color="light" (click)="close()">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding history-content">
      <ng-container *ngIf="history && history.length > 0; else nohistory">
       
          <ion-card class="history-card" *ngFor="let h of history">
            <ion-card-header>
              <ion-card-title>
                <p><strong>Disease:</strong> {{ h.condition }}</p>
              </ion-card-title>
              <ion-card-subtitle>
                {{ h.date | date: 'medium' }}
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              <p><strong>Risk Score:</strong> {{ h.risk }}</p>
            </ion-card-content>
          </ion-card>
       
      </ng-container>

      <ng-template #nohistory>
        <ion-text color="medium">
          <p class="ion-text-center">No history records found for this patient.</p>
        </ion-text>
      </ng-template>

      <ion-button expand="block" color="primary" shape="round" (click)="close()">
        Done
      </ion-button>
    </ion-content>
  `,
  styles: [`
    .history-content {
      
    }
    .history-card {
      border-radius: 16px;
     /* box-shadow: 0 6px 15px rgba(0,0,0,0.1);*/
      margin-bottom: 16px;
      animation: fadeInUp 0.3s ease-in-out;
    }
    ion-card-title {
      font-size: 1.2rem;
      font-weight: 600;
       color: var(--ion-color-primary);
    }
    ion-card-subtitle {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
    }
    p {
      margin: 0 0 6px;
      font-size: 0.95rem;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class HistoryPageComponent {
  @Input() history: any;

  constructor(private modalCtrl: ModalController) {}

  close() {
    this.modalCtrl.dismiss({ refresh: true });
  }
}
