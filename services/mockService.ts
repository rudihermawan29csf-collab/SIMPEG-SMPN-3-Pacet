import { EmployeeData, User, DocumentItem, DashboardStats, EmploymentStatus, Gender } from '../types';

// --- KONFIGURASI API ---
// Ganti dengan URL Google Apps Script Anda yang sudah dideploy sebagai Web App (Exec)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsXLjoDKJfhBplFY73MwWAVcq17KRIat-LmAeD8dZrZ04rGLrlxVzI611OF5sacbP_/exec"; 

const STORAGE_KEY = 'simpeg_local_data';
let cachedEmployees: EmployeeData[] | null = null;
let isOfflineMode = false;

// --- LOCAL STORAGE HELPER ---
const saveToLocal = (data: EmployeeData[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Gagal menyimpan ke local storage", e);
    }
};

const loadFromLocal = (): EmployeeData[] | null => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};

// --- OFFLINE DATA FALLBACK ---
const OFFLINE_EMPLOYEES: EmployeeData[] = [
  {
    id: 'offline-1',
    fullName: 'Budi Santoso (Contoh)',
    nik: '3201010101010001',
    nip: '198001012010011001',
    birthPlace: 'Bandung',
    birthDate: '1980-01-01',
    gender: Gender.L,
    religion: 'Islam',
    maritalStatus: 'Kawin',
    address: 'Jl. Merdeka No. 1',
    phone: '081234567890',
    email: 'budi@example.com',
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
    completeness: 100
  }
];

// --- API CLIENT HELPER ---
const apiCall = async (action: string, data: any = {}) => {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("YOUR_SCRIPT_ID_HERE")) {
    throw new Error("URL Server belum disetting");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    
    isOfflineMode = false;
    return result.data || result;

  } catch (error: any) {
    clearTimeout(timeoutId);
    isOfflineMode = true;
    console.warn(`[API Fail] ${action}: Menggunakan mode offline/lokal.`);
    throw error;
  }
};

// --- DATA SERVICE ---
export const mockDataService = {
  isOffline: () => isOfflineMode,

  getStats: async (): Promise<DashboardStats> => {
    const employees = await mockDataService.getAllEmployees();
    return {
        totalEmployees: employees.length,
        totalPNS: employees.filter((e: any) => e.status === EmploymentStatus.PNS).length,
        totalPPPK: employees.filter((e: any) => e.status === EmploymentStatus.PPPK).length,
        totalHonorer: employees.filter((e: any) => ['Honorer', 'GTT', 'PTT'].includes(e.status)).length,
        documentsUploaded: 0 
    };
  },

  getAllEmployees: async (): Promise<EmployeeData[]> => {
    // 1. Coba Ambil dari Server (Prioritas Utama untuk Sync Antar Perangkat)
    try {
        const serverData = await apiCall('getEmployees');
        if (Array.isArray(serverData)) {
            cachedEmployees = serverData;
            saveToLocal(serverData); // Update backup lokal
            return serverData;
        }
    } catch (e) {
        // Abaikan error, lanjut ke fallback
    }

    // 2. Jika Server Gagal, Ambil Cache Memori
    if (cachedEmployees) return cachedEmployees;

    // 3. Jika Memori Kosong, Ambil LocalStorage (Agar refresh aman)
    const localData = loadFromLocal();
    if (localData) {
        cachedEmployees = localData;
        return localData;
    }

    // 4. Terakhir, Data Dummy
    cachedEmployees = OFFLINE_EMPLOYEES;
    return OFFLINE_EMPLOYEES;
  },

  getEmployeeById: async (id: string): Promise<EmployeeData | undefined> => {
    const employees = await mockDataService.getAllEmployees();
    return employees.find((e: EmployeeData) => e.id === id);
  },

  updateEmployee: async (data: EmployeeData): Promise<void> => {
    if (!data.id) data.id = data.nip || data.nik || `EMP-${Date.now()}`;

    // 1. Optimistic Update (Update Lokal Dulu)
    let currentData = cachedEmployees || loadFromLocal() || [];
    
    const index = currentData.findIndex(e => e.id === data.id);
    if (index >= 0) {
        currentData[index] = data;
    } else {
        currentData.push(data);
    }
    
    cachedEmployees = currentData;
    saveToLocal(currentData); // Simpan ke browser

    // 2. Kirim ke Server
    try {
        await apiCall('saveEmployee', data);
        // Jika berhasil, tidak perlu update apa-apa lagi
    } catch (e) {
        alert("⚠️ PERINGATAN KONEKSI:\n\nData BERHASIL disimpan di perangkat ini, TETAPI gagal dikirim ke server.\n\nData ini TIDAK AKAN MUNCUL di perangkat lain sampai koneksi pulih.");
    }
  },

  getDocuments: async (employeeId: string): Promise<DocumentItem[]> => {
    // Bisa tambahkan logic serupa untuk dokumen jika perlu
    return []; 
  },

  uploadDocument: async (employeeId: string, docId: string, file: File): Promise<DocumentItem> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Content = (reader.result as string).split(',')[1];
            
            // Jika offline, simulasi sukses
            if (isOfflineMode) {
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
                 }, 500);
                 return;
            }

            try {
                const result = await apiCall('uploadDocument', {
                    employeeId, docType: docId, fileName: file.name, mimeType: file.type, base64Data: base64Content
                });
                resolve({
                    id: docId,
                    type: 'Uploaded Doc',
                    label: file.name,
                    status: 'uploaded',
                    url: result.url,
                    fileName: file.name,
                    uploadedAt: new Date().toLocaleDateString(),
                    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
                });
            } catch (err) {
                // Fallback offline upload simulation
                isOfflineMode = true;
                resolve({
                    id: docId,
                    type: 'Uploaded Doc (Lokal)',
                    label: file.name,
                    status: 'uploaded',
                    url: '#',
                    fileName: file.name,
                    uploadedAt: new Date().toLocaleDateString(),
                    size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
                });
                alert("Upload berhasil secara LOKAL. Dokumen belum masuk Google Drive server.");
            }
        };
        reader.onerror = error => reject(error);
    });
  }
};

// --- AUTH SERVICE ---
export const mockAuthService = {
  getLoginUsers: async () => {
    // Ambil data terbaru (Server > Local > Dummy)
    const employees = await mockDataService.getAllEmployees();
    
    // Transform ke format User Login
    const userList = employees.map((emp: EmployeeData) => ({
        username: emp.nip || emp.nik,
        name: emp.fullName,
        role: 'employee'
    }));
    
    const admin = { username: 'admin', name: 'Administrator', role: 'admin' };
    return [admin, ...userList];
  },

  login: async (username: string, password?: string): Promise<User> => {
    if (username === 'admin') {
      if (password !== 'admin123') throw new Error('Password Admin salah!');
      return { id: 'admin-1', username: 'admin', name: 'Administrator', role: 'admin', avatarUrl: 'https://ui-avatars.com/api/?name=Admin' };
    }
    
    if (password !== 'guru123') throw new Error('Password salah! Gunakan: guru123');
    
    const employees = await mockDataService.getAllEmployees();
    const emp = employees.find((e: EmployeeData) => (e.nip === username || e.nik === username));
    
    if (emp) {
        return {
            id: emp.id,
            username: emp.nip || emp.nik,
            name: emp.fullName,
            role: 'employee',
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName)}&background=random`
        };
    }
    
    // Fallback demo
    if (username === 'demo') return { id: 'demo-1', username: 'demo', name: 'Guru Demo', role: 'employee' };
    
    throw new Error('User tidak ditemukan.');
  },
  
  logout: async () => {}
};