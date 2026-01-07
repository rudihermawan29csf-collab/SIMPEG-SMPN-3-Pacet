import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { EmployeeForm } from './components/EmployeeForm';
import { DocumentUpload } from './components/DocumentUpload';
import { User, Role, EmployeeData } from './types';
import { mockAuthService, mockDataService } from './services/mockService';
import { Menu, LogOut, ArrowRight, ChevronDown, Lock, User as UserIcon } from 'lucide-react';

const LoginPage = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [users, setUsers] = useState<{username: string, name: string, role: string}[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    mockAuthService.getLoginUsers().then(list => {
        setUsers(list);
        if(list.length > 0) setSelectedUsername(list[0].username);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 text-white text-2xl font-bold">
                3
            </div>
            <h1 className="text-2xl font-bold text-slate-800">SMPN 3 Pacet</h1>
            <p className="text-slate-500">Sistem Informasi Kepegawaian</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Pengguna</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <select
                    value={selectedUsername}
                    onChange={(e) => setSelectedUsername(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white text-slate-700"
                >
                    {users.map(u => (
                        <option key={u.username} value={u.username}>
                            {u.name} ({u.role === 'admin' ? 'Admin' : 'Guru/Staf'})
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
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
            <p className="text-xs text-slate-400 mt-1 text-right">Default: guru123 (Admin: admin123)</p>
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
        </form>
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
            // In a real app, we would fetch by User ID mapped to Employee ID
            // For demo: if logged in user is found in list, use that.
            // Current mock login returns a user with ID equal to the employee ID (if employee)
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
                 <div className="flex items-center gap-4">
                    {currentView === 'employee-detail' && (
                        <button 
                            onClick={() => setCurrentView('employees')}
                            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                        >
                            <ArrowRight className="rotate-180" size={20}/>
                        </button>
                    )}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {currentView === 'my-profile' ? 'Data Pribadi Saya' : 'Detail Pegawai'}
                        </h2>
                        <p className="text-slate-500">Kelola informasi dan dokumen kepegawaian</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="xl:col-span-2">
                        <EmployeeForm 
                            initialData={profileData} 
                            onSave={(data) => {
                                console.log("Saving", data);
                                alert("Data berhasil disimpan (Simulasi)");
                            }}
                            // If admin view detail: Editable (Admin controls verif). 
                            // If employee view detail: Editable (Employee fills data).
                            // Logic: The form handles its own internal disabled states for Admin Verification fields.
                            readOnly={false} 
                            userRole={user.role}
                        />
                    </div>
                </div>
            </div>
        );
      case 'documents':
        if (!profileData) return <div>Loading...</div>;
        return (
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dokumen Saya</h2>
                    <p className="text-slate-500">Unggah dan kelola arsip digital</p>
                </div>
                <DocumentUpload employeeId={profileData.id} />
            </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        role={user.role} 
        activeView={currentView === 'employee-detail' ? 'employees' : currentView}
        onChangeView={setCurrentView}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 p-4 md:hidden flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">3</div>
                <span className="font-bold text-slate-800">SIMPEG</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600">
                <Menu />
            </button>
        </header>

        {/* Top Bar Desktop */}
        <header className="hidden md:flex bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 justify-between items-center sticky top-0 z-10">
            <div className="text-sm breadcrumbs text-slate-500">
                <span>SIMPEG</span>
                <span className="mx-2">/</span>
                <span className="capitalize text-slate-800 font-medium">
                    {currentView.replace('-', ' ')}
                </span>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden lg:block">
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <img 
                    src={user.avatarUrl} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover" 
                />
            </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
        </main>
      </div>
    </div>
  );
}

export default App;
