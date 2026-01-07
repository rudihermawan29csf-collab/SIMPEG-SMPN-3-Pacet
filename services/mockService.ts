import { EmployeeData, User, DocumentItem, DashboardStats, EmploymentStatus } from '../types';

// --- KONFIGURASI API ---
// GANTI URL DI BAWAH INI DENGAN URL DEPLOYMENT WEB APP GOOGLE APPS SCRIPT ANDA
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBFhjY_70dhi90RP7vWf5vUQAirA-hGBjrkMYXaOJ-e4GUJAsN25119PCFGA4xDizolg/exec"; 

// --- API CLIENT HELPER ---
const apiCall = async (action: string, data: any = {}) => {
  if (APPS_SCRIPT_URL.includes("YOUR_SCRIPT_ID_HERE")) {
    console.warn("URL Google Apps Script belum disetting!");
    // Fallback sementara agar tidak crash saat pertama kali dijalankan user
    if(action === 'getEmployees') return [];
  }

  // Google Apps Script requires text/plain for CORS usually, but we send stringified JSON
  // Sending as POST for everything to avoid URL length limits
  try {
    const response = await fetch(`${APPS_SCRIPT_URL}?action=${action}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!result.success) throw new Error(result.message);
    return result.data || result;
  } catch (error) {
    console.error(`API Error (${action}):`, error);
    throw error;
  }
};

// --- AUTH SERVICE ---
export const mockAuthService = {
  getLoginUsers: async () => {
    // Untuk Login, kita ambil data real dari sheet
    // Namun untuk Admin passwordnya tetap hardcoded demi keamanan script client-side
    try {
        const result = await apiCall('getEmployees');
        // Jika sheet masih kosong, kembalikan user default
        if (!Array.isArray(result) || result.length === 0) {
            return [
                { username: 'admin', name: 'Administrator', role: 'admin' },
                { username: '198501012010011001', name: 'Contoh Guru (Isi Data Dulu)', role: 'employee' }
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
        // Fallback jika API gagal/belum diset
        return [{ username: 'admin', name: 'Administrator (Offline)', role: 'admin' }];
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
    
    // Ambil data detail dari Server
    const employees = await apiCall('getEmployees');
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
    throw new Error('User tidak ditemukan di Database');
  },
  
  logout: async () => {}
};

// --- DATA SERVICE ---
export const mockDataService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
        const employees = await apiCall('getEmployees');
        if (!Array.isArray(employees)) return { totalEmployees: 0, totalPNS: 0, totalPPPK: 0, totalHonorer: 0, documentsUploaded: 0 };
        
        return {
            totalEmployees: employees.length,
            totalPNS: employees.filter((e: any) => e.status === EmploymentStatus.PNS).length,
            totalPPPK: employees.filter((e: any) => e.status === EmploymentStatus.PPPK).length,
            totalHonorer: employees.filter((e: any) => ['Honorer', 'GTT', 'PTT'].includes(e.status)).length,
            documentsUploaded: 0 // Belum bisa hitung real documents tanpa query drive kompleks
        };
    } catch (e) {
        return { totalEmployees: 0, totalPNS: 0, totalPPPK: 0, totalHonorer: 0, documentsUploaded: 0 };
    }
  },

  getAllEmployees: async (): Promise<EmployeeData[]> => {
    const res = await apiCall('getEmployees');
    return Array.isArray(res) ? res : [];
  },

  getEmployeeById: async (id: string): Promise<EmployeeData | undefined> => {
    const employees = await apiCall('getEmployees');
    return employees.find((e: EmployeeData) => e.id === id);
  },

  updateEmployee: async (data: EmployeeData): Promise<void> => {
    // Generate ID jika baru
    if (!data.id) {
        data.id = data.nip || data.nik || `EMP-${Date.now()}`;
    }
    await apiCall('saveEmployee', data);
  },

  getDocuments: async (employeeId: string): Promise<DocumentItem[]> => {
    // Karena Google Drive API kompleks untuk dilisting via Simple GAS tanpa Auth OAuth2 yang rumit,
    // Kita akan mensimulasikan list dokumen berdasarkan apa yang 'seharusnya' ada.
    // Di aplikasi real production, list file URL harus disimpan di properti 'EmployeeData' (misal: data.documents)
    // Untuk tahap ini, kita return kosong dulu atau mock statis agar tidak error.
    
    // *Catatan Pengembangan*: Idealnya, simpan link file di dalam object EmployeeData saat upload berhasil.
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
