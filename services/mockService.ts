import { EmployeeData, User, DocumentItem, DashboardStats, EmploymentStatus, Gender } from '../types';

// --- KONFIGURASI API ---
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBFhjY_70dhi90RP7vWf5vUQAirA-hGBjrkMYXaOJ-e4GUJAsN25119PCFGA4xDizolg/exec"; 

// --- CACHE SYSTEM ---
// Menyimpan data di memori agar perpindahan halaman INSTAN tidak perlu loading ulang
let cachedEmployees: EmployeeData[] | null = null;
let isOfflineMode = false;

// --- OFFLINE DATA FALLBACK ---
const OFFLINE_EMPLOYEES: EmployeeData[] = [
  {
    id: 'offline-1',
    fullName: 'Budi Santoso (Mode Offline)',
    nik: '3201010101010001',
    nip: '198001012010011001',
    birthPlace: 'Bandung',
    birthDate: '1980-01-01',
    gender: Gender.L,
    religion: 'Islam',
    maritalStatus: 'Kawin',
    address: 'Jl. Merdeka No. 1 (Data Offline)',
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
  },
  {
    id: 'offline-2',
    fullName: 'Siti Aminah (Mode Offline)',
    nik: '3201010101010002',
    birthPlace: 'Cianjur',
    birthDate: '1995-05-15',
    gender: Gender.P,
    religion: 'Islam',
    maritalStatus: 'Belum Kawin',
    address: 'Jl. Pacet No. 5',
    phone: '085678901234',
    email: 'siti@example.com',
    status: EmploymentStatus.HONORER,
    employeeType: 'Tenaga Kependidikan',
    position: 'Staf TU',
    mainTask: 'Administrasi',
    unit: 'SMPN 3 Pacet',
    tmtDuty: '2020-07-01',
    teachingHours: 0,
    skNumber: '421/05/2020',
    skOfficial: 'Kepala Sekolah',
    education: { level: 'D3', major: 'Manajemen Informatika', institution: 'Politeknik', graduationYear: '2016', certificateNumber: 'D3-456' },
    family: [],
    verification: { isVerified: 'Belum Diverifikasi', adminNotes: '', lastUpdated: '2024-02-01' },
    completeness: 40
  }
];

// --- API CLIENT HELPER ---
const apiCall = async (action: string, data: any = {}) => {
  // Jika URL belum diset, langsung offline
  if (APPS_SCRIPT_URL.includes("YOUR_SCRIPT_ID_HERE")) {
    throw new Error("URL Script belum dikonfigurasi");
  }

  // AbortController untuk membatalkan request jika terlalu lama
  const controller = new AbortController();
  // TIMEOUT DIPERCEPAT: 3 Detik. 
  // Google Apps Script kadang lama (cold start), jika > 3 detik anggap offline agar user tidak menunggu.
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
      signal: controller.signal // Pasang signal abort
    });
    
    clearTimeout(timeoutId); // Clear timer jika berhasil connect

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    
    isOfflineMode = false; // Koneksi berhasil
    return result.data || result;

  } catch (error: any) {
    clearTimeout(timeoutId);
    isOfflineMode = true; // Set flag offline
    
    // Log error tapi jangan throw ke UI agar tidak crash, biarkan service handle fallback
    if (error.name === 'AbortError') {
      console.warn(`[Timeout] API '${action}' terlalu lama (>3s). Beralih ke Mode Offline.`);
    } else {
      console.warn(`[API Fail] ${action}:`, error);
    }
    throw error; // Re-throw agar function pemanggil tau ini gagal
  }
};

// --- AUTH SERVICE ---
export const mockAuthService = {
  getLoginUsers: async () => {
    // Cek Cache dulu
    if (cachedEmployees) {
        return transformEmployeesToUsers(cachedEmployees);
    }

    try {
        const result = await apiCall('getEmployees');
        if (Array.isArray(result) && result.length > 0) {
            cachedEmployees = result; // SIMPAN KE CACHE
            return transformEmployeesToUsers(result);
        }
        throw new Error("Data kosong");
    } catch (e) {
        // Fallback Offline
        if (!cachedEmployees) cachedEmployees = OFFLINE_EMPLOYEES;
        return transformEmployeesToUsers(OFFLINE_EMPLOYEES);
    }
  },

  login: async (username: string, password?: string): Promise<User> => {
    // Validasi Admin (Lokal)
    if (username === 'admin') {
      if (password !== 'admin123') throw new Error('Password Admin salah!');
      return {
        id: 'admin-1',
        username: 'admin',
        name: 'Administrator',
        role: 'admin',
        avatarUrl: 'https://ui-avatars.com/api/?name=Administrator&background=0D8ABC&color=fff'
      };
    }
    
    if (password !== 'guru123') throw new Error('Password salah! Gunakan: guru123');
    
    // Pastikan data pegawai ada (dari cache atau offline)
    let employees = cachedEmployees || OFFLINE_EMPLOYEES;
    
    // Cari user
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
    
    // Fallback khusus demo user jika tidak ada di list
    if (username === 'demo') {
         return { id: 'demo-1', username: 'demo', name: 'Guru Demo', role: 'employee', avatarUrl: `https://ui-avatars.com/api/?name=Guru+Demo&background=random` };
    }
    
    throw new Error('User tidak ditemukan.');
  },
  
  logout: async () => {
      // Opsional: Clear cache saat logout jika ingin refresh data saat login ulang
      // cachedEmployees = null; 
  }
};

