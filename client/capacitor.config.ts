import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rheaaccount.app',
  appName: 'Rhea Account',
  webDir: 'dist',
  server: {
    // Allows HTTPS on Android WebView
    androidScheme: 'https',
    // For development: comment this out for production
    // cleartext: true,
  },
  android: {
    // Allow cleartext HTTP for local testing (remove for production)
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#db2777', // brand pink color
      showSpinner: false,
    },
  },
};

export default config;
