import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from '@capacitor-community/sqlite';



const sqliteConnection = new SQLiteConnection(CapacitorSQLite);

@Injectable({ providedIn: 'root' })
export class SQLiteService {
  public db!: SQLiteDBConnection;
  private initialized = false;
  private readonly dbName = 'authdb';

  constructor() {}

  async init() {
    if (this.initialized) return; // avoid re-init

    // Web setup
    /*if (Capacitor.getPlatform() === 'web') {
      await customElements.whenDefined('jeep-sqlite');
      const jeepEl = document.querySelector('jeep-sqlite');
      if (jeepEl) {
        await sqliteConnection.initWebStore();
        console.log('✅ Web SQLite store initialized');
      }
    }*/

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

    // Create table if not exists
	await this.db.execute(`
	  CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		password TEXT,
		role TEXT,
		introSeen NUMBER DEFAULT 'false'
	  )
	`);

	
	// New key-value table for settings/session data
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
    user_id TEXT PRIMARY KEY,
    condition TEXT,
    risk REAL,
    date TEXT,
    form_data TEXT
  )
`);



    // Save to store on web
	/*
    if (Capacitor.getPlatform() === 'web') {
      await CapacitorSQLite.saveToStore({ database: this.dbName });
    }*/

    console.log('✅ SQLite DB initialized');
    this.initialized = true;
  }

  private async ensureDBOpen() {
    if (!this.db) throw new Error('Database connection not initialized');
    const isOpen = (await this.db.isDBOpen()).result;
    if (!isOpen) {
      await this.db.open();
    }
  }

	async addUser(id: string, password: string, role: string, introSeen: number) {
	  await this.ensureDBOpen();
	  await this.db.run(
		`INSERT INTO users (id, password, role, introSeen) VALUES (?, ?, ?, ?)`,
		[id, password, role, introSeen]
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

	async getPatientRecordById(user_id: string) {
	  await this.ensureDBOpen();
	  const result = await this.db.query(
		`SELECT * FROM patient_records WHERE user_id = ?`,
		[user_id]
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
	  return result.values|| [];
	}

	
	async deletePatientRecord(user_id: string, condition: string) {
	  await this.ensureDBOpen();
	  await this.db.run(
		`DELETE FROM patient_records WHERE user_id = ? AND condition = ?`,
		[user_id, condition]
	  );
	}


	// sqlite.service.ts
	async getPatientCount(): Promise<number> {
	  if (!this.db) throw new Error('Database not initialized');
	  const result = await this.db.query(`SELECT COUNT(*) as count FROM patient_records`);
	  return result.values?.[0]?.count || 0;
	}

	



  
}
