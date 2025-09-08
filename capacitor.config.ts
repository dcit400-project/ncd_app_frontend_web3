import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'myApp',
  webDir: 'www',

  server: {
    androidScheme: 'http',
    cleartext: true,
    hostname: 'localhost'  // or IP if running server externally
  }
   

};


export default config;
