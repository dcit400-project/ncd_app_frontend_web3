import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';

// Import jeep-sqlite web component (only used in browser)
import 'jeep-sqlite/dist/jeep-sqlite/jeep-sqlite.esm.js';


const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

@Injectable({ providedIn: 'root' })
export class SQLiteService {
  public db!: SQLiteDBConnection;
  private initialized = false;
  private readonly dbName = 'authdb';

  constructor() {}

  async init() {
    if (this.initialized) return;

    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
		await sqliteConnection.initWebStore();
    }

    // Create or retrieve the connection
    this.db = await sqliteConnection.createConnection(
      this.dbName,
      false,
      'no-encryption',
      1,
      false
    );

    // Open DB
    await this.db.open();

    // Create tables ------------------------------------------
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT UNIQUE PRIMARY KEY,
        password TEXT,
        role TEXT,
        introSeen NUMBER DEFAULT 0,
        paymentUseCount NUMBER DEFAULT 0,
		name TEXT
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS settings (
        user_id TEXT,
        key TEXT,
        value TEXT,
        PRIMARY KEY (user_id, key)
      )
    `);

    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS patient_records (
        user_id TEXT ,
        condition TEXT,
        risk REAL,
        date TEXT,
        form_data TEXT
      )
    `);
	
	await this.db.execute(`
      CREATE TABLE IF NOT EXISTS payment_records (
        amount NUMBER ,
        date TEXT,
        status TEXT,
        method TEXT,
        user_id TEXT 
      )
    `);
	
	await this.db.execute(`
      CREATE TABLE IF NOT EXISTS comment_records (
        patient_id TEXT ,
        doctor_id TEXT,
        comment TEXT,
        note TEXT,
		condition TEXT,
        date TEXT 
      )
    `);

    console.log('✅ SQLite DB initialized on', platform);
    this.initialized = true;
  }

  private async ensureDBOpen() {
    if (!this.db) throw new Error('Database connection not initialized');
    const isOpen = (await this.db.isDBOpen()).result;
    if (!isOpen) {
      await this.db.open();
    }
  }

	async addUser(id: string, password: string, role: string, introSeen: number, paymentUseCount: number, name: string) {
	  await this.ensureDBOpen();
	  await this.db.run(
		`INSERT INTO users (id, name, password, role, introSeen, paymentUseCount) VALUES (?, ?, ?, ?, ?, ?)`,
		[id, name, password, role, introSeen, paymentUseCount]
	  );
	}


  async getUser(id: string, password: string, role: string) {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT * FROM users WHERE id = ? AND password = ? AND role = ?`,
      [id, password, role]
    );
    return result.values?.[0] || null;
  }

  async getAllUsers() {
    await this.ensureDBOpen();
    const result = await this.db.query(`SELECT * FROM users`);
    return result.values || [];
  }

  async setIntroSeen(id: string, value: number) {
    await this.db.run(
      `UPDATE users SET introSeen = ? WHERE id = ?`,
      [value, id]
    );
  }

  async getIntroSeen(id: string, role: string) {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT introSeen FROM users WHERE id = ? AND role = ?`,
      [id, role]
    );
    return result.values?.[0] || null;
  }

  async addPatientRecord(record: {
    userId: string;
    condition: string;
    risk: number;
    date: string;
    formData: any;
  }) {
    await this.ensureDBOpen();
    await this.db.run(
      `INSERT INTO patient_records (user_id, condition, risk, date, form_data)
       VALUES ( ?, ?, ?, ?, ?)`,
      [
        record.userId,
        record.condition,
        record.risk,
        record.date,
        JSON.stringify(record.formData)
      ]
    );
  }

  async getPatientRecordById(user_id: string, condition: string) {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT * FROM patient_records WHERE user_id = ? AND condition = ?`,
      [user_id, condition]
    );
    if (result.values?.[0]) {
      return {
        ...result.values[0],
        formData: JSON.parse(result.values[0].form_data)
      };
    }
    return null;
  }

  async getAllPatients() {
    await this.ensureDBOpen();
    const result = await this.db.query(`SELECT * FROM patient_records`);
    return result.values || [];
  }

  async deletePatientRecord(user_id: string, condition: string) {
    await this.ensureDBOpen();
    await this.db.run(
      `DELETE FROM patient_records WHERE user_id = ? AND condition = ?`,
      [user_id, condition]
    );
  }

  async getPatientCount(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.query(`SELECT COUNT(*) as count FROM patient_records`);
    return result.values?.[0]?.count ?? 0;
  }
  
  
  
  
  
  
  
  
  //------------------Payments
  
  async addPaymentRecord( amount: number , date: string, status: string, method: string, user_id: string ) 
	{
		await this.ensureDBOpen();
		
		await this.db.run(
		  `INSERT INTO payment_records  (amount, date, status, method, user_id) VALUES (?, ?, ?, ?, ?)`,
		  [amount, date, status, method, user_id]
		);
	}
  
  
  
  async getPaymentRecordById(user_id: string) {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT * FROM payment_records WHERE user_id = ?`,
      [user_id]
    );
    return result.values || [];
  }
  
  async getPaymentBalanceById(user_id: string) : Promise<number>  {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT SUM(amount) AS total FROM payment_records WHERE user_id = ?`,
      [user_id]
    );
    return result.values?.[0]?.total ?? 0;
  }
  
   async getPaymentCount(): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    const result = await this.db.query(`SELECT COUNT(*) as count FROM payment_records`);
    return result.values?.[0]?.count ?? 0;
  }
  
   async getAllPayments() {
    await this.ensureDBOpen();
    const result = await this.db.query(`SELECT * FROM payment_records`);
    return result.values || [];
  }
  
  //--------------------------payment-users-------------
    async setPaymentCountById(id: string, value: number) {
    await this.db.run(
      `UPDATE users SET paymentUseCount = ? WHERE id = ?`,
      [value, id]
    );
  }
 /*
  async getPaymentCountById (id: string) {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT * FROM users WHERE id = ?`,
      [id]
    );
	const varia = result[0].paymentUseCount
    return varia;
  }
  */
  
 
  
  //-------comments-----
  async saveComments( doctor_id: string,  comment: string,  note: string, patient_id: string, condition: string, date: string) {
    await this.ensureDBOpen();
    await this.db.run(
		  `INSERT INTO comment_records  (doctor_id, comment, note, patient_id,condition, date) VALUES (?, ?, ?, ?,?, ?)`,
		  [doctor_id, comment, note, patient_id,condition, date]
	);
  }
  
   async loadCommentsdByDoctorId(doctor_id: string) {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT * FROM comment_records WHERE doctor_id = ?`,
      [doctor_id]
    );
    return result.values || [];
  }
  
  async loadCommentsdByPatientId(patient_id: string, condition: string) {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT * FROM comment_records WHERE patient_id = ? AND condition = ?`,
      [patient_id, condition]
    );
    return result.values || [];
  }
  
  async loadCommentsdByPatientIdForAllCon(patient_id: string): Promise<Comment[]> {
    await this.ensureDBOpen();
    const result = await this.db.query(
      `SELECT * FROM comment_records WHERE patient_id = ?`,
      [patient_id]
    );
    return result.values as Comment[]; 
  }
  
  //----------------------ID Gen--------------------
	async generateUniqueUserId(prefix: 'P' | 'D'): Promise<string> {
	  let unique = false;
	  let userId = '';

	  while (!unique) {
		// Generate random 8-digit number
		const randomNumber = Math.floor(10000000 + Math.random() * 90000000).toString();

		// Add prefix (P or D)
		userId = prefix + randomNumber;

		// Check if it already exists
		const result = await this.db.query(
		  `SELECT id FROM users WHERE id = ?`,
		  [userId]
		);

		if (!result.values || result.values.length === 0) {
		  unique = true;
		}
	  }

	  return userId;
	}

	
	
	//--------------------History-------------------
	async loadHistoryByPatientId(user_id: string) {
	  await this.ensureDBOpen();
	  const result = await this.db.query(
		`SELECT user_id, condition, risk, date 
		 FROM patient_records 
		 WHERE user_id = ? 
		 ORDER BY date DESC`,
		[user_id]
	  );
	  return result.values || [];
	}



}
/**/