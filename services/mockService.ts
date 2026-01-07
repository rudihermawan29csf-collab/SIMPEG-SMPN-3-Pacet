import { EmployeeData, User, DocumentItem, DashboardStats, EmploymentStatus, Gender } from '../types';
import { auth, db, isFirebaseConfigured, GOOGLE_SCRIPT_URL, isDriveConfigured } from '../firebaseConfig';
import * as firebaseAuth from 'firebase/auth';
import { 
  collection, getDocs, doc, setDoc, getDoc, deleteDoc
} from 'firebase/firestore';

// --- DATA DUMMY (FALLBACK MODE) ---
const OFFLINE_EMPLOYEES: EmployeeData[] = [
  {
    id: 'offline-1',
    fullName: 'Budi Santoso (Demo)',
    nik: '3201010101010001',
    nip: '198001012010011001',
    birthPlace: 'Bandung',
    birthDate: '1980-01-01',
    gender: Gender.L,
    religion: 'Islam',
    maritalStatus: 'Kawin',
    address: 'Jl. Merdeka No. 1, Pacet',
    phone: '081234567890',
    email: 'budi@smpn3.id',
    status: EmploymentStatus.PNS,
    employeeType: 'Guru',
    position: 'Guru Matematika',
    mainTask: 'Mengajar',
    unit: 'SMPN 3 Pacet',
    tmtDuty: '2010-01-01',
    teachingHours: 24,
    skNumber: '800/123/2010',
    skOfficial: 'Bupati',
    education: { level: 'S1', major: 'Pendidikan Matematika', institution: 'UPI', graduationYear: '2004', certificateNumber: 'IJZ-123' },
    family: [],
    verification: { isVerified: 'Disetujui', adminNotes: '', lastUpdated: '2024-01-01' },
    completeness: 85
  },
  {
    id: 'offline-2',
    fullName: 'Siti Aminah (Demo)',
    nik: '3201010101010002',
    birthPlace: 'Cianjur',
    birthDate: '1995-05-15',
    gender: Gender.P,
    religion: 'Islam',
    maritalStatus: 'Belum Kawin',
    address: 'Jl. Raya Cipanas',
    phone: '085712345678',
    email: 'siti@smpn3.id',
    status: EmploymentStatus.HONORER,
    employeeType: 'Tenaga Kependidikan',
    position: 'Staf Tata Usaha',
    mainTask: 'Administrasi',
    unit: 'SMPN 3 Pacet',
    tmtDuty: '2020-07-01',
    teachingHours: 0,
    skNumber: '421/SK-HONOR/2020',
    skOfficial: 'Kepala Sekolah',
    education: { level: 'D3', major: 'Manajemen Informatika', institution: 'Politeknik', graduationYear: '2019', certificateNumber: 'IJZ-456' },
    family: [],
    verification: { isVerified: 'Belum Diverifikasi', adminNotes: '', lastUpdated: '' },
    completeness: 40
  }
];

const DOMAIN = "@smpn3.id";

