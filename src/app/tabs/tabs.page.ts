import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { UserService, User } from '../auth/userService'; // <-- our DB service

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
styleUrls: ["tabs.page.scss"],
  standalone: false,
})
export class TabsPage implements AfterViewInit {
@ViewChild('tabs', { static: true }) tabs!: IonTabs;

  
	currentUser: User  | null = null;
	userRole = this.currentUser?.role || '';
	introSeen = this.currentUser?.introSeen ?? false;

  constructor(private userService: UserService,) {
	//this.refresh();	
  }
	async ngOnInit() {
	  this.userService.user$.subscribe(user => { this.currentUser = user; this.userRole = user?.role || ''; });
	}
	
	ngAfterViewInit() {
		if (this.userRole.toLowerCase() === 'doctor') {
		  this.tabs.select('tab2');  // Select tab2 explicitly for Doctor
		} else {
		  this.tabs.select('tab1');  // Select tab1 for Patient
		}
	}
	
	
	


	
  

}
