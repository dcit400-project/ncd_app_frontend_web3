import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  role: string;
  introSeen: number;
  paymentUseCount: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);

  // Observable to subscribe from components
  user$ = this.userSubject.asObservable();

  // Get current value synchronously
  getcurrentUser(): User | null {
    return this.userSubject.value;
  }
  
  /*
  getUserIntroStatus(): boolean | null {
    return this.userSubject.introSeen;
  }
*/
	setCurrentUser(user: User | null): Promise<void> {
	  this.userSubject.next(user);
	  return Promise.resolve();
	}


  clearUser() {
    this.userSubject.next(null);
  }

}
