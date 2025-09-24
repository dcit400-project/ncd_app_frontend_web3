//patient page(tab 1)

import { Component, NgZone, OnInit } from '@angular/core'; //
import { AlertController, } from '@ionic/angular'; 
import { HttpClient } from '@angular/common/http';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { ToastController } from '@ionic/angular';



@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ["tab1a.page.scss","tab1b.page.scss", "tab1c.page.scss", "tab1d.page.scss", "tab1e.page.scss", "tab1f.page.scss", "tab1g.page.scss", "tab1h.page.scss", "tab1j.page.scss" ],
  standalone: false,
})
export class Tab1Page implements OnInit{

  diseases = [
    { id: 0, name: 'Hypertension', accuracy: '91' },
    { id: 1, name: 'Arthritis', accuracy: '72' },
    { id: 2, name: 'Lung_Cancer', accuracy: '50' },
    { id: 3, name: 'Asthma' , accuracy: '86'},
    { id: 4, name: 'Diabetes' , accuracy: '90'},
  ];
  activeDisease: number | null = null;

  trackByIndex(index: number): number {
    return index;
  }


//-------online--addresses
 //host_address = 'http://192.168.255.194:8000'
 host_address = ''
 host_address_tts = 'https://ncdttspaystack.netlify.app'
  host_address_tabnet = 'https://ncd-app-oldk.onrender.com'
 host_address_tensorflow = 'https://ncd400-api-production-74ef.up.railway.app'
 host_address_parse = 'https://tk6t2l4oxg951-flask--5000.prod1.defang.dev/'


//-------offline--addresses
/*

host_address_tabnet = 'http://192.168.192.194:8000'
 host_address_tensorflow = 'http://192.168.192.194:8000'
 host_address_parse = 'http://192.168.192.194:8000'
host_address_tts = 'http://localhost:3000'
*/




  
  


