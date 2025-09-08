import { Component, Input } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SQLiteService } from '../../auth/auth.service'; // <-- our DB service
import { UserService, User } from '../../auth/userService'; // <-- our DB service


@Component({
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule] // Added FormsModule for ngModel
})
export class PatientDetailComponent {
  @Input() patient: any;

  activeTab: 'view' | 'comments' = 'view';
  commentToPatient = '';
  noteToSelf = '';

  savedNote: string = '';
savedComment: string = '';

  constructor(private modalCtrl: ModalController,  private sqliteService: SQLiteService,  private userService: UserService) {}

  close() {
    this.modalCtrl.dismiss();
  }
  
    username = ''; userRole = ''; 
	currentUser = this.userService.getcurrentUser();
  
  /*
  saveComments() {
    const storedNotes = JSON.parse(localStorage.getItem('doctorNotes') || '{}');
    const userId = this.patient.user_id;
  
    const existingEntry = storedNotes[userId];
  
    // Convert old object to array format if necessary
    if (existingEntry && !Array.isArray(existingEntry)) {
      storedNotes[userId] = [existingEntry];
    } else if (!existingEntry) {
      storedNotes[userId] = [];
    }
  
    // Now push new comment into the array
    storedNotes[userId].push({
      commentToPatient: this.commentToPatient,
      noteToSelf: this.noteToSelf,
      timestamp: new Date().toISOString(),
      userId: userId
    });
  
    localStorage.setItem('doctorNotes', JSON.stringify(storedNotes));
  
    this.commentToPatient = '';
    this.noteToSelf = '';
  
    this.loadSavedNotes();
    //this.close();
  }
*/


	async saveComments() {
		
		this.username = await this.currentUser?.id || '0';
		
		
	  const storedNotes = JSON.parse(localStorage.getItem('doctorNotes') || '{}');
	  const userId = this.patient.user_id;
	  const doctorId = this.username;  // assuming you have doctor object
	  const date = new Date().toISOString();

	  // Handle localStorage fallback
	  const existingEntry = storedNotes[userId];

	  // Convert old object to array format if necessary
	  if (existingEntry && !Array.isArray(existingEntry)) {
		storedNotes[userId] = [existingEntry];
	  } else if (!existingEntry) {
		storedNotes[userId] = [];
	  }

	  const newNote = {
		commentToPatient: this.commentToPatient,
		noteToSelf: this.noteToSelf,
		timestamp: date,
		userId: userId
	  };

	  // Push into localStorage
	  storedNotes[userId].push(newNote);
	  localStorage.setItem('doctorNotes', JSON.stringify(storedNotes));

	  // Also save into SQLite
	  try {
		await this.sqliteService.saveComments(
		  doctorId,
		  this.commentToPatient,
		  this.noteToSelf,
		  userId, 
		  this.patient.condition,
		  date
		);
		console.log('Comment saved to SQLite');
	  } catch (err) {
		console.error('Failed saving to SQLite:', err);
	  }

	  // Clear inputs
	  this.commentToPatient = '';
	  this.noteToSelf = '';

	  // Reload notes
	  this.loadSavedNotes();
	}

  
  ngOnInit() {
    this.loadSavedNotes();
  }
  
  allNotes: any[] = [];

/*
  loadSavedNotes() {
    const storedNotes = JSON.parse(localStorage.getItem('doctorNotes') || '{}');
    const userId = this.patient.user_id;

    if (storedNotes[userId]) {
      // Load all notes/comments for this patient
      this.allNotes = storedNotes[userId];
      console.log(storedNotes);
    }
  }
*/


	async loadSavedNotes() {
	  const userId = this.patient.user_id;
	  const condition = this.patient.condition;
	  const doctorId = this.username;

	  try {
		// Load from SQLite first
		const sqliteNotes = await this.sqliteService.loadCommentsdByPatientId(userId, condition);
		console.warn('SQLite load === '+userId);

		if (sqliteNotes.length > 0) {
		  // Format them into your component’s note structure
		  this.allNotes = sqliteNotes.map(note => ({
			commentToPatient: note.comment,
			noteToSelf: note.note,
			timestamp: note.date,
			userId: note.patient_id
		  }));
		  return;
		}
	  } catch (err) {
		console.warn('SQLite load error, falling back to localStorage:', err);
	  }

	  // Fallback → Load from localStorage
	  const storedNotes = JSON.parse(localStorage.getItem('doctorNotes') || '{}');
	  this.allNotes = storedNotes[userId] || [];
	}


  deleteNote(index: number) {
    const storedNotes = JSON.parse(localStorage.getItem('doctorNotes') || '{}');
    const userId = this.patient.user_id;
  
    if (storedNotes[userId]) {
      storedNotes[userId].splice(index, 1); // Remove note at index
      localStorage.setItem('doctorNotes', JSON.stringify(storedNotes)); // Save back
  
      // Update the UI
      this.loadSavedNotes();
    }
  }
  

  
}
