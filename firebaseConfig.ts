// Fix: Use namespace import for firebase/app to avoid 'no exported member' error
import * as firebaseApp from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// Storage tidak lagi diimport karena kita pakai Google Drive via Apps Script

// ⚠️ KONFIGURASI FIREBASE (SUDAH DIUPDATE)
const firebaseConfig = {
  apiKey: "AIzaSyCCmboiFyYYRq8PVa6SQDyzdV6n83gppKA",
  authDomain: "smpn3-pacet-baru.firebaseapp.com",
  projectId: "smpn3-pacet-baru",
  storageBucket: "smpn3-pacet-baru.firebasestorage.app",
  messagingSenderId: "210042270808",
  appId: "1:210042270808:web:74c8f764195b1a2245c62d"
};

// =================================================================================
// 🌍 KONFIGURASI GOOGLE APPS SCRIPT (DRIVE UPLOAD)
// =================================================================================
// Masukkan URL Web App dari Google Apps Script yang sudah dideploy
export const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTsCiq_cDowFnbolQxJ8bJnGlKP-CyrF-aM3Aoje-fRoUbs3efNgHvMsO8Ep1MwWTk/exec"; 

// Cek apakah user sudah mengganti config (Pasti true karena sudah diisi)
export const isFirebaseConfigured = true;

export const isDriveConfigured = 
  !GOOGLE_SCRIPT_URL.includes("ISI_URL_WEB_APP_SCRIPT_GOOGLE_DISINI");

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);
export const auth = firebaseAuth.getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app); // Dihapus, diganti Drive API