  allFields: Field[] = [];
  formData: Record<string, any> = {};  // Collect user responses deleted items cuz initFormData and allFields will fill it
  pages: { title: string; fields: Field[] }[] = []; currentPage = 0; /** Break the fields into pages of 5 questions each */ 
  private hypertensionFields: { title: string; fields: Field[]; }[] = [
    {
      title: 'Demographics',
      fields: [
        { key: 'age', label: 'What is your age?', type: 'number' },
        { key: 'sex', label: 'Are you a male or female?', type: 'select', options: ['Female', 'Male'], map: { Female: 1, Male: 0 } }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'is_smoking', label: 'Do you currently smoke?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'cigsPerDay', label: 'If so, how many cigarettes per day?', type: 'number' }
      ]
    },
    {
      title: 'Medical History',
      fields: [
        { key: 'BPMeds', label: 'Are you currently on Blood Pressure Meds?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
       /* 
		{ key: 'prevalentStroke', label: 'Do You Have Any History of Stroke?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'prevalentHyp', label: 'Were You Previously Diagnosed Hypertension?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'diabetes', label: 'Are You Diagnosed with Diabetes?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      */
	  
	  ]
    },
    {
      title: 'Clinical Measurements',
      fields: [
        { key: 'totChol', label: 'What is your total Cholesterol (in milligrams per deciliter)?', type: 'number' },
        { key: 'sysBP', label: 'What is your systolic blood pressure (in millimeters)?', type: 'number' },
        { key: 'diaBP', label: 'What is your diastolic blood pressure (in millimeters)?', type: 'number' },
        { key: 'BMI', label: 'What is your body mass index (your BMI)?', type: 'number' },
        { key: 'heartRate', label: 'What is your heart rate (your bpm)?', type: 'number' },
        { key: 'glucose', label: 'What is your fasting glucose level (in milligrams per deciliter)?', type: 'number' }
      ]
    }
  ];
  
  
  
  
  private arthritisFields: { title: string; fields: Field[] }[] = [
    {
      title: 'Demographics',
      fields: [
        {
          key: 'Sex', label: 'What is your Gender? Are you a Male or Female.', type: 'select', options: ['Male', 'Female'], map: { Male: 1, Female: 0 }
        },
        {
          key: 'Age_Category',label: 'How old are you?',type: 'select',options: [
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
          key: 'Checkup', label: 'When was the last year you went for health checkups?', type: 'select', 
		  options: ["last year", "last 2 years", "last 5 years", "5 or more years ago", "Never"],                 
		  map: { 'last year': 0, 'last 2 years': 1, 'last 5 year': 2, '5 or more years ago': 3, 'Never': 4 }   
        },
        {
          key: 'Exercise', label: 'Do you exercise regularly?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 }
        },
        {
          key: 'Smoking_History', label: 'Are you a smoker?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 }
        },
        {
          key: 'Alcohol_Consumption', label: 'What is your alcohol consumption (per week)?', type: 'number'
        }
      ]
    },
    {
      title: 'Body Measurements',
      fields: [
        { key: 'Height_cm', label: 'What is your Height (in centimeters)?', type: 'number' },
        { key: 'Weight_kg', label: 'What is your Weight (in kilograms)?', type: 'number' },
        { key: 'BMI', label: 'What is your Body Mass Index?', type: 'number' }
      ]
    },
    {
      title: 'Dietary Habits',
      fields: [
        { key: 'Fruit_Consumption', label: 'What is your fruit consumption (per week)?', type: 'number' },
        { key: 'Green_Vegetables_Consumption', label: 'What is your green vegetable consumption (per week)?', type: 'number' },
        { key: 'FriedPotato_Consumption', label: 'What is your fried potato consumption (per week)?', type: 'number' }
      ]
    },
    {
      title: 'Medical History',
      fields: [
        {
          key: 'Diabetes', label: 'Are you diagnosed with diabetes? What is your diabetes status. ', type: 'select', 
		  options: ['Yes', 'No', 'pre-diabetic', 'only during pregnancy'], 
		  map: { 'Yes': 3, 'No': 0, 'pre-diabetic': 1, 'only during pregnancy': 2 }
        },
        {
          key: 'Skin_Cancer', label: 'Are you diagnosed with Skin Cancer?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 }
        },
        {
          key: 'Other_Cancer', label: 'Are you diagnosed with any other Cancer?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 }
        }
      ]
    }
  ];
  
  
  
  /*
  private lungCancerFields: { title: string; fields: Field[] }[] = [
    {
      title: 'Demographics',
      fields: [
        { key: 'Age', label: 'What Is Your Age?', type: 'number' },
        { key: 'Gender', label: 'What Is Your Gender?', type: 'select', options: ['Male', 'Female'], map: { Male: 1, Female: 2 } }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'Air_Pollution', label: 'Are You Exposed To Air Pollution? Rate your situation', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8} 
		},
        { key: 'Alcohol_use', label: 'What Is Your Alcohol use?', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8} 
		},
        { key: 'Dust_Allergy', label: 'Do You Have Any Dust allergy?', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8} 
		},
        { key: 'OccuPational_Hazards', label: 'Are you exposed to any Occupational hazards?', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8} 
		},
		
        { key: 'Genetic_Risk', label: 'Do You Have Any Genetic risk?', type: 'select', 
		options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Sometimes':3, 'Often':4, 'Usually':5, 'Almost always':6, 'Always':7} 
		},
        { key: 'Balanced_Diet', label: 'Do You Follow A balanced diet?', type: 'select', 
		options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Sometimes':3, 'Often':4, 'Usually':5, 'Almost always':6, 'Always':7} 
		},
        { key: 'Obesity', label: 'Is Obesity Present In You?', type: 'select', 
		options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Sometimes':3, 'Often':4, 'Usually':5, 'Almost always':6, 'Always':7}  
		},
		
        { key: 'Smoking', label: 'Are You A Smoker?', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8}  
		},
        { key: 'Passive_Smoker', label: 'Are You A Passive smoker?', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8} 
		}
      ]
    },
    {
      title: 'Medical History',
      fields: [
        { key: 'chronic_Lung_Disease', label: 'Do You Have Chronic lung disease?', type: 'select', 
		options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Sometimes':3, 'Often':4, 'Usually':5, 'Almost always':6, 'Always':7}
		}
      ]
    },
    {
      title: 'Symptoms',
      fields: [
        { key: 'Chest_Pain', label: 'Do You Have Chest pain?', type: 'select', 
		options: ['Never', 'Almost never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Almost never':2,'Rarely':3, 'Occasionally':4, 'Sometimes':5, 'Often':6, 'Usually':7, 'Almost always':8, 'Always':9} 
		},
        { key: 'Coughing_of_Blood', label: 'Do You Cough blood?', type: 'select', 
		options: ['Never', 'Almost never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Almost never':2,'Rarely':3, 'Occasionally':4, 'Sometimes':5, 'Often':6, 'Usually':7, 'Almost always':8, 'Always':9} 
		},
        { key: 'Fatigue', label: 'Do You Have Fatigue?', type: 'select', 
		options: ['Never', 'Almost never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Almost never':2,'Rarely':3, 'Occasionally':4, 'Sometimes':5, 'Often':6, 'Usually':7, 'Almost always':8, 'Always':9} 

		},
		
        { key: 'Weight_Loss', label: 'Do You Have Unexplained weight loss?', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8} 
		},
		
        { key: 'Shortness_of_Breath', label: 'Do You Have Shortness of breath?', type: 'select', 
		options: ['Never', 'Almost never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Almost never':2,'Rarely':3, 'Occasionally':4, 'Sometimes':5, 'Often':6, 'Usually':7, 'Almost always':8, 'Always':9} 
		},
		
        { key: 'Wheezing', label: 'Do You Wheeze?', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8} 
		},
        { key: 'Swallowing_Difficulty', label: 'Do You Have Swallowing difficulty?', type: 'select', 
		options: ['Never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Occasionally':3, 'Sometimes':4, 'Often':5, 'Usually':6, 'Almost always':7, 'Always':8} 
		},
		
        { key: 'Clubbing_of_Finger_Nails', label: 'Do You Have Clubbing of nails?', type: 'select', 
		options: ['Never', 'Almost never', 'Rarely', 'Occasionally', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Almost never':2,'Rarely':3, 'Occasionally':4, 'Sometimes':5, 'Often':6, 'Usually':7, 'Almost always':8, 'Always':9} 
		},
		
        { key: 'Frequent_Cold', label: 'Do You Get Frequent colds?', type: 'select', 
		options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Sometimes':3, 'Often':4, 'Usually':5, 'Almost always':6, 'Always':7} 
		},
        { key: 'Dry_Cough', label: 'Do You Have Dry cough?', type: 'select', 
		options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Sometimes':3, 'Often':4, 'Usually':5, 'Almost always':6, 'Always':7} 
		},
        { key: 'Snoring', label: 'Do You Snore?', type: 'select', 
		options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Usually', 'Almost always', 'Always'], 
		map: {'Never':1, 'Rarely':2, 'Sometimes':3, 'Often':4, 'Usually':5, 'Almost always':6, 'Always':7} 
		}
      ]
    }
  ];
  
  */
  
	private lungCancerFields: { title: string; fields: Field[] }[] = [
	  {
		title: 'Demographics',
		fields: [
		  { key: 'Age', label: 'What is your age?', type: 'number' },
		  {
			key: 'Gender',
			label: 'What is your gender?',
			type: 'select',
			options: ['Male', 'Female'],
			map: { Male: 1, Female: 2 }
		  },
		  {
			key: 'Rural_or_Urban',
			label: 'Do you live in an urban area?',
			type: 'select',
			options: ['No', 'Yes'],
			map: { No: 0, Yes: 1 }
			//options: ['Rural', 'Urban'],
			//map: { Rural: 0, Urban: 1 }
		  }
		]
	  },
	  {
		title: 'Lifestyle & Environment',
		fields: [
		  {
			key: 'Air_Pollution_Exposure',
			label: 'What is your level of air pollution exposure? Would you say it is medium, low, or high.',
			type: 'select',
			options: ['Low', 'Medium', 'High'],
			map: { Low: 0, Medium: 1, High: 2 }
		  },
		  {
			key: 'Socioeconomic_Status',
			label: 'What is your socioeconomic status? In your opinion, are you middle class, low class or high class.',
			type: 'select',
			options: ['Low', 'Middle', 'High'],
			map: { Low: 0, Middle: 1, High: 2 }
		  },
		  {
			key: 'Healthcare_Access',
			label: 'What is your healthcare access? Is it poor, good or limited.',
			type: 'select',
			options: ['Poor', 'Limited', 'Good'],
			map: { Poor: 0, Limited: 1, Good: 2 }
		  },
		  {
			key: 'Smoking_Status',
			label: 'What is your smoking status?',
			type: 'select',
			options: ['Non-Smoker', 'Smoker', 'Former Smoker'],
			map: { 'Non-Smoker': 0, 'Smoker': 1, 'Former Smoker': 2 }
		  },
		  {
			key: 'Tobacco_Marketing_Exposure',
			label: 'Are you exposed to tobacco marketing?',
			type: 'select',
			options: ['No', 'Yes'],
			map: { No: 0, Yes: 1 }
		  },
		  {
			key: 'Indoor_Smoke_Exposure',
			label: 'Are you exposed to indoor smoking?',
			type: 'select',
			options: ['No', 'Yes'],
			map: { No: 0, Yes: 1 }
		  },
		  {
			key: 'Second_Hand_Smoke',
			label: 'Are you exposed to second-hand smoke? Such as the smoke from burning tobacco products.',
			type: 'select',
			options: ['No', 'Yes'],
			map: { No: 0, Yes: 1 }
		  },
		  {
			key: 'Occupation_Exposure',
			label: 'Do you have occupational exposure? Are you exposed to dangerous chemicals at work.',
			type: 'select',
			options: ['No', 'Yes'],
			map: { No: 0, Yes: 1 }
		  }
		]
	  },
	  {
		title: 'Medical History',
		fields: [
		  {
			key: 'Family_History',
			label: 'Do you have a family history of lung cancer?',
			type: 'select',
			options: ['No', 'Yes'],
			map: { No: 0, Yes: 1 }
		  },
		  {
			key: 'Screening_Availability',
			label: 'Do you have access to lung cancer screening?',
			type: 'select',
			options: ['No', 'Yes'],
			map: { No: 0, Yes: 1 }
		  }
		]
	  }
	];

  private asthmaFields: { title: string; fields: Field[] }[] = [
    {
      title: 'Demographics',
      fields: [
        { key: 'Sex', label: 'What is your gender? Male or Female.', type: 'select', options: ['Male', 'Female'], map: { Male: 1, Female: 0 } },
        {
          key: 'RaceEthnicityCategory',
          label: 'Which race are you? Are you black, white, hispanic, non-hispanic, or some other race?',
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
          label: 'How old are you?',
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
        { key: 'PhysicalHealthDays', label: 'In the past 30 days, how many days has your physical health not been good?', type: 'number' },
        { key: 'MentalHealthDays', label: 'In the past 30 days, how many days has your mental health not been good?', type: 'number' },
        {
          key: 'LastCheckupTime',
          label: 'How many years has it been since your last check‑up?',
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
        { key: 'SleepHours', label: 'What is your average sleep hours?', type: 'number' },
        { key: 'RemovedTeeth', label: 'How many teeth do you have removed due to decay?', type: 'select', options: ['All', '6 or more, but not all', '1 to 5', 'None of them'], map: { 'All': 3, '6 or more, but not all': 2, '1 to 5': 1, 'None of them': 0 } }
      ]
    },
    {
      title: 'Disability & Limitations',
      fields: [
        { key: 'DeafOrHardOfHearing', label: 'Are you deaf or hard of hearing?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'BlindOrVisionDifficulty', label: 'Are you blind or have vision difficulty?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'DifficultyConcentrating', label: 'Do you have difficulty concentrating or remembering?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'DifficultyWalking', label: 'Do you have difficulty walking or climbing stairs?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'DifficultyDressingBathing', label: 'Do you have difficulty dressing or bathing?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'DifficultyErrands', label: 'Do you have difficulty doing errands alone?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'PhysicalActivities', label: 'Have you engaged in any physical activity in the past month?', type: 'number' },
        {
          key: 'SmokerStatus',
          label: 'Are you a current smoker?',
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
          label: 'What is your E-cigarette usage?',
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
        { key: 'AlcoholDrinkers', label: 'Do you currently drink alcohol?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Medical History',
      fields: [
        { key: 'HadAngina', label: 'Have you ever had angina?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadStroke', label: 'Have you ever had a stroke?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadHeartAttack', label: 'Do you have heart attacks?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadCOPD', label: 'Have you been diagnosed with COPD?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadDepressiveDisorder', label: 'Have you been diagnosed with depressive disorder?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadArthritis', label: 'Have you been diagnosed with arthritis?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadKidneyDisease', label: 'Do you have a Kidney Disease?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadSkinCancer', label: 'Do you have Skin Cancer?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HadDiabetes', label: 'Have you been diagnosed with diabetes?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'Vaccination & Screening',
      fields: [
        { key: 'ChestScan', label: 'Have you ever had a chest scan?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'HIVTesting', label: 'Have you ever tested for HIV?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'FluVaxLast12', label: 'Have you had Flu vaccine in last 12 months?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        { key: 'PneumoVaxEver', label: 'Have you ever received pneumococcal vaccine?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } },
        {
          key: 'TetanusLast10Tdap',
          label: 'Have you had a tetanus shot in last 10 years?',
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
        { key: 'HighRiskLastYear', label: 'Were you at a high risk of getting asthma last year?', type: 'select', options: ['Yes', 'No'], map: { Yes: 1, No: 0 } }
      ]
    },
    {
      title: 'COVID-19',
      fields: [
        {
          key: 'CovidPos',
          label: 'Have you ever tested positive for COVID-19?',
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
        { key: 'HeightInMeters', label: 'What is your Height (in centimeters)?', type: 'number' },
        { key: 'WeightInKilograms', label: 'What is your Weight (in kilograms)?', type: 'number' },
        { key: 'BMI', label: 'What is your Body Mass Index (your BMI)?', type: 'number' }
      ]
    }
  ];
  

  private diabetesFields: { title: string; fields: Field[] }[] = [
    {
      title: 'Demographics',
      fields: [
        { key: 'gender', label: 'What is your gender?', type: 'select', options: ['Male', 'Female'], map: { 'Male': 1, 'Female': 0 } },
        { key: 'age', label: 'What is your age?', type: 'number' }
      ]
    },
    {
      title: 'Medical History',
      fields: [
		/*
        { key: 'hypertension', label: 'Do You Have hypertension?', type: 'select', options: ['Yes', 'No'], map: { 'Yes': 1, 'No': 0 } },
        { key: 'heart_disease', label: 'Do You Have A Heart disease history?', type: 'select', options: ['Yes', 'No'], map: { 'Yes': 1, 'No': 0 } },
        { key: 'diabetes', label: 'Are You Diagnosed With diabetes?', type: 'select', options: ['Yes', 'No'], map: { 'Yes': 1, 'No': 0 } },
        */
		{ key: 'ChestScan', label: 'Have you had a chest scan in the past year?', type: 'select', options: ['Yes', 'No'], map: { 'Yes': 1, 'No': 0 } }
      ]
    },
    {
      title: 'Lifestyle',
      fields: [
        { key: 'smoking_history', label: 'Do you have a history of smoking? What is your smoking status.', type: 'select', 
		options: ['Never', 'Former', 'Current', 'Ever', 'Not Current', 'N/A'], 
		map: {'Never': 0, 'Former': 1, 'Current': 2, 'Ever': 3, 'Not Current': 4, 'N/A':5}
		},
		
		/*
        { key: 'SmokerStatus', label: 'Are You A Current smoker?', type: 'select', options: ['Never', 'Former', 'Some days', 'Every day'], map: {
          'Never': 0, 'Former': 1, 'Some days': 2, 'Every day': 3
        }}
		*/
      ]
    },
    {
      title: 'Clinical Measurements',
      fields: [
        { key: 'bmi', label: 'Tell me your Body Mass Index?', type: 'number' },
        { key: 'HbA1c_level', label: 'What is your Hemoglobin A1c Level?', type: 'number' },
        { key: 'blood_glucose_level', label: 'What is your Blood Glucose Level in (milligram per deciliter)?', type: 'number' }
      ]
    }
  ];
  
  showBeginScreen = false; choiceStarted = false;     //Choice elements
  selectDisease(index: number) {
    this.activeDisease = index;
    this.allFields = this.getFieldsForDisease(index); 
	this.questions = this.getQuestionsForDisease(index);
	
    this.pages = [];              // 2. Reset paging arrays
    this.chunkFields();           // repopulates this.pages
    this.formData = {};     // 3. Reset form data
    this.initFormData();
	
	switch(index){
		case 0: this.host_address = this.host_address_tensorflow; break
		case 1: this.host_address = this.host_address_tensorflow; break
		case 2: this.host_address = this.host_address_tensorflow; break
		case 3: this.host_address = this.host_address_tabnet; break
		case 4: this.host_address = this.host_address_tabnet;break
		default: break;
	}
    
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
	
	const alert2 = await this.alertController.create({
      header: 'Pay',
      message: 'You have used up your 5 free tries',
      buttons: [
        
        {
          text: 'Pay',
          handler: () => {
            //this.selectDisease(i)
			this.router.navigateByUrl('/tabs/tab3');
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {this.showBeginScreen = false}
        },
      ],
    });
	
	if(this.paymentUseCount < 5){//Payment restriction
		await alert.present();
	}else{ 
		
		if( this.payment_balance < 50 ){ 
			await alert2.present(); 
		}
		else { await alert.present(); }
		
	}
	//this.voiceUIActive = false;
        
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
  //risk: number = 0; 
  radius: number = 65; circumference: number = 2 * Math.PI * this.radius; dash: number = (this.animatedRiskScore / 100) * this.circumference;

  animateRiskScore(finalScore: number, duration: number = 2000, voiceIt:boolean=true) {
    const start = 0;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      this.animatedRiskScore = Math.floor(progress * finalScore);
      
      this.updateRiskInterpretation();
		this.dash = (this.animatedRiskScore / 100) * this.circumference;

      if (progress < 1) { 
		requestAnimationFrame(step); 
	  } 
      else {
        this.animatedRiskScore = finalScore;
		
		const dash_value = (this.animatedRiskScore / 100) * this.circumference;
		//this.animateDash(dash_value,2000);
		this.dash = dash_value;
       if(voiceIt)
          this.submitTheAnimatedValueVoice(finalScore);
      }
    };
    requestAnimationFrame(step);
  }
  focusedField: string | null = null;


  
  
    animateDash(finalScore: number, duration: number = 2000) {
    const start = 0;
    const startTime = performance.now();
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      this.animatedRiskScore = Math.floor(progress * finalScore);
      
      this.updateRiskInterpretation();

      if (progress < 1) { 
		requestAnimationFrame(step); 
	  } 
      else {
        this.animatedRiskScore = finalScore;
	
      }
    };
    requestAnimationFrame(step);
  }
  
  riskScore: number | null = null; riskInterp = ''; 
  async submit() {
	  
	 const loading = await this.loadingCtrl.create({
		message: 'Predicting...',
		spinner: 'circles', // 'bubbles', 'dots', etc. also available
		duration: 0 // 0 = manual dismiss
	  }); 
	  await loading.present();
    
    if (this.activeDisease != null){
      console.table(this.formData); //this.submitStore(); 
	  const processedData = this.mapFormData(this.formData,this.getFieldsForDisease(this.activeDisease));
      const formData = processedData; console.table(formData);
      console.log('Disease:', this.diseases[this.activeDisease].name);         
      const disease_url = this.diseases[this.activeDisease].name.toLowerCase();
      this.http.post<any>(`${this.host_address}/predict/${disease_url}`, processedData)
        .subscribe(response => {
          console.log('Full Response:', response);         // Get the risk score from the response and update the riskScore property
          loading.dismiss(); //stop loading
		  this.riskScore = response.ncd_probability;
		  //this.riskInterp = response.final_narrative;
			this.riskInterp = ""; 		  
		  this.SumittedForm=true;
          this.animateRiskScore(this.riskScore!*100, 2000 ,false);        //Animate Count
		 setTimeout(() => { this.typeText(response.final_narrative); }, 5000);
		  
		  if(this.riskScore){
			   let percentage = Math.floor(Math.round(this.riskScore*100) || -1);
			  this.submitStore( percentage  );
		  }
			 
		  //this.showToast2('Recorded');
          console.log('Predicted Risk Score:', this.riskScore);
        }, error => { loading.dismiss(); console.error('Error occurred during prediction:', error); });
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
  //get isVoiceFormComplete(): boolean { return false; }
  get isWaitingToResume(): boolean { return this.voiceUIActive && !this.isVoiceFormComplete && !this.isListening; }
  resumeVoiceForm() {
    this.zone.run(() => { this.statusMessage = '▶️ Resuming…'; this.micState = 'idle'; });
    setTimeout(() => this.askNextQuestion(), 600);
  }
  
  
  
  
	private webSpeechRecognition: any;

	initWebSpeechRecognition() {
	  if (!('webkitSpeechRecognition' in window)) {
		console.warn('❌ Web Speech API not supported in this browser');
		return;
	  }

	  const recognition = new (window as any).webkitSpeechRecognition();
	  recognition.lang = 'en-US';
	  recognition.interimResults = false;
	  recognition.maxAlternatives = 1;

	  recognition.onstart = () => {
		this.zone.run(() => {
		  this.statusMessage = '🎤 Listening (Web)…';
		  this.micState = 'listening';
		  this.isListening = true;
		});
	  };

	  recognition.onresult = (event: any) => {
		const transcript = event.results[0][0].transcript;
		console.log('Web Recognized:', transcript);
		this.showToast2(transcript, 'warning');
		this.zone.run(() => this.processSpeechAnswer(transcript));
	  };

	  recognition.onerror = (err: any) => {
		console.error('Web Speech error:', err);
		this.showToast2(err.error, 'danger');
		this.zone.run(() => {
		  this.statusMessage = 'I didn’t catch that (web). Asking again…';
		  this.micState = 'idle';
		  this.isListening = false;
		});
		setTimeout(() => this.askNextQuestion(), 700);
	  };

	  recognition.onend = () => {
		this.isListening = false;
	  };

	  this.webSpeechRecognition = recognition;
	}

  
  
  
  async initSpeechRecognition() {
    try {
      const available = await SpeechRecognition.available();      /* 1️⃣  Check availability */
      if (!available.available) {
        console.warn('❌ Speech recognition not available');      //this.showToast2('Speech recognition not available.', 'warning');
        return;
      }
      const permStatus = await SpeechRecognition.checkPermissions();     /* 2️⃣  Check existing permission */
      if (!permStatus.speechRecognition ) {
        const reqStatus = await SpeechRecognition.requestPermissions();
        if (!reqStatus.speechRecognition ) {
          console.warn('❌ Microphone permission not granted'); 
		  //this.showToast2('❌ Microphone permission not granted', 'warning');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize native speech recognition:', error);
     // this.showToast2(String(error));
    }
  }
  submitTheAnimatedValueVoice(score: number){         
    if (this.voiceUIActive && this.riskScore !== null) {     //Speak thescore
      const score = this.riskScore * 100;
      TextToSpeech.speak({ text: `Your risk score is ${Math.round(score)} percent. ${this.riskInterpretation}`, lang: 'en-US', rate: 1.0 });
    }   
  }
  async showToast2(message: string, color: 'danger' | 'success' | 'warning' | 'primary' = 'danger') {
    const toast = await this.toastController.create({ message, duration: 3000, position: 'bottom',       // stays anchored to the bottom
      color     // cssClass: 'center-screen-toast',
    });
    toast.present();
  }

  // Voice questions
	questions: { key: string; question: string }[] = []; // start empty
	
	
	// Hypertension
	private hypertensionQuestions = this.buildQuestionsFromFields(this.hypertensionFields);

	// Arthritis
	private arthritisQuestions = this.buildQuestionsFromFields(this.arthritisFields);

	// Lung Cancer
	private lungCancerQuestions = this.buildQuestionsFromFields(this.lungCancerFields);

	// Asthma Cancer
	private asthmaQuestions = this.buildQuestionsFromFields(this.asthmaFields);

	// Diabetes Cancer
	private diabetesQuestions = this.buildQuestionsFromFields(this.diabetesFields);

	
	  
	// Auto-generate voice questions from fields[] inside the disease groups
	private buildQuestionsFromFields(fieldGroups: { title: string; fields: Field[] }[]) {
	  return fieldGroups
		.reduce((acc: Field[], group) => acc.concat(group.fields), []) // flatten manually
		.map((f: Field) => ({
		  key: f.key,
		  question: f.label.endsWith('?') ? f.label : `${f.label}?`
		}));
	}


	private getQuestionsForDisease(id: number) {
	  switch (id) {
		case 0: return this.hypertensionQuestions;
		case 1: return this.arthritisQuestions;
		case 2: return this.lungCancerQuestions;
		case 3: return this.asthmaQuestions;
		case 4: return this.diabetesQuestions;
		default: return [];
	  }
	}
	
	



  isListening = false; // Process the voice answer
  async processSpeechAnswer(answer: string) {
    if (!this.voiceUIActive) return;
    this.isListening = false; this.micState = 'idle';
    const currentKey = this.questions[this.currentQuestionIndex].key;
	 
	 const loading2 = await this.loadingCtrl.create({
		message: 'Processing...',
		spinner: 'lines', // 'bubbles', 'dots', etc. also available
		duration: 0 /* 0 = manual dismiss */    }); 
	  
	
	  await loading2.present();


    this.http.post<any>(`${this.host_address_parse}/parse_speech`, { questionKey: currentKey, text: answer}).subscribe(response => {
      const extractedValue = response.extractedValue; console.log(extractedValue); this.responseMessage = 'Response: '+answer;
      if (extractedValue === null || extractedValue === undefined || extractedValue === '') { // If extraction failed (e.g. null), ask again
		this.statusMessage = "I couldn’t understand. Let’s try again...";
        setTimeout(() => { this.askNextQuestion();  /* repeat current question*/}, 1000);
        return;
      }
      this.formData[currentKey] = extractedValue;
      console.log(`Extracted value for ${currentKey}:`, extractedValue);
      this.currentQuestionIndex++;
	  loading2.dismiss(); //stop loading
      if (this.currentQuestionIndex < this.questions.length) { this.askNextQuestion(); } else {
        console.log('All questions answered. Final formData:', this.formData); 
		//alert('All questions answered! You can now submit the form.' +  JSON.stringify(this.formData ,null, 2));
        this.submitVoiceResult();
      }
    }, error => {
      console.error('NLP extraction failed:', error); alert('Sorry, I could not understand. Please try again.' + 'Error: '+ JSON.stringify(error ,null, 2));
      setTimeout(() => { this.askNextQuestion(); }, 1000);
    });
  }

  
  async submitVoiceResult(): Promise<void>{
	  
	 const loading = await this.loadingCtrl.create({
		message: 'Predicting...',
		spinner: 'circles', // 'bubbles', 'dots', etc. also available
		duration: 0 // 0 = manual dismiss
	  }); 
	  await loading.present();
    
    if (this.activeDisease != null){
      console.table(this.formData); //this.submitStore(); 
	  const processedData = this.preprocessData(this.formData);
      const formData = processedData; console.table(formData);
      console.log('Disease:', this.diseases[this.activeDisease].name);         
      const disease_url = this.diseases[this.activeDisease].name.toLowerCase();
      this.http.post<any>(`${this.host_address}/predict/${disease_url}`, processedData)
        .subscribe(response => {
          console.log('Full Response:', response);         // Get the risk score from the response and update the riskScore property
          loading.dismiss(); //stop loading
		  this.riskScore = response.ncd_probability; 
		  response.final_narrative; 
		  this.SumittedForm=true;
          this.animateRiskScore(this.riskScore!*100, 2000 ,true);        //Animate Count
		  
		  setTimeout(() => { this.typeText(response.final_narrative); }, 5000);
		   if(this.riskScore){
			   let percentage = Math.floor(Math.round(this.riskScore*100) || -1);
			  this.submitStore( percentage  );
		  }
		  
          console.log('Predicted Risk Score:', this.riskScore);
        }, error => { loading.dismiss(); console.error('Error occurred during prediction:', error); });
    }
  }
  


		async askNextQuestion() {
			if (!this.voiceUIActive) return; this.loadingCtrl.dismiss();
			if (this.currentQuestionIndex >= this.questions.length) return;
			const q = this.questions[this.currentQuestionIndex].question;
			this.zone.run(() => { this.statusMessage = 'Question: ' + q; this.micState = 'idle'; });
			
			try {
				//await this.speakWithOpenAI(q);
				//await this.speakWithBackend(q);
				
				
				const platform = Capacitor.getPlatform();

				if (platform === 'web') {
					await this.speakWithBackend(q);
				}else{
					await Ttsplugin.speak({ text: q });
				}
				//await Ttsplugin.speak({ text: q });
			  //await TextToSpeech.speak({ text: q, lang: 'en-US', rate: 1.0,});      // Use native TTS
			  this.zone.run(() => { this.statusMessage = '🎤 Listening… please speak now'; setTimeout(() => { this.startListening(); }, 1000); });      //  After speaking, delay slightly and start listening 
			   // slight delay to let audio settle
			} catch (err) { console.error('TTS error:', err); this.showToast2("Error: "+err); }
		}
	  
	  
		
		/*
		async speakWithBackend(text: string): Promise<void> {
			
			return new Promise(async (resolve, reject) => {
			
				  const response = await fetch(`${this.host_address_tts}/tts`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ text }),
				  });

				  const blob = await response.blob();
				  const url = URL.createObjectURL(blob);
				  const audio = new Audio(url);
				  // ✅ wait until the audio finishes
				  audio.onended = () => { resolve(); };
				  await audio.play();
			}); 
		}
*/

	async speakWithBackend(text: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${this.host_address_tts}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      // Force blob as MP3
      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });

      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        URL.revokeObjectURL(url); // cleanup
        resolve();
      };

      await audio.play();
    } catch (err) {
      reject(err);
    }
  });
}

  

	  async startListening() {
		if (!this.voiceUIActive) return;
		// this.currentQuestionIndex = this.questions.length;  this.submitVoiceResult()                            //skipToVoice 1/2   
		
		try { 
		
		
			if (Capacitor.getPlatform() === 'web') {
			  if (!this.webSpeechRecognition) this.initWebSpeechRecognition();
			  this.webSpeechRecognition.stop();
			  this.webSpeechRecognition.start();
			   // Stop and restart after a max duration (e.g., 10s)
			  const MAX_DURATION = 10000; // 10 seconds
			  const restartTimer = setTimeout(() => {
				this.startListening();
				this.webSpeechRecognition.stop();
				this.webSpeechRecognition.start();
				
			  }, MAX_DURATION);

			  this.webSpeechRecognition.onresult = (event: any) => {
				clearTimeout(restartTimer);
				const transcript = event.results[0][0].transcript;
				console.log('Recognized speech:', transcript);
				this.showToast2(String(transcript), 'warning');
				this.zone.run(() => { this.processSpeechAnswer(transcript); });
			  };

			  this.webSpeechRecognition.onerror = (event: any) => {
				clearTimeout(restartTimer);
				console.error('Speech error', event);
				//this.webSpeechRecognition.stop();
				//this.startListening();
				this.askNextQuestion();
			  };
			} else {
				this.zone.run(() => { this.statusMessage = '🎤 Listening…'; this.micState = 'listening'; this.isListening = true; });
			  const result = await SpeechRecognition.start({ language: 'en-US', popup: false, maxResults: 1, partialResults: false, });
			  const transcript = result.matches?.[0] || ''; console.log('Recognized speech:', transcript);
			  this.showToast2( String(transcript), 'warning');
			  this.zone.run(() => { this.processSpeechAnswer(transcript); });  
			}
		} catch (err) {
		  console.error('Error starting speech recognition:', err);
		  this.showToast2(err instanceof Error ? err.message : String(err), 'danger');
		  this.zone.run(() => {
			this.statusMessage = 'I didn’t catch that. Asking again…';
			this.micState = 'idle';
			this.isListening = false;
		  });
		  setTimeout(() => this.askNextQuestion(), 700);
		}/**/
	  }
  
  // Dark Mode Switch---------------------------

	 isDarkMode = false;    introSeen = 0;

	 
  

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
    //this.showToast2(`DARK MODE: ${this.isDarkMode ? 'ON' : 'OFF'}`, 'success');
  }
  setTheme(theme: string) {
    document.body.classList.toggle('dark', theme === 'dark');
    this.isDarkMode = theme === 'dark';
  }
	// Dark Mode Switch---------------------------

	  popoverEvent: any; isPopoverOpen = false;
	  openPopover(ev: Event) { this.popoverEvent = ev; this.isPopoverOpen = true; }
	  
	  
  
  
  
	payment_balance: any;
	
	async ngOnInit() {
	  
	  await this.loadTheme();
	  await this.sqliteService.init();

	  this.userService.user$.subscribe(user => {
		this.currentUser = user;
		this.username = user?.id || '';
		this.userRole = user?.role || '';
		this.introSeen = user?.introSeen || 0;  // Use ?? false to default
		this.paymentUseCount = user?.paymentUseCount || 0;  // Use ?? false to default
		
		if(this.userRole === 'Patient')
			this.showToast2('Logged In Successfully As: ' + this.username, 'success');
		console.log("paymentUseCount : " + this.paymentUseCount);
		this.payment_balance = this.sqliteService.getPaymentBalanceById(this.username);
		
	
	
	  });  
	}
 

//--------- users ----------------------------------------
  username = ''; userRole = ''; 
  currentUser = this.userService.getcurrentUser();
   paymentUseCount = 0;

	async logout() {
	  try {
		console.log('Logging out...');
		

		const num = await this.sqliteService.getIntroSeen(this.username, this.userRole);
		//this.introSeen = true;
		await this.sqliteService.setIntroSeen(this.username , 5);
		await this.showToast2('Logged Out Successfully As: ' +  this.username, 'success');

		/*
		await this.paymentUseCount++;//Save the counting of tries
		await this.sqliteService.setPaymentCountById(this.username, this.paymentUseCount);
		*/


		await this.userService.clearUser();
		await this.popoverCtrl.dismiss();
		this.voiceUIActive = false;
		
	  this.navCtrl.navigateRoot('/auth', { replaceUrl: true });
      this.router.navigateByUrl('/auth',  { replaceUrl: true });

	  } catch (error: any) {
		console.error('Logout error:', error);
		this.showToast2('Logout error:' + error);
		
	  }
	}



  closeMenu() {
    this.menuCtrl.close();
  }
   

  //--------------storedata
  

	async submitStore(Score: number) {
	  if (this.activeDisease != null) {
		  
		try{
			const record = {
			 
			  userId: this.username, // assuming this is the logged in username
			  condition: this.diseases[this.activeDisease].name,
			  //condition: this.diseasesName,
			  risk: Score || -1,
			  date: new Date().toISOString().split('T')[0],
			  formData: { ...this.formData }
			};
			
			await this.paymentUseCount++;//Save the counting of tries
			await this.sqliteService.setPaymentCountById(this.username, this.paymentUseCount);

			
			await this.sqliteService.addPatientRecord(record);

			console.log('Record saved to SQLite:', JSON.stringify(record, null, 2) ); 
			//this.showToast2('Record saved to SQLite:'+  JSON.stringify(record, null, 2), 'success');
			
		}catch(error: any){ this.showToast2('Error' + error); }
	  }
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
      
	  await this.sqliteService.setIntroSeen(this.currentUser?.id || '', 5);
	  //this.introSeen = 5;
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
  
  
  //------------------TTS Plugin
  
  //const { Ttsplugin } = Plugins; // your native plugin



  //----------------------------------


	constructor(private alertController: AlertController, private http: HttpClient,  
    private zone: NgZone,  /*  ← inject NgZone!*/ private toastController: ToastController,private loadingCtrl: LoadingController, 
    private router: Router ,private popoverCtrl: PopoverController, private menuCtrl: MenuController , private sqliteService: SQLiteService, private userService: UserService,private navCtrl: NavController,
    private modalCtrl: ModalController,
	) 
    { 
		this.chunkFields(); this.initFormData();  
		this.initSpeechRecognition(); 
		this.initWebSpeechRecognition(); 
		this.loadTheme();
	}
  
  
  

	async showError2(message: string) {
		await Toast.show({
		  text: message,
		  duration: 'short', // 'short' (2s) or 'long' (3.5s)
		  position: 'bottom' // 'top', 'center', 'bottom'
		});
	}
	
	//riskInterp_typed = '';
	//-------------TypingOut Interpretation-----------------------	
	typeText(riskInterp_typed: string) {
	  this.riskInterp = "";
	  let i = 0;
	  const speed = 20; // milliseconds per character

	  const interval = setInterval(() => {
		this.riskInterp += riskInterp_typed.charAt(i);
		i++;
		if (i >= riskInterp_typed.length) clearInterval(interval);
	  }, speed);
	}
	
	//-------------Comments-------------
	async commentsShow(){
		try {
			const raw = await this.sqliteService.loadCommentsdByPatientIdForAllCon(this.username);

			// Force-shape into PatientComment[]
			const commentsPage: PatientComment[] = raw.map((c: any) => ({
			  patient_id: c.patient_id,
			  doctor_id: c.doctor_id,
			  comment: c.comment,
			  note: c.note,
			  condition: c.condition,
			  date: c.date
			}));

			console.log("Fetched comments:", commentsPage);

			const modal = await this.modalCtrl.create({
			  component: CommentsPageComponent,
			  componentProps: { commentsPage }
			});

			await modal.present();
		  } catch (err) {
			this.showError2('Comments Error: ' + err);
			console.error("Error loading comments", err);
		  }
	}
	
	
	//------------------History----------------------
	
		
	async showHistory() {
	  try {
		const raw = await this.sqliteService.loadHistoryByPatientId(this.username);

		const history: PatientHistory[] = raw.map((h: any) => ({
		  user_id: h.user_id,
		  condition: h.condition,
		  risk: h.risk,
		  date: h.date
		}));

		console.log("Fetched history:", history);

		const modal = await this.modalCtrl.create({
		  component: HistoryPageComponent,
		  componentProps: { history }
		});

		await modal.present();
	  } catch (err) {
		this.showError2('History Error: ' + err);
		console.error("Error loading history", err);
	  }
	}
	
	
	

}

import { CommentsPageComponent } from './comments'; 



import { ModalController } from '@ionic/angular';




interface PatientComment {
	patient_id : string;
	doctor_id : string;
	comment : string;
	note : string;
	condition : string;
	date: string; 
}


import { HistoryPageComponent } from './history';

interface PatientHistory {
  user_id: string;
  condition: string;
  risk: number;
  date: string;
}


 


interface Ttsplugin {
  speak(options: { text: string }): Promise<{ success: boolean }>;
}

















//import { Ttsplugin } from 'ttsplugin';
import { registerPlugin } from '@capacitor/core';
const Ttsplugin = registerPlugin<Ttsplugin>('Ttsplugin');

//const Ttsplugin = registerPlugin<TtspluginPlugin>('Ttsplugin');
//const { Ttsplugin } = Plugins; // your native plugin
import { SQLiteService } from '../auth/auth.service'; // <-- our DB service



import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router'; 
import { PopoverController, NavController  } from '@ionic/angular';
import { MenuController } from '@ionic/angular';

import { Toast } from '@capacitor/toast';
import { UserService, User } from '../auth/userService'; // <-- our DB service

import { LoadingController } from '@ionic/angular';


import { Capacitor } from '@capacitor/core';


import OpenAI from "openai";

















interface Field {
  key: string;
  label: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  
  map?: { [label: string]: number };
}

