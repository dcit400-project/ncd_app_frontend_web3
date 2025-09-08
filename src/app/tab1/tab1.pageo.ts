import { Component, NgZone } from '@angular/core'; 
import { AlertController,  } from '@ionic/angular'; import { HttpClient } from '@angular/common/http';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ["tab1a.page.scss","tab1b.page.scss", "tab1c.page.scss", "tab1d.page.scss", "tab1e.page.scss", "tab1f.page.scss", "tab1g.page.scss", "tab1h.page.scss", "tab1j.page.scss" ],
  standalone: false,
})
export class Tab1Page {

  diseases = [
    { id: 0, name: 'Hypertension' },
    { id: 1, name: 'Arthritis' },
    { id: 2, name: 'Lung_Cancer' },
    { id: 3, name: 'Asthma' },
    { id: 4, name: 'Diabetes' },
  ];
  activeDisease: number | null = null;

  trackByIndex(index: number): number {
    return index;
  }

  allFields: Field[] = [];
  formData: Record<string, any> = {};  // Collect user responses deleted items cuz initFormData and allFields will fill it
  pages: { title: string; fields: Field[] }[] = []; currentPage = 0; /** Break the fields into pages of 5 questions each */ 
  private hypertensionFields: { title: string; fields: Field[]; }[] = [
    {
      title: 'Demographics',
      fields: [
        { key: 'age', label: 'Age', type: 'number' },
        { key: 'sex', label: 'Sex', type: 'select', options: ['Female', 'Male'], map: { Female: 1, Male: 0 } }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'is_smoking', label: 'Do you currently smoke?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'cigsPerDay', label: 'Cigarettes Per Day', type: 'number' }
      ]
    },
    {
      title: 'Medical History',
      fields: [
        { key: 'BPMeds', label: 'Currently on Blood Pressure Meds?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'prevalentStroke', label: 'History of Stroke?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'prevalentHyp', label: 'Previously Diagnosed Hypertension?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'diabetes', label: 'Diagnosed with Diabetes?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Clinical Measurements',
      fields: [
        { key: 'totChol', label: 'Total Cholesterol (mg/dL)', type: 'number' },
        { key: 'sysBP', label: 'Systolic Blood Pressure (mm Hg)', type: 'number' },
        { key: 'diaBP', label: 'Diastolic Blood Pressure (mm Hg)', type: 'number' },
        { key: 'BMI', label: 'Body Mass Index (BMI)', type: 'number' },
        { key: 'heartRate', label: 'Heart Rate (bpm)', type: 'number' },
        { key: 'glucose', label: 'Fasting Glucose Level (mg/dL)', type: 'number' }
      ]
    }
  ];
  
  private arthritisFields: { title: string; fields: Field[] }[] = [
    {
      title: 'Demographics',
      fields: [
        {
          key: 'Sex',
          label: 'Sex',
          type: 'select',
          options: ['Male', 'Female'],
          map: { Male: 1, Female: 0 }
        },
        {
          key: 'Age_Category',
          label: 'Age category',
          type: 'select',
          options: [
            '18-24', '25-29', '30-34', '35-39', '40-44', '45-49',
            '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80 or older'
          ],
          map: {
            '18-24': 0, '25-29': 1, '30-34': 2, '35-39': 3, '40-44': 4,
            '45-49': 5, '50-54': 6, '55-59': 7, '60-64': 8,
            '65-69': 9, '70-74': 10, '75-79': 11, '80 or older': 12
          }
        }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        {
          key: 'Checkup',
          label: 'Do you go for health checkups?',
          type: 'select',
          options: ['Yes', 'No'],
          map: { Yes: 1, No: 0 }
        },
        {
          key: 'Exercise',
          label: 'Do you exercise regularly?',
          type: 'select',
          options: ['Yes', 'No'],
          map: { Yes: 1, No: 0 }
        },
        {
          key: 'Smoking_History',
          label: 'Smoking history',
          type: 'select',
          options: ['Never', 'Former', 'Current'],
          map: { 'Never': 0, 'Former': 1, 'Current': 2 }
        },
        {
          key: 'Alcohol_Consumption',
          label: 'Alcohol consumption (per week)',
          type: 'number'
        }
      ]
    },
    {
      title: 'Body Measurements',
      fields: [
        { key: 'Height_cm', label: 'Height (cm)', type: 'number' },
        { key: 'Weight_kg', label: 'Weight (kg)', type: 'number' },
        { key: 'BMI', label: 'Body Mass Index', type: 'number' }
      ]
    },
    {
      title: 'Dietary Habits',
      fields: [
        { key: 'Fruit_Consumption', label: 'Fruit consumption (per week)', type: 'number' },
        { key: 'Green_Vegetables_Consumption', label: 'Green vegetable consumption (per week)', type: 'number' },
        { key: 'FriedPotato_Consumption', label: 'Fried potato consumption (per week)', type: 'number' }
      ]
    },
    {
      title: 'Medical History',
      fields: [
        {
          key: 'Diabetes',
          label: 'Diagnosed with diabetes?',
          type: 'select',
          options: ['Yes', 'No'],
          map: { Yes: 1, No: 0 }
        },
        {
          key: 'Skin_Cancer',
          label: 'Diagnosed with skin cancer?',
          type: 'select',
          options: ['Yes', 'No'],
          map: { Yes: 1, No: 0 }
        },
        {
          key: 'Other_Cancer',
          label: 'Diagnosed with any other cancer?',
          type: 'select',
          options: ['Yes', 'No'],
          map: { Yes: 1, No: 0 }
        }
      ]
    }
  ];
  
  
  
  
  private lungCancerFields: { title: string; fields: Field[] }[] = [
    {
      title: 'Demographics',
      fields: [
        { key: 'Age', label: 'Age', type: 'number' },
        { key: 'Gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], map: { Male: 1, Female: 0 } }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'Air_Pollution', label: 'Exposed to air pollution?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Alcohol_use', label: 'Alcohol use?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Dust_Allergy', label: 'Dust allergy?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'OccuPational_Hazards', label: 'Occupational hazards?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Genetic_Risk', label: 'Genetic risk?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Balanced_Diet', label: 'Follows a balanced diet?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Obesity', label: 'Obesity present?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Smoking', label: 'Smoker?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Passive_Smoker', label: 'Passive smoker?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Medical History',
      fields: [
        { key: 'chronic_Lung_Disease', label: 'Chronic lung disease?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Symptoms',
      fields: [
        { key: 'Chest_Pain', label: 'Chest pain?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Coughing_of_Blood', label: 'Coughing blood?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Fatigue', label: 'Fatigue?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Weight_Loss', label: 'Unexplained weight loss?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Shortness_of_Breath', label: 'Shortness of breath?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Wheezing', label: 'Wheezing?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Swallowing_Difficulty', label: 'Swallowing difficulty?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Clubbing_of_Finger_Nails', label: 'Clubbing of nails?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Frequent_Cold', label: 'Frequent colds?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Dry_Cough', label: 'Dry cough?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'Snoring', label: 'Snoring?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    }
  ];
  
  
  private asthmaFields: { title: string; fields: Field[] }[] = [
    {
      title: 'Demographics',
      fields: [
        { key: 'Sex', label: 'Sex', type: 'select', options: ['Male', 'Female'], map: { Male: 1, Female: 0 } },
        {
          key: 'RaceEthnicityCategory',
          label: 'Race/ethnicity category',
          type: 'select',
          options: [
            'Multiracial, Non-Hispanic',
            'Other race only, Non-Hispanic',
            'Black only, Non-Hispanic',
            'Hispanic',
            'White only, Non-Hispanic'
          ],
          map: {
            'Multiracial, Non-Hispanic': 0,
            'Other race only, Non-Hispanic': 1,
            'Black only, Non-Hispanic': 2,
            'Hispanic': 3,
            'White only, Non-Hispanic': 4
          }
        },
        {
          key: 'AgeCategory',
          label: 'Age category',
          type: 'select',
          options: [
            'Age 18 to 24', 'Age 25 to 29', 'Age 30 to 34', 'Age 35 to 39',
            'Age 40 to 44', 'Age 45 to 49', 'Age 50 to 54', 'Age 55 to 59',
            'Age 60 to 64', 'Age 65 to 69', 'Age 70 to 74', 'Age 75 to 79', 'Age 80 or older'
          ],
          map: {
            'Age 18 to 24': 0, 'Age 25 to 29': 1, 'Age 30 to 34': 2, 'Age 35 to 39': 3,
            'Age 40 to 44': 4, 'Age 45 to 49': 5, 'Age 50 to 54': 6, 'Age 55 to 59': 7,
            'Age 60 to 64': 8, 'Age 65 to 69': 9, 'Age 70 to 74': 10, 'Age 75 to 79': 11, 'Age 80 or older': 12
          }
        }
      ]
    },
    {
      title: 'General Health',
      fields: [
        { key: 'PhysicalHealthDays', label: 'Physical health days (last 30)', type: 'number' },
        { key: 'MentalHealthDays', label: 'Mental health days (last 30)', type: 'number' },
        {
          key: 'LastCheckupTime',
          label: 'Months since last check‑up',
          type: 'select',
          options: [
            '5 or more years ago',
            'Within past 5 years (2 years but less than 5 years ago)',
            'Within past 2 years (1 year but less than 2 years ago)',
            'Within past year (anytime less than 12 months ago)'
          ],
          map: {
            '5 or more years ago': 0,
            'Within past 5 years (2 years but less than 5 years ago)': 1,
            'Within past 2 years (1 year but less than 2 years ago)': 2,
            'Within past year (anytime less than 12 months ago)': 3
          }
        },
        { key: 'SleepHours', label: 'Average sleep hours', type: 'number' },
        { key: 'RemovedTeeth', label: 'Teeth removed due to decay', type: 'select', options: ['All', '6 or more, but not all', '1 to 5', 'None of them'], map: { 'All': 3, '6 or more, but not all': 2, '1 to 5': 1, 'None of them': 0 } }
      ]
    },
    {
      title: 'Disability & Limitations',
      fields: [
        { key: 'DeafOrHardOfHearing', label: 'Deaf / hard of hearing', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'BlindOrVisionDifficulty', label: 'Blind or vision difficulty', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'DifficultyConcentrating', label: 'Difficulty concentrating or remembering', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'DifficultyWalking', label: 'Difficulty walking or climbing stairs', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'DifficultyDressingBathing', label: 'Difficulty dressing or bathing', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'DifficultyErrands', label: 'Difficulty doing errands alone', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'PhysicalActivities', label: 'Weekly physical activity (mins)', type: 'number' },
        {
          key: 'SmokerStatus',
          label: 'Current smoker?',
          type: 'select',
          options: [
            'Never smoked',
            'Former smoker',
            'Current smoker - now smokes some days',
            'Current smoker - now smokes every day'
          ],
          map: {
            'Never smoked': 0,
            'Former smoker': 1,
            'Current smoker - now smokes some days': 2,
            'Current smoker - now smokes every day': 3
          }
        },
        {
          key: 'ECigaretteUsage',
          label: 'E-cigarette usage',
          type: 'select',
          options: [
            'Never used e-cigarettes in my entire life',
            'Not at all (right now)',
            'Use them some days',
            'Use them every day'
          ],
          map: {
            'Never used e-cigarettes in my entire life': 0,
            'Not at all (right now)': 1,
            'Use them some days': 2,
            'Use them every day': 3
          }
        },
        { key: 'AlcoholDrinkers', label: 'Currently drinks alcohol?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Medical History',
      fields: [
        { key: 'HadAngina', label: 'Ever had angina?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadStroke', label: 'Ever had a stroke?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadHeartAttack', label: 'Do you have heart attacks?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadCOPD', label: 'Diagnosed with COPD?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadDepressiveDisorder', label: 'Diagnosed with depressive disorder?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadArthritis', label: 'Diagnosed with arthritis?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadKidneyDisease', label: 'Do you have a Kidney Disease?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadSkinCancer', label: 'Do you have Skin Cancer?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadDiabetes', label: 'Diagnosed with diabetes?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Vaccination & Screening',
      fields: [
        { key: 'ChestScan', label: 'Ever had a chest scan?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HIVTesting', label: 'Ever tested for HIV?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'FluVaxLast12', label: 'Flu vaccine in last 12 months?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'PneumoVaxEver', label: 'Ever received pneumococcal vaccine?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        {
          key: 'TetanusLast10Tdap',
          label: 'Tetanus (Td/Tdap) shot in last 10 years?',
          type: 'select',
          options: [
            'No, did not receive any tetanus shot in the past 10 years',
            'Yes, received tetanus shot, but not Tdap',
            'Yes, received tetanus shot but not sure what type',
            'Yes, received Tdap'
          ],
          map: {
            'No, did not receive any tetanus shot in the past 10 years': 0,
            'Yes, received tetanus shot, but not Tdap': 1,
            'Yes, received tetanus shot but not sure what type': 2,
            'Yes, received Tdap': 3
          }
        },
        { key: 'HighRiskLastYear', label: 'In high-risk group last year?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'COVID-19',
      fields: [
        {
          key: 'CovidPos',
          label: 'Ever tested positive for COVID-19?',
          type: 'select',
          options: [
            'No',
            'Tested positive using home test without a health professional',
            'Yes'
          ],
          map: {
            'No': 0,
            'Tested positive using home test without a health professional': 1,
            'Yes': 2
          }
        }
      ]
    },
    {
      title: 'Vitals',
      fields: [
        { key: 'HeightInMeters', label: 'Height (m)', type: 'number' },
        { key: 'WeightInKilograms', label: 'Weight (kg)', type: 'number' },
        { key: 'BMI', label: 'Body Mass Index (BMI)', type: 'number' }
      ]
    }
  ];
  

  private diabetesFields: { title: string; fields: Field[] }[] = [
    {
      title: 'Demographics',
      fields: [
        { key: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], map: { 'Male': 1, 'Female': 0 } },
        { key: 'age', label: 'Age', type: 'number' }
      ]
    },
    {
      title: 'Medical History',
      fields: [
        { key: 'hypertension', label: 'Has hypertension?', type: 'select', options: ['Yes', 'No'], map: { 'Yes': 1, 'No': 0 } },
        { key: 'heart_disease', label: 'Heart disease history?', type: 'select', options: ['Yes', 'No'], map: { 'Yes': 1, 'No': 0 } },
        { key: 'diabetes', label: 'Diagnosed diabetes?', type: 'select', options: ['Yes', 'No'], map: { 'Yes': 1, 'No': 0 } },
        { key: 'ChestScan', label: 'Chest scan in past year?', type: 'select', options: ['Yes', 'No'], map: { 'Yes': 1, 'No': 0 } }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'smoking_history', label: 'Smoking history', type: 'select', options: ['Never', 'Former', 'Current'], map: {
          'Never': 0, 'Former': 1, 'Current': 2
        }},
        { key: 'SmokerStatus', label: 'Current smoker?', type: 'select', options: ['Never', 'Former', 'Some days', 'Every day'], map: {
          'Never': 0, 'Former': 1, 'Some days': 2, 'Every day': 3
        }}
      ]
    },
    {
      title: 'Clinical Measurements',
      fields: [
        { key: 'bmi', label: 'Body Mass Index (BMI)', type: 'number' },
        { key: 'HbA1c_level', label: 'HbA1c (%)', type: 'number' },
        { key: 'blood_glucose_level', label: 'Blood glucose (mg/dL)', type: 'number' }
      ]
    }
  ];
  
  showBeginScreen = false; choiceStarted = false;     //Choice elements
  selectDisease(index: number) {
    this.activeDisease = index;
    this.allFields = this.getFieldsForDisease(index); 
    this.pages = [];              // 2. Reset paging arrays
    this.chunkFields();           // repopulates this.pages
    this.formData = {};     // 3. Reset form data
    this.initFormData();
    
    /*this.showBeginScreen = true;     /* 4. Show the “Begin” screen  */   this.choiceStarted = true //for alert 
  }
  private getFieldsForDisease(id: number): Field[] {
    switch (id) {
      case 0: return this.hypertensionFields.reduce<Field[]>((allFields, group) => allFields.concat(group.fields), []);
      
      case 1: return this.arthritisFields.reduce<Field[]>((allFields, group) => allFields.concat(group.fields), []);
      case 2: return this.lungCancerFields.reduce<Field[]>((allFields, group) => allFields.concat(group.fields), []);
      case 3: return this.asthmaFields.reduce<Field[]>((allFields, group) => allFields.concat(group.fields), []);
      case 4: return this.diabetesFields.reduce<Field[]>((allFields, group) => allFields.concat(group.fields), []);
      default: return [];
    }
  }
  chunkFields() {
    try{
      const chunkSize = 5;
      this.pages = [];
    
      const fieldGroupName = this.diseases[this.activeDisease!].name; // e.g., 'Lung_Cancer'
    
      // Convert to camelCase: 'Lung_Cancer' → 'lungCancerFields'
      const fieldGroupKey = fieldGroupName
        .toLowerCase()
        .split('_')
        .map((word, index) => index === 0 ? word : word[0].toUpperCase() + word.slice(1))
        .join('') + 'Fields';
    
      const fieldGroups = (this as any)[fieldGroupKey] as { title: string; fields: Field[] }[];
    
      if (!fieldGroups) {
        console.warn(`No field groups found for: ${fieldGroupKey}`);
        return;
      }
    
      for (const group of fieldGroups) {
        for (let i = 0; i < group.fields.length; i += chunkSize) {
          const chunk = group.fields.slice(i, i + chunkSize);
          this.pages.push({
            title: group.title,
            fields: chunk
          });
        }
      }
  
    }catch{}
  }
  
  
  initFormData() {
    this.allFields.forEach(f => (this.formData[f.key] = null));
    //this.allFields.forEach(f => (this.formData[f.key] = 1));                                      //skipToVoice 2/2
  }
  formStarted = false;   voiceUIActive = false; micState: 'off' | 'idle' | 'listening' = 'off';   // drives the circle colour
  loadingForm = true; placeholderFields = Array(5); // how many skeleton items you want
  begin(): void {
    if (this.activeDisease === null) return;
    this.formStarted = true;this.loadingForm = true;
    setTimeout(() => {/* Simulate form loading*/ this.loadingForm = false;}, 800); /*tweak duration as needed*/
  }
  resetSelection(): void {
    this.showBeginScreen = false;/* trigger fade-out first */ this.choiceStarted = false; 
    this.voiceUIActive = false; this.micState = 'off';  
    // wait for animation to finish before clearing selection
    setTimeout(() => { this.activeDisease = null;}, 1400); // match fade-out duration
  }

  SumittedForm: boolean = false;
  resetForm() {
    this.formStarted = false;
    this.activeDisease = null;
    this.currentPage = 0;
  
    // Clear form data (if needed)
    for (const key in this.formData) {
      this.formData[key] = null;
    }
  }
  async confirmBack() {
    const alert = await this.alertController.create({
      header: 'Are you sure?',
      message: 'Going back will erase your answers for this form.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes, Go Back',
          handler: () => {
            this.resetForm();
            this.resetSelection();
            this.voiceUIActive = false;
            this.SumittedForm=false;
          },
        },
      ],
    });
    await alert.present();    //this.voiceUIActive = false;
  }
  async confirmBegin(i: number) {
    const alert = await this.alertController.create({
      header: 'Ready to begin?',
      message: 'You are going to fill a form',
      buttons: [
        
        {
          text: 'Begin',
          handler: () => {
            this.selectDisease(i)
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {this.showBeginScreen = false}
        },
      ],
    });
    await alert.present();    //this.voiceUIActive = false;
  }
  next(): void { if (this.currentPage < this.pages.length - 1) { this.currentPage++;} 
    this.loadingForm = true;
    setTimeout(() => {
      /*this.currentPage++;*/
      this.loadingForm = false;
    }, 400); // 400ms delay for skeleton effect
  }
  prev(): void { if (this.currentPage > 0) { this.currentPage--; } 
    this.loadingForm = true;
    setTimeout(() => {
      /*this.currentPage--;*/
      this.loadingForm = false;
    }, 400); // 400ms delay for skeleton effect
  }
  trackByFieldKey(index: number, field: Field): string {return field.key;}
  
  trackByGroupTitle(index: number, group: { title: string; fields: Field[] }): string {
    return group.title;
  }
 

  //------Stroke Color Chane
  getStrokeColor(): string {
    const score = Math.max(50, Math.min(this.animatedRiskScore, 100));
    if (score <= 80) {      // Green to Yellow (50–80)
      const t = (score - 50) / (80 - 50); // Normalize between 0 and 1
      const r = Math.round(76 + t * (255 - 76));   // 76 → 255
      const g = Math.round(175 + t * (235 - 175)); // 175 → 235
      const b = Math.round(80 + t * (59 - 80));    // 80 → 59
      return `rgb(${r}, ${g}, ${b})`;
    } else {      // Yellow to Red (80–100)
      const t = (score - 80) / (100 - 80); // Normalize between 0 and 1
      const r = Math.round(255 - t * (255 - 244)); // 255 → 244
      const g = Math.round(235 - t * (235 - 67));  // 235 → 67
      const b = Math.round(59 - t * (59 - 54));    // 59 → 54
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
   //-------------------------------------Circle Visual
   getCircleStyle() {
    const percent = this.riskScore;

    // Handle Null
    if (percent === null || percent === undefined) {
      return {
        background: 'conic-gradient(lightgray 0%, lightgray 100%)'
      };
    }

    let color = 'green';
    if (percent >= 80) {
      color = 'red';
    } else if (percent >= 50) {
      color = 'orange';
    }

    return {
      background: `conic-gradient(${color} ${percent}%, lightgray ${percent}%)`
    };
  }
  animatedRiskScore: number = 0;
  animateRiskScore(finalScore: number, duration: number = 2000, voiceIt:boolean=true) {
    const start = 0;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      this.animatedRiskScore = Math.floor(progress * finalScore);
      
      this.updateRiskInterpretation();

      if (progress < 1) { requestAnimationFrame(step);} 
      else {
        this.animatedRiskScore = finalScore;
       if(voiceIt)
          this.submitTheAnimatedValueVoice(finalScore);
      }
    };
    requestAnimationFrame(step);
  }
  
  riskScore: number | null = null; 
  submit(): void {
    
    if (this.activeDisease != null){
      console.table(this.formData); this.submitStore(); const processedData = this.mapFormData(this.formData,this.getFieldsForDisease(this.activeDisease));
      const formData = processedData; console.table(formData);
      console.log('Disease:', this.diseases[this.activeDisease].name);         
      const disease_url = this.diseases[this.activeDisease].name.toLowerCase();
      this.http.post<any>(`http://localhost:8000/predict/${disease_url}`, processedData)
        .subscribe(response => {
          console.log('Full Response:', response);         // Get the risk score from the response and update the riskScore property
          this.riskScore = response.ncd_probability; this.SumittedForm=true;
          this.animateRiskScore(this.riskScore!*100, 2000 ,false);        //Animate Count
          console.log('Predicted Risk Score:', this.riskScore);
        }, error => { console.error('Error occurred during prediction:', error); });
    }
  }
  mapFormData(formData: any, fields: Field[]): any {
    const mappedData: any = {};
  
    for (const field of fields) {
      const rawValue = formData[field.key];
  
      // If mapping exists, use it. Otherwise, keep original value.
      if (field.map) {
        mappedData[field.key] = field.map[rawValue];
      } else {
        mappedData[field.key] = rawValue;
      }
    }
  
    return mappedData;
  }
  
  //-------------------------------------------Mappings------------------------
  genderMap: { [key: string]: number } = { 'Female': 1, 'Male': 0 }; yesNoMap: { [key: string]: number } = { 'No': 0, 'Yes': 1 };
  removedTeethMap: { [key: string]: number } = { 'All': 0, '6 or more, but not all': 1, '1 to 5': 2, 'None of them': 3 };
  lastCheckupTimeMap: { [key: string]: number } = {
    '5 or more years ago': 0, 'Within past 5 years (2 years but less than 5 years ago)': 1,
    'Within past 2 years (1 year but less than 2 years ago)': 2, 'Within past year (anytime less than 12 months ago)': 3 };
  smokerStatusMap: { [key: string]: number } = {
    'Never smoked': 0, 'Former smoker': 1, 'Current smoker - now smokes some days': 2, 'Current smoker - now smokes every day': 3 };
  eCigaretteUsageMap: { [key: string]: number } = {
    'Never used e-cigarettes in my entire life': 0, 'Not at all (right now)': 1, 'Use them some days': 2, 'Use them every day': 3 };
  raceEthnicityMap: { [key: string]: number } = {
    'Multiracial, Non-Hispanic': 0, 'Other race only, Non-Hispanic': 1, 'Black only, Non-Hispanic': 2, 'Hispanic': 3, 'White only, Non-Hispanic': 4 };
  ageCategoryMap: { [key: string]: number } = {
    'Age 18 to 24': 0, 'Age 25 to 29': 1, 'Age 30 to 34': 2, 'Age 35 to 39': 3, 'Age 40 to 44': 4, 'Age 45 to 49': 5, 'Age 50 to 54': 6, 'Age 55 to 59': 7,
    'Age 60 to 64': 8, 'Age 65 to 69': 9, 'Age 70 to 74': 10, 'Age 75 to 79': 11, 'Age 80 or older': 12 };
  tetanusMap: { [key: string]: number } = { 'No, did not receive any tetanus shot in the past 10 years': 0, 'Yes, received tetanus shot, but not Tdap': 1,
    'Yes, received tetanus shot but not sure what type': 2, 'Yes, received Tdap': 3 };
  covidPosMap: { [key: string]: number } = { 'No': 0, 'Tested positive using home test without a health professional': 1, 'Yes': 2 };

  preprocessData(data: any): any {
    return {
      ...data
    };
  }  //Mappings for if using the fill-in forms  //*Mapping for if using the voice form is done in the Python
  //-------------------------------------------Mappings------------------------

  /* START / STOP VOICE FORM*/
  currentQuestionIndex = 0;  statusMessage = '';
  responseMessage = '';
  startVoiceForm() {
    /**/this.initFormData(); this.choiceStarted=false;   this.voiceUIActive = true; this.currentQuestionIndex = 0;
    this.zone.run(() => { this.statusMessage = '🤖 Getting ready…'; this.micState = 'idle'; });
    this.askNextQuestion();
  }
  get isVoiceFormComplete(): boolean { return this.currentQuestionIndex >= this.questions.length; }
  get isWaitingToResume(): boolean { return this.voiceUIActive && !this.isVoiceFormComplete && !this.isListening; }
  resumeVoiceForm() {
    this.zone.run(() => { this.statusMessage = '▶️ Resuming…'; this.micState = 'idle'; });
    setTimeout(() => this.askNextQuestion(), 600);
  }
  async initSpeechRecognition() {
    try {
      const available = await SpeechRecognition.available();      /* 1️⃣  Check availability */
      if (!available.available) {
        console.warn('❌ Speech recognition not available');      //this.showToast('Speech recognition not available.', 'warning');
        return;
      }
      const permStatus = await SpeechRecognition.checkPermissions();     /* 2️⃣  Check existing permission */
      if (!permStatus.speechRecognition ) {
        const reqStatus = await SpeechRecognition.requestPermissions();
        if (!reqStatus.speechRecognition ) {
          console.warn('❌ Microphone permission not granted'); this.showToast('❌ Microphone permission not granted', 'warning');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize native speech recognition:', error);
      this.showToast(String(error));
    }
  }
  submitTheAnimatedValueVoice(score: number){         
    if (this.voiceUIActive && this.riskScore !== null) {     //Speak thescore
      const score = this.riskScore * 100;
      TextToSpeech.speak({ text: `Your risk score is ${Math.round(score)} percent.`, lang: 'en-US', rate: 1.0 });
    }   
  }
  async showToast(message: string, color: 'danger' | 'success' | 'warning' | 'primary' = 'danger') {
    const toast = await this.toastController.create({ message, duration: 3000, position: 'bottom',       // stays anchored to the bottom
      color     // cssClass: 'center-screen-toast',
    });
    toast.present();
  }

  // Voice questions
  questions = [
    { key: 'Sex', question: 'Are you male or female?' },
    { key: 'PhysicalHealthDays', question: 'How many days in the past month did you feel physically unwell?' },
    { key: 'MentalHealthDays', question: 'How many days in the past month did you feel mentally unwell?' },
    { key: 'LastCheckupTime', question: 'When was your last routine medical checkup?' },
    { key: 'PhysicalActivities', question: 'How many days in the past week did you exercise or do physical activity?' },
    { key: 'SleepHours', question: 'How many hours do you sleep on average each night?' },
    { key: 'RemovedTeeth', question: 'How many permanent teeth have been removed due to decay or gum disease?' },
    { key: 'HadAngina', question: 'Have you ever been told by a doctor that you have angina or coronary heart disease?' },
    { key: 'HadStroke', question: 'Have you ever had a stroke?' },
    { key: 'DeafOrHardOfHearing', question: 'Are you deaf or do you have serious difficulty hearing?' },
    { key: 'BlindOrVisionDifficulty', question: 'Are you blind or do you have serious difficulty seeing?' },
    { key: 'DifficultyConcentrating', question: 'Do you have difficulty concentrating, remembering, or making decisions?' },
    { key: 'DifficultyWalking', question: 'Do you have serious difficulty walking or climbing stairs?' },
    { key: 'DifficultyDressingBathing', question: 'Do you have difficulty dressing or bathing?' },
    { key: 'DifficultyErrands', question: 'Do you have difficulty doing errands alone such as visiting a doctor or shopping?' },
    { key: 'SmokerStatus', question: 'Do you currently smoke cigarettes?' },
    { key: 'ECigaretteUsage', question: 'Do you currently use electronic cigarettes or vaping devices?' },
    { key: 'ChestScan', question: 'Have you had a chest scan (X-ray or CT scan) in the past year?' },
    { key: 'RaceEthnicityCategory', question: 'What is your race or ethnicity?' },
    { key: 'AgeCategory', question: 'What is your age category?' },
    { key: 'HeightInMeters', question: 'What is your height in meters?' },
    { key: 'WeightInKilograms', question: 'What is your weight in kilograms?' },
    { key: 'BMI', question: 'What is your Body Mass Index (BMI), if known?' },
    { key: 'AlcoholDrinkers', question: 'Have you consumed alcohol in the past 30 days?' },
    { key: 'HIVTesting', question: 'Have you ever been tested for HIV?' },
    { key: 'FluVaxLast12', question: 'Did you receive a flu vaccine in the past 12 months?' },
    { key: 'PneumoVaxEver', question: 'Have you ever received a pneumonia vaccine?' },
    { key: 'TetanusLast10Tdap', question: 'Have you received a tetanus shot in the last 10 years, such as Tdap?' },
    { key: 'HighRiskLastYear', question: 'In the past 12 months, were you at high risk for serious illness from respiratory infection?' },
    { key: 'CovidPos', question: 'Have you ever tested positive for COVID-19?' }
  ];
  isListening = false; // Process the voice answer
  processSpeechAnswer(answer: string) {
    if (!this.voiceUIActive) return;
    this.isListening = false; this.micState = 'idle';
    const currentKey = this.questions[this.currentQuestionIndex].key;

    this.http.post<any>('http://localhost:8000/parse_speech', { questionKey: currentKey, text: answer}).subscribe(response => {
      const extractedValue = response.extractedValue; console.log(extractedValue); this.responseMessage = 'Response: '+answer;
      if (extractedValue === null || extractedValue === undefined || extractedValue === '') { // If extraction failed (e.g. null), ask again
        this.statusMessage = "I couldn’t understand. Let’s try again...";
        setTimeout(() => { this.askNextQuestion();  /* repeat current question*/}, 1000);
        return;
      }
      this.formData[currentKey] = extractedValue;
      console.log(`Extracted value for ${currentKey}:`, extractedValue);
      this.currentQuestionIndex++;
      if (this.currentQuestionIndex < this.questions.length) { this.askNextQuestion(); } else {
        console.log('All questions answered. Final formData:', this.formData); //alert('All questions answered! You can now submit the form.');
        this.submitVoiceResult();
      }
    }, error => {
      console.error('NLP extraction failed:', error); alert('Sorry, I could not understand. Please try again.' + 'Error: '+ error);
      setTimeout(() => { this.askNextQuestion(); }, 1000);
    });
  }
  async submitVoiceResult(): Promise<void> {
    console.table(this.formData); const processedData = this.preprocessData(this.formData);
    //const formData = processedData; //No need for preprocessing cuz the Python does it for this //console.table(formData);
    if(this.activeDisease){
      const disease_url = this.diseases[this.activeDisease].name.toLowerCase();
      this.http.post<any>(`http://localhost:8000/predict/${disease_url}`, this.formData).subscribe(response => {
        console.log('Full Response:', response);         // Get the risk score from the response and update the riskScore property
        this.riskScore = response.ncd_probability;
        this.animateRiskScore(this.riskScore!*100, 2000, true);        //Animate Count 
        if (!this.voiceUIActive) return; if (this.riskScore !== null) { this.zone.run(() => { this.micState = 'idle'; }); }
        console.log('Predicted Risk Score:', this.riskScore);
      }, error => { console.error('Error occurred during prediction:', error); });   
    }
  }
  async askNextQuestion() {
    if (!this.voiceUIActive) return;
    if (this.currentQuestionIndex >= this.questions.length) return;
    const q = this.questions[this.currentQuestionIndex].question;
    this.zone.run(() => { this.statusMessage = 'Asking: ' + q; this.micState = 'idle'; });
    try {
      await TextToSpeech.speak({ text: q, lang: 'en-US', rate: 1.0,});      // Use native TTS
      this.zone.run(() => { this.statusMessage = '🎤 Listening… please speak now'; });      //  After speaking, delay slightly and start listening 
      setTimeout(() => { this.startListening(); }, 500); // slight delay to let audio settle
    } catch (err) { console.error('TTS error:', err); }
  }
  async startListening() {
    if (!this.voiceUIActive) return;
    this.currentQuestionIndex = this.questions.length;  //this.submitVoiceResult()                            //skipToVoice 1/2    
    try { this.zone.run(() => { this.statusMessage = '🎤 Listening…'; this.micState = 'listening'; this.isListening = true; });
      const result = await SpeechRecognition.start({ language: 'en-US', popup: false, maxResults: 1, partialResults: false, });
      const transcript = result.matches?.[0] || ''; console.log('Recognized speech:', transcript);
      this.showToast( String(transcript), 'warning');
      this.zone.run(() => { this.processSpeechAnswer(transcript); });  
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      this.showToast(err instanceof Error ? err.message : String(err), 'danger');
      this.zone.run(() => {
        this.statusMessage = 'I didn’t catch that. Asking again…';
        this.micState = 'idle';
        this.isListening = false;
      });
      setTimeout(() => this.askNextQuestion(), 700);
    }
  }

  /* Dark Mode Switch*/
  isDarkMode = false;    introSeen = false;

  async ngOnInit() { await this.loadTheme();   
    this.introSeen  = localStorage.getItem('introSeen') === "true"; console.log("introSeen="+ 'introSeen' );
    this.username = localStorage.getItem('user_id') || ''; this.userRole = localStorage.getItem('userRole') || ''
    this.showToast('Welcome' + this.username , 'success')
  }

  async loadTheme() {
    const { value } = await Preferences.get({ key: 'theme' });
    if (value === 'dark' || value === 'light') { this.setTheme(value); } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches; // Use system preference if no saved setting
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }
  async toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const newTheme = this.isDarkMode ? 'dark' : 'light';
    await Preferences.set({ key: 'theme', value: newTheme });
    this.setTheme(newTheme);
    //this.showToast(`DARK MODE: ${this.isDarkMode ? 'ON' : 'OFF'}`, 'success');
  }
  setTheme(theme: string) {
    document.body.classList.toggle('dark', theme === 'dark');
    this.isDarkMode = theme === 'dark';
  }
  /* Dark Mode Switch*/

  popoverEvent: any; isPopoverOpen = false;
  username = localStorage.getItem('user_id') || ''; userRole = localStorage.getItem('userRole') || ''; // or 'Patient'
  openPopover(ev: Event) { this.popoverEvent = ev; this.isPopoverOpen = true; }
  async logout() {
    console.log('Logging out...');
    localStorage.removeItem('user_id');  // Optional: remove session
    localStorage.removeItem('userRole');  // Optional: remove session
    await this.popoverCtrl.dismiss(); // ❗️Immediately close the popover
    this.router.navigateByUrl('/auth');
  }


  closeMenu() {
    this.menuCtrl.close();
  }
   

  
  constructor(private alertController: AlertController, private http: HttpClient,  
  private zone: NgZone,  /*  ← inject NgZone!*/ private toastController: ToastController, 
  private router: Router ,private popoverCtrl: PopoverController, private menuCtrl: MenuController 
  ) 
  { this.chunkFields(); this.initFormData();  this.initSpeechRecognition(); this.loadTheme();}



  
  async submitStore() {
    const userId = localStorage.getItem('user_id'); // from login
    if(this.activeDisease != null) {
      const record = {
        id: Date.now(), // unique ID
        userId: userId,
        //name: this.formData.name || 'Unknown',
        //age: this.formData.age || null,
        condition: this.diseases[this.activeDisease].name, // from selection
        risk: this.animatedRiskScore || 0,
        date: new Date().toISOString().split('T')[0],
        formData: { ...this.formData } // store full answers
      }
    
     // Get existing records
      const existing = await Preferences.get({ key: 'patientRecords' });
      let records = existing.value ? JSON.parse(existing.value) : [];

      // Add new record
      records.push(record);
      
      // Save back
      await Preferences.set({
        key: 'patientRecords',
        value: JSON.stringify(records)
      });

      console.log('Record saved:', record);
    }
  }

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
  
  

  
  nextSlide() {
    if (this.currentSlide < this.slides.length - 1) {
      this.currentSlide++;
    } else {
      // mark intro as seen (optional)
      localStorage.setItem('introSeen', 'true');
      this.introSeen = true;
      this.router.navigateByUrl('/home', { replaceUrl: true });
    }
  }
  
  showSettings = false;

  toggleSettings() {
    this.showSettings = !this.showSettings;
  }










  //--------------------------Interpretation
  
  riskInterpretation: string = '';

  getInterpretation(score: number): string {
    if (score < 20) {
      return 'Low risk. Keep maintaining a healthy lifestyle.';
    } else if (score < 50) {
      return 'Moderate risk. Consider making lifestyle improvements.';
    } else if (score < 75) {
      return 'High risk. You may need to consult a healthcare professional.';
    } else {
      return 'Very high risk. Immediate medical attention is strongly advised.';
    }
  }

  updateRiskInterpretation() {
    this.riskInterpretation = this.getInterpretation(this.animatedRiskScore);
  }



}





import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router'; 
import { PopoverController } from '@ionic/angular';
import { MenuController } from '@ionic/angular';


interface Field {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  
  map?: { [label: string]: number };
}