// Helper: Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- DATA SERVICE ---
export const mockDataService = {
  // Jika config belum diganti, paksa mode offline
  isOffline: () => !isFirebaseConfigured,

  getStats: async (): Promise<DashboardStats> => {
    // Gunakan data fallback jika offline/error
    let employees = [];
    try {
      if (!isFirebaseConfigured) throw new Error("Unconfigured");
      employees = await mockDataService.getAllEmployees();
    } catch (e) {
      employees = OFFLINE_EMPLOYEES;
    }

    return {
      totalEmployees: employees.length,
      totalPNS: employees.filter((e: any) => e.status === EmploymentStatus.PNS).length,
      totalPPPK: employees.filter((e: any) => e.status === EmploymentStatus.PPPK).length,
      totalHonorer: employees.filter((e: any) => ['Honorer', 'GTT', 'PTT'].includes(e.status)).length,
      documentsUploaded: 0 // Nanti bisa dihitung real dari subkoleksi jika perlu
    };
  },

  getAllEmployees: async (): Promise<EmployeeData[]> => {
    if (!isFirebaseConfigured) return OFFLINE_EMPLOYEES;

    try {
      const querySnapshot = await getDocs(collection(db, "employees"));
      const employees: EmployeeData[] = [];
      querySnapshot.forEach((doc) => {
        employees.push({ id: doc.id, ...doc.data() } as EmployeeData);
      });
      return employees.length > 0 ? employees : OFFLINE_EMPLOYEES; // Fallback jika DB kosong
    } catch (error) {
      console.warn("Firebase Error (getAllEmployees):", error);
      return OFFLINE_EMPLOYEES; // Fallback agar UI tetap jalan
    }
  },

  getEmployeeById: async (id: string): Promise<EmployeeData | undefined> => {
    if (!isFirebaseConfigured) return OFFLINE_EMPLOYEES.find(e => e.id === id);

    try {
      const docRef = doc(db, "employees", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as EmployeeData;
      }
      return undefined;
    } catch (error) {
      console.warn("Firebase Error (getById):", error);
      return OFFLINE_EMPLOYEES.find(e => e.id === id);
    }
  },

  updateEmployee: async (data: EmployeeData): Promise<void> => {
    if (!isFirebaseConfigured) {
      alert("Mode Demo: Data tidak disimpan ke server (Firebase belum dikonfigurasi).");
      return;
    }

    try {
      const docId = data.id || data.nik || `new_${Date.now()}`;
      const docRef = doc(db, "employees", docId);
      await setDoc(docRef, { ...data, id: docId }, { merge: true });
    } catch (error) {
      console.error("Error updateEmployee:", error);
      alert("Gagal menyimpan data. Periksa koneksi atau izin Firebase.");
      throw error;
    }
  },

  // --- NEW: GET DOCUMENTS FROM FIRESTORE SUBCOLLECTION (NOT STORAGE LIST) ---
  getDocuments: async (employeeId: string): Promise<DocumentItem[]> => {
    if (!isFirebaseConfigured) return [];

    try {
      // Kita ambil metadata dokumen yang tersimpan di Firestore
      // Path: employees/{id}/documents/{docId}
      const docsRef = collection(db, "employees", employeeId, "documents");
      const snap = await getDocs(docsRef);
      
      const docs: DocumentItem[] = [];
      snap.forEach((doc) => {
        docs.push(doc.data() as DocumentItem);
      });
      
      return docs;
    } catch (error) {
      console.error("Error getting docs:", error);
      return [];
    }
  },

  // --- NEW: UPLOAD TO GOOGLE DRIVE VIA APPS SCRIPT & SAVE METADATA TO FIRESTORE ---
  uploadDocument: async (employeeId: string, docId: string, file: File): Promise<DocumentItem> => {
    
    // 1. Validasi Mode
    if (!isFirebaseConfigured || !isDriveConfigured) {
      // Mock Upload
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: docId,
            type: 'Uploaded Doc',
            label: file.name,
            status: 'uploaded',
            url: '#',
            fileName: file.name,
            uploadedAt: new Date().toLocaleDateString(),
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
          });
        }, 1500);
      });
    }

    try {
      // 2. Convert File ke Base64 untuk dikirim ke Google Script
      const base64Data = await fileToBase64(file);
      
      // 3. Kirim ke Google Apps Script Web App
      // Kita gunakan fetch POST dengan 'no-cors' biasanya tricky untuk dapat response JSON,
      // tapi dengan Apps Script yang di set "Anyone", kita coba standard POST.
      // NOTE: Mengirim text/plain agar tidak kena preflight OPTIONS request yang sering gagal di GAS.
      const payload = {
        fileData: base64Data,
        fileName: `${employeeId}_${docId}_${file.name}`,
        mimeType: file.type,
        employeeName: employeeId
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.result !== 'success') {
        throw new Error(result.error || "Gagal upload ke Google Drive");
      }

      // 4. Sukses Upload ke Drive -> Simpan Metadata ke Firestore
      const newDoc: DocumentItem = {
        id: docId,
        type: 'Uploaded Doc',
        label: file.name, // Label asli dari input form
        status: 'uploaded',
        url: result.url, // URL Download dari Drive
        fileName: file.name,
        uploadedAt: new Date().toLocaleDateString('id-ID'),
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
      };

      // Simpan ke subcollection: employees/{id}/documents/{docId}
      const docRef = doc(db, "employees", employeeId, "documents", docId);
      await setDoc(docRef, newDoc);

      return newDoc;

    } catch (error) {
      console.error("Error uploadDocument:", error);
      throw error;
    }
  }
};

