import { Component,  } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tabs',
  templateUrl: './tuto.page.html',
styleUrls: ["tuto.page.scss"],
  standalone: false,
})
export class TutoPage  {

  
	//currentUser: User  | null = null;
	//userRole = this.currentUser?.role || '';
	//introSeen = this.currentUser?.introSeen ?? false;

  constructor(private router: Router,) {
	//this.refresh();	
  }
	async ngOnInit() {
	  //this.userService.user$.subscribe(user => { this.currentUser = user; this.userRole = user?.role || ''; });
	}
	
	
	
	
	  
  //----------------------------------------



  currentSlide = 0;

  slides = [
    {
      image: 'assets/tutorial/slide1.svg',
      title: 'Choose a Condition',
      description: 'Start by selecting any supported noncommunicable disease (NCD) from the list.',
    },
    {
      image: 'assets/tutorial/slide2.svg',
      title: 'Complete the Form',
      description: 'Answer a few quick questions about symptoms and risk factors.',
    },
    {
      image: 'assets/tutorial/slide3.svg',
      title: 'Submit & Analyze',
      description: 'Our AI model processes your data and predicts your risk score instantly.',
    },
    {
      image: 'assets/tutorial/slide4.svg',
      title: 'Get Your Results',
      description: 'View your personalized risk level and recommended next steps.',
    },
    {
      image: 'assets/tutorial/slide5.svg',
      title: '5 Free Uses',
      description: 'Enjoy 5 free predictions before upgrading for unlimited access and extras.',
    }
  ];
  
  

  
  async nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    } else {
      
	  //await this.sqliteService.setIntroSeen(this.currentUser?.id || '', true)
	  //this.introSeen = true;
		this.router.navigateByUrl('/tabs', { replaceUrl: true });
    }
  }


	
  

}
