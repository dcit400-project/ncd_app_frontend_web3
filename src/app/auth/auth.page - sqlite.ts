import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SQLiteService } from './auth.service'; // <-- our DB service
import { ToastController } from '@ionic/angular';
import { NgZone } from '@angular/core';
import { Toast } from '@capacitor/toast';

import { UserService } from './userService'; // <-- our DB service

import { seedDatabase } from './seed-data';

//declare var nodejs: any;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'], standalone: false
})
export class AuthPage implements OnInit {
  authMode: 'login' | 'signup' = 'login'; 
  authForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  username = '';
  userRole = '';
  introSeen = false;
  uniqueId = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,private zone: NgZone,  private alertController: AlertController,
    private sqliteService: SQLiteService, private toastController: ToastController, private userService: UserService,
  ) {
		this.authForm = this.fb.group({
		  id: [''],
		  password: ['', Validators.required],
		  role: ['patient', Validators.required],
		  intro: ['yes'], 
		  name: [''],
		});
	/*
	
		try{
			this.showError2('Reached BK Block');
			document.addEventListener('deviceready', () => {
			  nodejs.start('server.js'); // Start your Express server
			  this.showError2('Backend is Running', 'success');
			});
		}catch(error:any){  this.showError2('Backend Error'+error); }	*/
  }
  

	
  async ngOnInit() {
    await this.sqliteService.init();
    await this.seedJsonUsers(); // optional: pre-fill with JSON data  
	await seedDatabase(this.sqliteService);
    //this.showError('Welcome');
	/*
	try{
		
			this.showError2('Reached BK Block', 'success');
			document.addEventListener('deviceready', () => {
			  nodejs.start('server.js'); // Start your Express server
			  this.showError2('Backend is Running', 'success');
			});
			
			
			this.showError2('Reached BK Block', 'success');
			 App.addListener('appStateChange', (state: AppState) => {
			  if (state.isActive) {
				console.log("App is active, starting Node server...");
				nodejs.start('server.js'); this.showError2('Backend is Running', 'success');
			  }
			});
		  
			
			
		}catch(error:any){  this.showError2('Backend Error'+error); }	
		
		*/
		
		try {
      const result = await Ttsplugin.speak({ text: "Welcome" });
      console.log(result.message);
    } catch (err) {
      console.error("TTS failed:", err);
    }
 
   
	
	
  }

  async onSubmit() {
    if (!this.authForm.valid) return;

    const { id, password, role, intro, name } = this.authForm.value;

    if (this.authMode === 'login') {
      await this.login(id, password, role, intro);
    } else { 
      await this.signup(name, password, role);  
    }
  }

  /** LOGIN using SQLite */
  async login(id: string, password: string, role: string, intro: string) {
    console.log('🔐 Trying login with:', id, password, role );
    this.errorMessage = '';

    const foundUser = await this.sqliteService.getUser(id, password, role);

    if (foundUser) {
		await this.userService.setCurrentUser(foundUser); 
		  //console.log('Login successful', foundUser);

		  
		  
		  this.userRole = foundUser.role?.trim() || '';
		   /*
		  this.username = foundUser.id;
		  
		  */
		  this.introSeen = foundUser?.introSeen;
		  
		  
		  let introSeen2 = '';
		  if (foundUser?.introSeen == 5){introSeen2 = 'SeenYes'}
		  if (foundUser?.introSeen < 5){introSeen2 = 'SeenNo'}

		 try {
			if (this.userRole.toLowerCase() === 'doctor') {
			  await this.router.navigateByUrl('/tabs', { replaceUrl: true });
			} 
			else if (this.userRole.toLowerCase() === 'patient') {
			  if (introSeen2 === 'SeenNo') {
				//this.showError2('Intro tabs' + introSeen2);
				await this.router.navigateByUrl('/tuto', { replaceUrl: true });
			  } else if (introSeen2 === 'SeenYes') {
				//this.showError2('Intro tuto' + introSeen2);
				await this.router.navigateByUrl('/tabs', { replaceUrl: true });
			  }
			} 
			else {
			  this.showError2(`Unknown user role: ${this.userRole}`);
			}

		  } catch (error: any) {
			console.error('Navigation error NEW:', error);
			this.showError('Navigation error:  NEW ' + (error?.message || error));
		  }

	} else {
	  this.errorMessage = 'Invalid credentials';
	  console.log('User not found');
	  this.showError2('User not found');
	}

  }
	
  /** SIGNUP using SQLite */
	async signup(name: string, password: string, role: string) {
		try{
		  this.errorMessage = '';
		  this.successMessage = '';

		  // check if username already exists
		  const existingUsers = await this.sqliteService.getAllUsers();
		  if (existingUsers.some(u => u.name === name)) {
			this.errorMessage = 'Name already exists';
			this.showError('Error: ' + this.errorMessage);
			return;
		  }

			  // generate unique numeric ID
			if(role === "Patient")
				this.uniqueId = await this.sqliteService.generateUniqueUserId("P");
			else
				this.uniqueId = await this.sqliteService.generateUniqueUserId("D");

		  //  store user with both username + numeric ID
		  await this.sqliteService.addUser(
			this.uniqueId,     // primary login ID
			password,
			role,
			1,
			0,
			name      // save username separately
		  );

		  this.successMessage = `Your login ID is ${this.uniqueId}. Remember it always.`;
		  this.authMode = 'login';
		  this.authForm.reset({ role: 'patient' });

		  const allUsers = await this.sqliteService.getAllUsers();
		  console.log('All users in DB:', allUsers);
		  console.log('ID::'+this.uniqueId);

		  this.showError2('Account Created', 'warning');
		  
		  
		  
		  
		  const alert2 = await this.alertController.create({
			  header: 'Sign-Up Successful',
			  message: this.successMessage,
			  
				buttons: [
				  {
					text: 'Copy ID',
					handler: async () => {
					  await navigator.clipboard.writeText(this.uniqueId);
					  this.showError('ID copied to clipboard!');
					},
				  },
				  {
					text: 'OK',
					role: 'cancel',
				  },
				],
			});
		  
		  
		  
		  
		  
		  
		  await alert2.present(); 
		}catch(err){console.log("Log: ", err)};
	  
	  
	  


			
	}
	

  switchMode() {
    this.authMode = this.authMode === 'login' ? 'signup' : 'login';
    this.errorMessage = '';
    this.successMessage = '';
  }

  /** Optional: Load default JSON users into SQLite (only once) */
  private async seedJsonUsers() {
    const existing = await this.sqliteService.getAllUsers();
    if (existing.length === 0) {
      this.http.get<any[]>('/assets/users.json').subscribe(async (jsonUsers) => {
        for (const u of jsonUsers) {
          await this.sqliteService.addUser(u.id, u.password, u.role, 1, 0, u.name);
        }
        console.log('🌱 Seeded default users into SQLite.');
      });
    }
  }
























  async showError(message: string) {
    const toast = await this.toastController.create({
      message: message || 'Something went wrong!',
      duration: 2000, // show for 3 seconds
      color: 'warning', // red for errors
      position: 'bottom', // top, middle, or bottom
      buttons: [
        {
          text: 'Close',
          role: 'cancel'
        }
      ]
    });
    toast.present();
  }

  async showError2(message: string, color: 'danger' | 'success' | 'warning' | 'primary' = 'danger') {
		const toast = await this.toastController.create({ message, duration: 6000, position: 'bottom' });
		toast.present();
	}
		
	


	
}



interface Ttsplugin {
  speak(options: { text: string }): Promise<{ message: string }>;
}


import { AlertController, } from '@ionic/angular';
import { registerPlugin } from '@capacitor/core';
const Ttsplugin = registerPlugin<any>('Ttsplugin');
