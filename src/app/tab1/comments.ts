import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-commentsPage',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-title> Comments </ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" color="light" (click)="close()">
            <ion-icon slot="icon-only" name="close-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding commentsPage-content">
      <ng-container *ngIf="commentsPage && commentsPage.length > 0; else nocommentsPage">

        <ion-list>
          <ion-card class="commentsPage-card" *ngFor="let c of commentsPage">
            <ion-card-header>
              <ion-card-title>
                <p><strong>Doctor:</strong> {{ c.doctor_id }}</p>
              </ion-card-title>
              <ion-card-subtitle>
                {{ c.date | date: 'medium' }}
              </ion-card-subtitle>
            </ion-card-header>

            <ion-card-content>
              
              <p><strong>Comment:</strong> {{ c.comment }}</p>
            </ion-card-content>
          </ion-card>
        </ion-list>
      </ng-container>

      <ng-template #nocommentsPage>
        <ion-text color="medium">
          <p class="ion-text-center">No commentsPage found for this patient.</p>
        </ion-text>
      </ng-template>

      <ion-button expand="block" color="primary" shape="round" (click)="close()">
        Done
      </ion-button>
    </ion-content>
  `,
  styles: [`
    .commentsPage-content {
      --background: #f9fafc;
    }
    .commentsPage-card {
      border-radius: 16px;
      box-shadow: 0 6px 15px rgba(0,0,0,0.1);
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
export class CommentsPageComponent {
  @Input() commentsPage: any; // passed in from parent

  constructor(private modalCtrl: ModalController) {   console.log("Modal received comments:", this.commentsPage); }

  close() {
    this.modalCtrl.dismiss({ refresh: true });
  }
}