// --- AUTH SERVICE (SAME AS BEFORE) ---
export const mockAuthService = {
  getLoginUsers: async () => {
    if (!isFirebaseConfigured) {
        return [
            { username: 'admin', name: 'Administrator (Demo)', role: 'admin' },
            { username: '198001012010011001', name: 'Budi Santoso (Demo)', role: 'employee' }
        ];
    }

    try {
        const emps = await mockDataService.getAllEmployees();
        const users = emps.map(e => ({
            username: e.email || e.nip || e.nik, // Prefer email for login list
            name: e.fullName,
            role: 'employee'
        }));
        // Admin hardcoded for list visibility (in real app, usually hidden)
        users.unshift({ username: 'admin@smpn3.id', name: 'Administrator', role: 'admin' });
        return users;
    } catch (e) {
        return [];
    }
  },

  login: async (username: string, password?: string): Promise<User> => {
    if (!isFirebaseConfigured) {
        if (username === 'admin') {
            if (password !== 'admin123') throw new Error('Password Admin Demo: admin123');
            return { id: 'admin', username: 'admin', name: 'Administrator (Demo)', role: 'admin', avatarUrl: 'https://ui-avatars.com/api/?name=Admin' };
        }
        return { 
            id: 'offline-1', 
            username: username, 
            name: 'Guru Demo', 
            role: 'employee', 
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}` 
        };
    }

    try {
      // Normalize email input
      let email = username.trim();
      
      // AUTO-FIX: Handle 'admin' shorthand
      if (email.toLowerCase() === 'admin') {
        email = 'admin@smpn3.id';
      } 
      // AUTO-FIX: Handle NIP/Username without domain
      else if (!email.includes('@')) {
        email = `${email}@smpn3.id`; 
      }

      const userCredential = await firebaseAuth.signInWithEmailAndPassword(auth, email, password || '');
      const firebaseUser = userCredential.user;

      // Determine role based on specific email or Firestore data
      // For MVP: Admin email is hardcoded or checked via a specific collection
      let role: 'admin' | 'employee' = 'employee';
      
      // Simple Admin Check
      if (email.startsWith('admin') || email === 'operator@smpn3.id') {
        role = 'admin';
      }

      // Fetch user detail from Firestore "employees" collection to get Real Name
      let fullName = username;
      try {
          const userDoc = await getDoc(doc(db, "employees", firebaseUser.uid));
          if (userDoc.exists()) {
              const data = userDoc.data();
              fullName = data.fullName;
          }
      } catch (e) {
          console.log("No profile yet");
      }

      return {
        id: firebaseUser.uid,
        username: email,
        name: fullName,
        role: role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
      };

    } catch (error: any) {
      console.error("Login Error:", error.code);
      if (
        error.code === 'auth/invalid-credential' || 
        error.code === 'auth/user-not-found' || 
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-email'
      ) {
          throw new Error("Akun tidak ditemukan atau password salah. Jika belum punya akun, silakan Daftar.");
      }
      throw new Error("Login Gagal. " + error.message);
    }
  },

  // NEW REGISTER FUNCTION
  register: async (name: string, email: string, password: string): Promise<User> => {
      if (!isFirebaseConfigured) {
          throw new Error("Tidak bisa mendaftar di Mode Demo. Harap konfigurasi Firebase.");
      }

      try {
          // 1. Create Auth User
          const userCredential = await firebaseAuth.createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;

          // 2. Create Initial Employee Data in Firestore
          // This ensures the app doesn't crash when trying to load their profile
          const newEmployee: EmployeeData = {
              id: firebaseUser.uid,
              fullName: name,
              email: email,
              nik: '',
              birthPlace: '',
              birthDate: '',
              gender: Gender.L, // Default
              religion: 'Islam',
              maritalStatus: 'Belum Kawin',
              address: '',
              phone: '',
              status: EmploymentStatus.HONORER, // Default status
              employeeType: 'Guru',
              position: 'Guru',
              mainTask: 'Mengajar',
              unit: 'SMPN 3 Pacet',
              tmtDuty: new Date().toISOString().split('T')[0],
              teachingHours: 0,
              skNumber: '',
              skOfficial: '',
              education: { level: '', major: '', institution: '', graduationYear: '', certificateNumber: '' },
              family: [],
              verification: { isVerified: 'Belum Diverifikasi', adminNotes: '', lastUpdated: new Date().toLocaleDateString('id-ID') },
              completeness: 10
          };

          await setDoc(doc(db, "employees", firebaseUser.uid), newEmployee);

          return {
              id: firebaseUser.uid,
              username: email,
              name: name,
              role: 'employee',
              avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
          };

      } catch (error: any) {
          console.error("Register Error:", error);
          if (error.code === 'auth/email-already-in-use') {
              throw new Error("Email ini sudah terdaftar. Silakan login.");
          }
          if (error.code === 'auth/weak-password') {
              throw new Error("Password terlalu lemah (min. 6 karakter).");
          }
          throw new Error("Gagal mendaftar: " + error.message);
      }
  },
  
  logout: async () => {
    if (isFirebaseConfigured) await firebaseAuth.signOut(auth);
  }
};