// Helper untuk mengubah data pegawai jadi list user login
const transformEmployeesToUsers = (employees: EmployeeData[]) => {
    const userList = employees.map((emp: EmployeeData) => ({
        username: emp.nip || emp.nik,
        name: emp.fullName,
        role: 'employee'
    }));
    const admin = { username: 'admin', name: 'Administrator', role: 'admin' };
    return [admin, ...userList];
};

// --- DATA SERVICE ---
export const mockDataService = {
  // Method untuk cek status koneksi (untuk UI)
  isOffline: () => isOfflineMode,

  getStats: async (): Promise<DashboardStats> => {
    // Gunakan cache jika ada, agar Dashboard INSTAN
    let employees = cachedEmployees;

    if (!employees) {
        try {
            employees = await apiCall('getEmployees');
            cachedEmployees = employees;
        } catch (e) {
            employees = OFFLINE_EMPLOYEES;
            cachedEmployees = OFFLINE_EMPLOYEES; // Gunakan offline data ke cache
        }
    }
    
    if (!Array.isArray(employees)) employees = [];

    return {
        totalEmployees: employees.length,
        totalPNS: employees.filter((e: any) => e.status === EmploymentStatus.PNS).length,
        totalPPPK: employees.filter((e: any) => e.status === EmploymentStatus.PPPK).length,
        totalHonorer: employees.filter((e: any) => ['Honorer', 'GTT', 'PTT'].includes(e.status)).length,
        documentsUploaded: 0 
    };
  },

  getAllEmployees: async (): Promise<EmployeeData[]> => {
    // 1. Return Cache Instant
    if (cachedEmployees) {
        // Opsional: Bisa trigger fetch in background untuk update data (Stale-while-revalidate)
        // Tapi untuk performa maksimal, kita return cache saja.
        return cachedEmployees;
    }

    // 2. Jika tidak ada cache, Fetch
    try {
        const res = await apiCall('getEmployees');
        if (Array.isArray(res)) {
            cachedEmployees = res;
            return res;
        }
        return [];
    } catch (e) {
        // 3. Fallback Offline
        cachedEmployees = OFFLINE_EMPLOYEES;
        return OFFLINE_EMPLOYEES;
    }
  },

  getEmployeeById: async (id: string): Promise<EmployeeData | undefined> => {
    // Selalu gunakan logic getAllEmployees agar memanfaatkan Cache
    const employees = await mockDataService.getAllEmployees();
    return employees.find((e: EmployeeData) => e.id === id);
  },

  updateEmployee: async (data: EmployeeData): Promise<void> => {
    if (!data.id) {
        data.id = data.nip || data.nik || `EMP-${Date.now()}`;
    }

    // Update Cache Optimistic (Supaya UI langsung berubah tanpa nunggu server)
    if (cachedEmployees) {
        const index = cachedEmployees.findIndex(e => e.id === data.id);
        if (index >= 0) {
            cachedEmployees[index] = data;
        } else {
            cachedEmployees.push(data);
        }
    }

    // Kirim ke server (Fire and Forget atau await)
    try {
        await apiCall('saveEmployee', data);
    } catch (e) {
        console.warn("Gagal simpan ke server, data hanya tersimpan lokal sementara.");
        alert("Mode Offline: Data disimpan sementara di browser (akan hilang jika refresh).");
    }
  },

  getDocuments: async (employeeId: string): Promise<DocumentItem[]> => {
    return []; 
  },

  uploadDocument: async (employeeId: string, docId: string, file: File): Promise<DocumentItem> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Content = (reader.result as string).split(',')[1];
            
            // Simulasi success jika offline
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
                    employeeId: employeeId,
                    docType: docId,
                    fileName: file.name,
                    mimeType: file.type,
                    base64Data: base64Content
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
                reject(err);
            }
        };
        reader.onerror = error => reject(error);
    });
  }
};