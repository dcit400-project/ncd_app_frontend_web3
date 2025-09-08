import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router'; 
import { PopoverController } from '@ionic/angular';
import { MenuController , NavController} from '@ionic/angular';
import { UserService, User } from '../auth/userService'; // <-- our DB service

import { SQLiteService } from '../auth/auth.service'; // <-- our DB service


@Component({ 
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  constructor(private toastController: ToastController, private navCtrl: NavController, private router: Router ,private popoverCtrl: PopoverController, private menuCtrl: MenuController, private modalCtrl: ModalController, private sqliteService: SQLiteService, private userService: UserService,private cdr: ChangeDetectorRef, )
  {  this.loadTheme(); }
  
	
	patients: any[] = []; // full list from DB

	async viewPatient(patient: any) {
	  const fullPatient = await this.sqliteService.getPatientRecordById(patient.user_id, patient.condition); 
	  const modal = await this.modalCtrl.create({
		component: PatientDetailComponent,
		componentProps: { patient: fullPatient || patient },
		breakpoints: [0, 0.5, 0.9],
		initialBreakpoint: 0.9
	  });
	  await modal.present();
	}

	async deletePatient(patient: any) {
	  console.log('Deleting', patient);
	  this.patients = this.patients.filter(p => p.user_id !== patient.user_id);

	  await this.sqliteService.deletePatientRecord(patient.user_id, patient.condition);

	  // Force the UI to refresh
	  this.cdr.detectChanges();
	}

	  
	  trackByIndex(index: number): number { return index ;  }
	  trackByFieldKey(index: number, field: any): string { return field.key ;  }
	  
	  
	  
	  
// Dark Mode Switch---------------------------

	  
	  async toggleTheme() {
		this.isDarkMode = !this.isDarkMode;
		const newTheme = this.isDarkMode ? 'dark' : 'light';
		await Preferences.set({ key: 'theme', value: newTheme });
		this.setTheme(newTheme);
		//this.showToast2(`DARK MODE: ${this.isDarkMode ? 'ON' : 'OFF'}`, 'success');
	  }
	  setTheme(theme: string) {
		document.body.classList.toggle('dark', theme === 'dark');
		this.isDarkMode = theme === 'dark';
	  } 
	  isDarkMode = false; 
// Dark Mode Switch---------------------------
   
	introSeen = true;
	popoverEvent: any ;  
	isPopoverOpen = false ;  
	openPopover(ev: Event) { this.popoverEvent = ev ;    this.isPopoverOpen = true ;  }

	async loadTheme() {
		const { value } = await Preferences.get({ key: 'theme' });
		if (value === 'dark' || value === 'light') { this.setTheme(value); } else {
		  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Use system preference if no saved setting
		  this.setTheme(prefersDark ? 'dark' : 'light');
		}
	}
	
//--------- users ----------------------------------------
  username = ''; userRole = ''; 
  currentUser = this.userService.getcurrentUser();


	async logout() {
	  try {
		console.log('Logging out...');
		await this.userService.clearUser();

		this.currentUser = null;
		this.introSeen = true;
		
		await this.popoverCtrl.dismiss();
	  this.navCtrl.navigateRoot('/auth', { replaceUrl: true });
      this.router.navigateByUrl('/auth',  { replaceUrl: true });

	  } catch (error: any) {
		console.error('Logout error:', error);
	  }
	}
	
	async ngOnInit() {  
	  await this.loadTheme();
	  await this.sqliteService.init();
	  this.filterByDisease('All');

	  this.userService.user$.subscribe(user => {
		this.currentUser = user;
		this.username = user?.id || '';
		this.userRole = user?.role || '';
		//this.introSeen = user?.introSeen ?? false;  // Use ?? false to default
	  });
	  	this.showToast3('Logged In Successfully As: ' + this.username, 'success');	

	}
	
	closeMenu() {
		this.menuCtrl.close() ;  
	}

	async ionViewWillEnter() {
		// const stored =  await this.sqliteService.getAllPatients();   
		this.patients = await this.sqliteService.getAllPatients() ;  
	}
		
	async showToast2(message: string, color: 'danger' | 'success' | 'warning' | 'primary' = 'danger') {
		const toast = await this.toastController.create({ message, duration: 3000, position: 'bottom' });
		toast.present();
	}
	
	async showToast3(message: string, color: 'danger' | 'success' | 'warning' | 'primary' = 'danger') {
    const toast = await this.toastController.create({ message, duration: 3000, position: 'bottom',       // stays anchored to the bottom
      color     // cssClass: 'center-screen-toast',
    });
    toast.present();
  }
	
	//-------------------disease filter------------
	diseases: string[] = ["All", "Hypertension", "Asthma", "Diabetes", "Lung Cancer", "Arthritis"];
	selectedDisease: string = "All";
	filteredPatients: any[] = [];
	
	filterByDisease(disease: string) {
	  this.selectedDisease = disease;
	  if (disease === "All") {
		this.filteredPatients = [...this.patients];
	  } else {
		this.filteredPatients = this.patients.filter(p => p.condition === disease);
	  }
	}
}

import { Preferences } from '@capacitor/preferences';
import { ModalController } from '@ionic/angular';
import { PatientDetailComponent } from './patiend_detail/patient-detail.component'; // Create this
import { ToastController } from '@ionic/angular';

