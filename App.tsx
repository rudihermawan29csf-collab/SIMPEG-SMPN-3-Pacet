import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EmployeeForm } from './components/EmployeeForm';
import { DocumentUpload } from './components/DocumentUpload';
import { User, Role, EmployeeData } from './types';
import { mockAuthService, mockDataService } from './services/mockService';
import { Menu, LogOut, ArrowRight, ChevronDown, Lock, User as UserIcon, WifiOff, AlertTriangle, UserPlus, Mail } from 'lucide-react';
import { isFirebaseConfigured } from './firebaseConfig';

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  // State for View (Login vs Register)
  const [isRegistering, setIsRegistering] = useState(false);

  // Login States
  const [users, setUsers] = useState<{username: string, name: string, role: string}[]>([]);
  const [selectedUsername, setSelectedUsername] = useState(''); // Can be email in input
  const [password, setPassword] = useState('');
  
  // Register States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    // Load users (for dropdown convenience in login, optional in real auth flow)
    mockAuthService.getLoginUsers().then(list => {
        setUsers(list);
        if(list.length > 0 && !selectedUsername) setSelectedUsername(list[0].username);
        setIsDataLoaded(true);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
        alert("Silakan masukkan password");
        return;
    }
    setIsLoading(true);
    try {
      const user = await mockAuthService.login(selectedUsername, password);
      onLogin(user);
    } catch (err: any) {
      alert(err.message || 'Login Gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPass) {
        alert("Mohon lengkapi semua data pendaftaran.");
        return;
    }
    if (regPass !== regPassConfirm) {
        alert("Konfirmasi password tidak cocok.");
        return;
    }
    if (regPass.length < 6) {
        alert("Password minimal 6 karakter.");
        return;
    }

    setIsLoading(true);
    try {
        const user = await mockAuthService.register(regName, regEmail, regPass);
        alert("Pendaftaran Berhasil! Anda akan otomatis login.");
        onLogin(user);
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isDataLoaded) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100">
              <div className="text-center">
                  <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500">Menghubungkan ke sistem...</p>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative">
      {!isFirebaseConfigured && (
          <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-center py-2 text-sm font-medium px-4">
              ⚠️ Mode Demo: Firebase belum dikonfigurasi. Fitur Register dinonaktifkan.
          </div>
      )}
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 mt-8">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 text-white text-2xl font-bold">
                3
            </div>
            <h1 className="text-2xl font-bold text-slate-800">SMPN 3 Pacet</h1>
            <p className="text-slate-500">Sistem Informasi Kepegawaian</p>
        </div>
        
        {isRegistering ? (
            // --- FORM REGISTER ---
            <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Daftar Akun Baru</h2>
                    <p className="text-xs text-slate-500">Khusus Guru & Staf SMPN 3 Pacet</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nama sesuai SK"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Aktif</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="email@contoh.com"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            value={regPass}
                            onChange={(e) => setRegPass(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Minimal 6 karakter"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Konfirmasi Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            value={regPassConfirm}
                            onChange={(e) => setRegPassConfirm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Ulangi password"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? 'Mendaftarkan...' : (
                        <>
                            <UserPlus size={18} />
                            Daftar Sekarang
                        </>
                    )}
                </button>

                <div className="text-center mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                        Sudah punya akun? {' '}
                        <button 
                            type="button" 
                            onClick={() => setIsRegistering(false)}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Login disini
                        </button>
                    </p>
                </div>
            </form>
        ) : (
            // --- FORM LOGIN ---
            <form onSubmit={handleLogin} className="space-y-4 animate-fade-in">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email / Username</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    {/* If strictly using email for auth, Input Text is better than Select for flexibility */}
                    <input
                        type="text"
                        value={selectedUsername}
                        onChange={(e) => setSelectedUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Masukkan Email Anda"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Masukkan password"
                    />
                </div>
                <p className="text-xs text-slate-400 mt-1 text-right">Admin Default: admin@smpn3.id / admin123</p>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
                {isLoading ? 'Memproses...' : (
                    <>
                        Masuk Aplikasi
                        <ArrowRight size={18} />
                    </>
                )}
            </button>

            {isFirebaseConfigured && (
                <div className="text-center mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                        Belum punya akun? {' '}
                        <button 
                            type="button" 
                            onClick={() => setIsRegistering(true)}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Daftar disini
                        </button>
                    </p>
                </div>
            )}
            </form>
        )}
      </div>
    </div>
  );
};

// Component for listing all employees (Admin view)
const EmployeeList = ({ onSelectEmployee }: { onSelectEmployee: (id: string) => void }) => {
    const [employees, setEmployees] = useState<EmployeeData[]>([]);

    useEffect(() => {
        mockDataService.getAllEmployees().then(setEmployees);
    }, []);

    return (
        <div className="space-y-6 animate-fade-in">
             <div>
                <h2 className="text-2xl font-bold text-slate-800">Data Pegawai</h2>
                <p className="text-slate-500">Kelola seluruh data guru dan staf</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-800 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="p-4">Nama Pegawai</th>
                                <th className="p-4">NIP / NIK</th>
                                <th className="p-4">Jabatan</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Dokumen</th>
                                <th className="p-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-medium text-slate-800">{emp.fullName}</td>
                                    <td className="p-4">{emp.nip || emp.nik}</td>
                                    <td className="p-4">{emp.position}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium 
                                            ${emp.status === 'PNS' ? 'bg-blue-100 text-blue-700' : 
                                              emp.status === 'PPPK' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-[80px] mx-auto overflow-hidden">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full" 
                                                style={{ width: `${emp.completeness}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-400 mt-1 block">{emp.completeness}%</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button 
                                            onClick={() => onSelectEmployee(emp.id)}
                                            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                        >
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  
  // State for Employee Profile View
  const [profileData, setProfileData] = useState<EmployeeData | undefined>(undefined);

  // Load employee data when switching to profile views
  useEffect(() => {
    if (user?.role === 'employee' && (currentView === 'my-profile' || currentView === 'documents')) {
        mockDataService.getAllEmployees().then(emps => {
            const myProfile = emps.find(e => e.id === user.id);
            setProfileData(myProfile || emps[0]); 
        });
    } else if (currentView === 'employee-detail' && selectedEmployeeId) {
        mockDataService.getEmployeeById(selectedEmployeeId).then(setProfileData);
    }
  }, [user, currentView, selectedEmployeeId]);

  const handleLogout = () => {
    mockAuthService.logout();
    setUser(null);
    setCurrentView('dashboard');
  };

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'employees':
        return <EmployeeList onSelectEmployee={(id) => {
            setSelectedEmployeeId(id);
            setCurrentView('employee-detail');
        }} />;
      case 'my-profile':
      case 'employee-detail':
        if (!profileData) return <div>Loading...</div>;
        return (
            <div className="space-y-6 animate-fade-in">
                 <div className="flex items-center gap-4 mb-4">
                    {currentView === 'employee-detail' && (
                        <button 
                            onClick={() => setCurrentView('employees')}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <ArrowRight className="rotate-180" size={20} />
                        </button>
                    )}
                    <h2 className="text-2xl font-bold text-slate-800">
                        {currentView === 'my-profile' ? 'Data Pribadi Saya' : 'Detail Pegawai'}
                    </h2>
                 </div>
                 
                 <EmployeeForm 
                    initialData={profileData}
                    userRole={user.role}
                    readOnly={false}
                    onSave={async (data) => {
                        await mockDataService.updateEmployee(data);
                        alert("Data berhasil disimpan!");
                        setProfileData(data);
                    }}
                 />
            </div>
        );
      case 'documents':
         // View khusus dokumen jika diakses dari sidebar (employee only)
         if (!user) return null;
         return (
             <div className="space-y-6 animate-fade-in">
                 <h2 className="text-2xl font-bold text-slate-800">Dokumen Saya</h2>
                 <DocumentUpload employeeId={user.id} />
             </div>
         )
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans text-slate-900">
      <Sidebar 
        role={user.role} 
        activeView={currentView} 
        onChangeView={setCurrentView}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 h-screen overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">3</div>
                <span className="font-bold text-slate-800">SMPN 3 Pacet</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600">
                <Menu size={24} />
            </button>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;