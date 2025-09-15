import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';



import { environment } from '../../environments/environment';

//const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
//const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

@Injectable({ providedIn: 'root' })
export class SQLiteService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient( environment.supabaseUrl, environment.supabaseAnonKey );
  }
  private initialized = false;

	async init() {
    if (this.initialized) return;

    console.log('✅ Supa DB initialized on');
    this.initialized = true;
  }
  // ---------------- USERS ----------------
  async addUser(
    id: string,
    password: string,
    role: string,
    introSeen: number,
    paymentUseCount: number,
    name: string
  ) {
    const { error } = await this.supabase
      .from('users')
      .insert([{ id, password, role, introSeen, paymentUseCount, name }]);
    if (error) throw error;
  }

  async getUser(id: string, password: string, role: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('password', password)
      .eq('role', role)
      .single();
    if (error) return null;
    return data;
  }

  async getAllUsers() {
    const { data, error } = await this.supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
  }

  async setIntroSeen(id: string, value: number) {
    const { error } = await this.supabase
      .from('users')
      .update({ introSeen: value })
      .eq('id', id);
    if (error) throw error;
  }

  async getIntroSeen(id: string, role: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('introSeen')
      .eq('id', id)
      .eq('role', role)
      .single();
    if (error) return null;
    return data;
  }

  // ---------------- PATIENT RECORDS ----------------
  async addPatientRecord(record: {
    userId: string;
    condition: string;
    risk: number;
    date: string;
    formData: any;
  }) {
    const { error } = await this.supabase.from('patient_records').insert([
      {
        user_id: record.userId,
        condition: record.condition,
        risk: record.risk,
        date: record.date,
        form_data: JSON.stringify(record.formData),
      },
    ]);
    if (error) throw error;
  }

  async getPatientRecordById(user_id: string, condition: string) {
    const { data, error } = await this.supabase
      .from('patient_records')
      .select('*')
      .eq('user_id', user_id)
      .eq('condition', condition)
      .single();
    if (error || !data) return null;
    return { ...data, formData: JSON.parse(data.form_data) };
  }

  async getAllPatients() {
    const { data, error } = await this.supabase
      .from('patient_records')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  async deletePatientRecord(user_id: string, condition: string) {
    const { error } = await this.supabase
      .from('patient_records')
      .delete()
      .eq('user_id', user_id)
      .eq('condition', condition);
    if (error) throw error;
  }

  async getPatientCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('patient_records')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  }

  // ---------------- PAYMENTS ----------------
  async addPaymentRecord(
    amount: number,
    date: string,
    status: string,
    method: string,
    user_id: string
  ) {
    const { error } = await this.supabase
      .from('payment_records')
      .insert([{ amount, date, status, method, user_id }]);
    if (error) throw error;
  }

  async getPaymentRecordById(user_id: string) {
    const { data, error } = await this.supabase
      .from('payment_records')
      .select('*')
      .eq('user_id', user_id);
    if (error) throw error;
    return data || [];
  }

  async getPaymentBalanceById(user_id: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('payment_records')
      .select('amount')
      .eq('user_id', user_id);
    if (error) throw error;
    return data?.reduce((sum, row) => sum + (row.amount ?? 0), 0) ?? 0;
  }

  async getPaymentCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('payment_records')
      .select('*', { count: 'exact', head: true });
    if (error) throw error;
    return count ?? 0;
  }

  async getAllPayments() {
    const { data, error } = await this.supabase
      .from('payment_records')
      .select('*');
    if (error) throw error;
    return data || [];
  }

  async setPaymentCountById(id: string, value: number) {
    const { error } = await this.supabase
      .from('users')
      .update({ paymentUseCount: value })
      .eq('id', id);
    if (error) throw error;
  }

  // ---------------- COMMENTS ----------------
  async saveComments(
    doctor_id: string,
    comment: string,
    note: string,
    patient_id: string,
    condition: string,
    date: string
  ) {
    const { error } = await this.supabase.from('comment_records').insert([
      { doctor_id, comment, note, patient_id, condition, date },
    ]);
    if (error) throw error;
  }

  async loadCommentsdByDoctorId(doctor_id: string) {
    const { data, error } = await this.supabase
      .from('comment_records')
      .select('*')
      .eq('doctor_id', doctor_id);
    if (error) throw error;
    return data || [];
  }

  async loadCommentsdByPatientId(patient_id: string, condition: string) {
    const { data, error } = await this.supabase
      .from('comment_records')
      .select('*')
      .eq('patient_id', patient_id)
      .eq('condition', condition);
    if (error) throw error;
    return data || [];
  }

  async loadCommentsdByPatientIdForAllCon(patient_id: string) {
    const { data, error } = await this.supabase
      .from('comment_records')
      .select('*')
      .eq('patient_id', patient_id);
    if (error) throw error;
    return data || [];
  }

  // ---------------- HISTORY ----------------
  async loadHistoryByPatientId(user_id: string) {
    const { data, error } = await this.supabase
      .from('patient_records')
      .select('user_id, condition, risk, date')
      .eq('user_id', user_id)
      .order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // ---------------- ID GEN ----------------
  async generateUniqueUserId(prefix: 'P' | 'D'): Promise<string> {
    let unique = false;
    let userId = '';
    while (!unique) {
      const randomNumber = Math.floor(
        10000000 + Math.random() * 90000000
      ).toString();
      userId = prefix + randomNumber;

      const { data, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', userId);
      if (error) throw error;
      if (!data || data.length === 0) {
        unique = true;
      }
    }
    return userId;
  }
}
