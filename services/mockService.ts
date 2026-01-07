import { EmployeeData, User, DocumentItem, DashboardStats, EmploymentStatus, Gender } from '../types';

// --- KONFIGURASI API ---
// GANTI URL DI BAWAH INI DENGAN URL DEPLOYMENT WEB APP GOOGLE APPS SCRIPT ANDA
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBFhjY_70dhi90RP7vWf5vUQAirA-hGBjrkMYXaOJ-e4GUJAsN25119PCFGA4xDizolg/exec"; 

// --- OFFLINE DATA FALLBACK ---
const OFFLINE_EMPLOYEES: EmployeeData[] = [
  {
    id: 'offline-1',
    fullName: 'Budi Santoso (Offline)',
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
  },
  {
    id: 'offline-2',
    fullName: 'Siti Aminah (Offline)',
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
  if (APPS_SCRIPT_URL.includes("YOUR_SCRIPT_ID_HERE")) {
    console.warn("URL Google Apps Script belum disetting!");
    if(action === 'getEmployees') return [];
  }

  // Google Apps Script CORS Fix:
  // We MUST send Content-Type: text/plain to avoid the browser sending an OPTIONS preflight request.
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });
    
    // Check if response is ok
    if (!response.ok) {
       throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data || result;
  } catch (error) {
    // Suppress alarming console errors. Use warn for debugging.
    console.warn(`[Offline Mode] API Call to '${action}' failed. Using offline fallback.`);
    throw error;
  }
};

// --- AUTH SERVICE ---
export const mockAuthService = {
  getLoginUsers: async () => {
    try {
        const result = await apiCall('getEmployees');
        if (!Array.isArray(result) || result.length === 0) {
            // Fallback if empty array returned from server
            return [
                { username: 'admin', name: 'Administrator', role: 'admin' },
                { username: 'demo', name: 'Guru Demo', role: 'employee' }
            ];
        }

        const employees = result.map((emp: EmployeeData) => ({
            username: emp.nip || emp.nik,
            name: emp.fullName,
            role: 'employee'
        }));

        const admin = { username: 'admin', name: 'Administrator', role: 'admin' };
        return [admin, ...employees];
    } catch (e) {
        // Fallback for offline mode (fetch error)
        return [
            { username: 'admin', name: 'Administrator (Offline)', role: 'admin' },
            { username: 'demo', name: 'Guru Demo (Offline)', role: 'employee' }
        ];
    }
  },

  login: async (username: string, password?: string): Promise<User> => {
    // Validasi Password Lokal
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
    
    // Coba ambil data dari server
    let employees = [];
    try {
        employees = await apiCall('getEmployees');
    } catch (e) {
        employees = OFFLINE_EMPLOYEES;
    }

    // Cek user di data
    if (Array.isArray(employees)) {
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
    }

    // Fallback demo user
    if (username === 'demo') {
         return {
            id: 'demo-1',
            username: 'demo',
            name: 'Guru Demo (Offline)',
            role: 'employee',
            avatarUrl: `https://ui-avatars.com/api/?name=Guru+Demo&background=random`
        };
    }
    
    throw new Error('User tidak ditemukan.');
  },
  
  logout: async () => {}
};

// --- DATA SERVICE ---
export const mockDataService = {
  getStats: async (): Promise<DashboardStats> => {
    let employees = [];
    try {
        employees = await apiCall('getEmployees');
    } catch (e) {
        employees = OFFLINE_EMPLOYEES;
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
    try {
        const res = await apiCall('getEmployees');
        return Array.isArray(res) ? res : [];
    } catch (e) {
        // Return dummy data in offline mode so the app doesn't look broken
        return OFFLINE_EMPLOYEES;
    }
  },

  getEmployeeById: async (id: string): Promise<EmployeeData | undefined> => {
    try {
        const employees = await apiCall('getEmployees');
        if (!Array.isArray(employees)) return undefined;
        return employees.find((e: EmployeeData) => e.id === id);
    } catch (e) {
        return OFFLINE_EMPLOYEES.find((e: EmployeeData) => e.id === id);
    }
  },

  updateEmployee: async (data: EmployeeData): Promise<void> => {
    if (!data.id) {
        data.id = data.nip || data.nik || `EMP-${Date.now()}`;
    }
    await apiCall('saveEmployee', data);
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