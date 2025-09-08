// src/app/seed-data.ts
import { SQLiteService } from './auth.service';

export async function seedDatabase(sqliteService: SQLiteService) {
  console.log('🌱 Checking if dummy data needs to be seeded...');

  await sqliteService.init();

  // === 1. Add users ===
  const users = await sqliteService.getAllUsers();
  if (users.length === 0) {
    console.log('🌱 Adding dummy users...');
    // 2 doctors
    await sqliteService.addUser('D1001', 'pass123', 'doctor', 1, 0);
    await sqliteService.addUser('D1002', 'pass123', 'doctor', 1, 0);

    // 7 patients
    for (let i = 1; i <= 7; i++) {
      await sqliteService.addUser(`P10${i}`, 'pass123', 'patient', 0, 0);
    }
  }

  // === 2. Add patient records ===
  const patientCount = await sqliteService.getPatientCount();
  if (patientCount < 7) {
    console.log('🌱 Adding dummy patient records...');

    const conditions = ['Hypertension', 'Arthritis', 'Lung Cancer', 'Asthma'];
    const sampleFormData: Record<string, any>[] = [
      // Hypertension example
      {
        id: 1,
        age: 45,
        education: "College graduate",
        sex: "Male",
        is_smoking: "Former smoker",
        cigsPerDay: 0,
        BPMeds: "No",
        prevalentStroke: "No",
        prevalentHyp: "Yes",
        diabetes: "No",
        totChol: 210,
        sysBP: 135,
        diaBP: 85,
        BMI: 27.4,
        heartRate: 75,
        glucose: 95
      },
      // Arthritis example
      {
        General_Health: "Good",
        Checkup: "Within last year",
        Exercise: "3 times/week",
        Heart_Disease: "No",
        Skin_Cancer: "No",
        Other_Cancer: "No",
        Depression: "No",
        Diabetes: "No",
        Arthritis: "Yes",
        Sex: "Female",
        Age_Category: "45-54",
        Height_cm: 165,
        Weight_kg: 68,
        BMI: 25.0,
        Smoking_History: "Never smoked",
        Alcohol_Consumption: "Occasional",
        Fruit_Consumption: "Daily",
        Green_Vegetables_Consumption: "Daily",
        FriedPotato_Consumption: "Rarely"
      },
      // Lung Cancer example
      {
        index: 1,
        "Patient Id": "P999",
        Age: 60,
        Gender: "Male",
        "Air Pollution": "Moderate",
        "Alcohol use": "Occasional",
        "Dust Allergy": "Yes",
        "OccuPational Hazards": "No",
        "Genetic Risk": "Medium",
        "chronic Lung Disease": "Yes",
        "Balanced Diet": "No",
        Obesity: "No",
        Smoking: "Current smoker",
        "Passive Smoker": "No",
        "Chest Pain": "No",
        "Coughing of Blood": "No",
        Fatigue: "Yes",
        "Weight Loss": "No",
        "Shortness of Breath": "Yes",
        Wheezing: "Yes",
        "Swallowing Difficulty": "No",
        "Clubbing of Finger Nails": "No",
        "Frequent Cold": "Yes",
        "Dry Cough": "Yes",
        Snoring: "No",
        Level: "Stage I"
      },
      // Asthma example
      {
        State: "California",
        Sex: "Female",
        GeneralHealth: "Very good",
        PhysicalHealthDays: 2,
        MentalHealthDays: 1,
        LastCheckupTime: "Within past 6 months",
        PhysicalActivities: "Yes",
        SleepHours: 7,
        RemovedTeeth: "No",
        HadHeartAttack: "No",
        HadAngina: "No",
        HadStroke: "No",
        HadAsthma: "Yes",
        HadSkinCancer: "No",
        HadCOPD: "No",
        HadDepressiveDisorder: "No",
        HadKidneyDisease: "No",
        HadArthritis: "No",
        HadDiabetes: "No",
        DeafOrHardOfHearing: "No",
        BlindOrVisionDifficulty: "No",
        DifficultyConcentrating: "No",
        DifficultyWalking: "No",
        DifficultyDressingBathing: "No"
      }
    ];

    // Assign each patient a condition and formData
    for (let i = 1; i <= 7; i++) {
      const conditionIndex = i % conditions.length;
      await sqliteService.addPatientRecord({
        userId: `P10${i}`,
        condition: conditions[conditionIndex],
        risk: Number((Math.random() * 0.8 + 0.1).toFixed(2)), // risk between 0.1 and 0.9
        date: new Date().toISOString().split('T')[0],
        formData: sampleFormData[conditionIndex]
      });
    }
  }
  
  
  // === 3. Add dummy payment records ===
  const paymentCount = await sqliteService.getPaymentCount?.() || 0;
  if (paymentCount < 7) {
    console.log('🌱 Adding dummy payment records...');

    const methods = ['Card', 'Bank Transfer', 'Mobile Money'];
    const statuses = ['success', 'failed', 'pending'];

	await sqliteService.addPaymentRecord(150.00, '2025-08-15T10:30:00Z', 'success', 'Card', '1');
	  await sqliteService.addPaymentRecord(75.50, '2025-08-14T11:00:00Z', 'failed', 'Bank Transfer', '1');
	  await sqliteService.addPaymentRecord(120.75, '2025-08-13T09:45:00Z', 'success', 'Mobile Money', '2');
	  await sqliteService.addPaymentRecord(200.00, '2025-08-12T14:20:00Z', 'pending', 'Card', '2');
	  await sqliteService.addPaymentRecord(180.25, '2025-08-11T16:15:00Z', 'success', 'Bank Transfer', '4');
	  await sqliteService.addPaymentRecord(95.00, '2025-08-10T12:50:00Z', 'failed', 'Mobile Money', '5');
	  await sqliteService.addPaymentRecord(140.00, '2025-08-09T08:30:00Z', 'success', 'Card', '1');

    for (let i = 1; i <= 7; i++) {
      const amount = Number((Math.random() * 200 + 50).toFixed(2)); // random amount 50–250
      const date = new Date(Date.now() - i * 86400000).toISOString(); // past i days
      const status = statuses[i % statuses.length];
      const method = methods[i % methods.length];
      const user_id = `P10${i}`;

      await sqliteService.addPaymentRecord(amount, date, status, method, user_id);
    }
  }
  
  // -------seed comments-----
	// doctor_id, comment, note, patient_id, condition, date
  await sqliteService.saveComments("101", "Continue medication","Blood pressure improving",  "1", "Hypertension", "2025-08-01");
  await sqliteService.saveComments("1", "Suggest lifestyle changes","Patient has mild symptoms",  "2", "Asthma", "2025-08-02");
  await sqliteService.saveComments("2", "Keep monitoring diet","Glucose levels stable",  "2", "Diabetes", "2025-08-03");
  await sqliteService.saveComments("2", "Increase physical activity","Cholesterol still high",  "5", "Cardiovascular", "2025-08-04");

  // Optional: add more comments for variety
  await sqliteService.saveComments("101", "Follow-up scheduled", "Review in 2 weeks", "1", "Hypertension", "2025-08-15");
  await sqliteService.saveComments("103", "Patient reports no side effects", "Continue current dose", "4", "Diabetes", "2025-08-10");

  console.log('✅ Seeding complete');
}
