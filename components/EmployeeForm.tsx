import React, { useState } from 'react';
import { 
  Save, User, Briefcase, GraduationCap, Users, FileText, CheckCircle, 
  ChevronRight, Plus, Trash2, CreditCard
} from 'lucide-react';
import { EmployeeData, EmploymentStatus, Gender, FamilyMember, Role, AsnData, NonAsnData, EducationData } from '../types';
import { DocumentUpload } from './DocumentUpload';

interface EmployeeFormProps {
  initialData?: EmployeeData;
  onSave: (data: EmployeeData) => void;
  readOnly?: boolean;
  userRole?: Role;
}

const TABS = [
  { id: 0, label: 'Data Pribadi', icon: User },
  { id: 1, label: 'Kepegawaian', icon: Briefcase },
  { id: 2, label: 'Data Khusus', icon: CreditCard }, // Dynamic: ASN or Non-ASN
  { id: 3, label: 'Pendidikan', icon: GraduationCap },
  { id: 4, label: 'Keluarga', icon: Users },
  { id: 5, label: 'Dokumen', icon: FileText },
  { id: 6, label: 'Verifikasi', icon: CheckCircle },
];

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, onSave, readOnly = false, userRole = 'employee' }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Empty default state
  const defaultData: EmployeeData = {
    id: '', fullName: '', nik: '', birthPlace: '', birthDate: '', 
    gender: Gender.L, religion: 'Islam', maritalStatus: 'Belum Kawin',
    address: '', phone: '', email: '',
    status: EmploymentStatus.HONORER, employeeType: 'Guru', position: '',
    mainTask: '', unit: 'SMPN 3 Pacet', tmtDuty: '', teachingHours: 0,
    skNumber: '', skOfficial: '',
    education: { level: 'S1', major: '', institution: '', graduationYear: '', certificateNumber: '' },
    family: [],
    verification: { isVerified: 'Belum Diverifikasi', adminNotes: '', lastUpdated: '' },
    completeness: 0
  };

  const [formData, setFormData] = useState<EmployeeData>(initialData || defaultData);

  const isAdmin = userRole === 'admin';
  
  // Helpers
  const isASN = formData.status === EmploymentStatus.PNS || formData.status === EmploymentStatus.PPPK;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section: keyof EmployeeData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value
      }
    }));
  };

  const handleFamilyChange = (index: number, field: keyof FamilyMember, value: any) => {
    const newFamily = [...formData.family];
    newFamily[index] = { ...newFamily[index], [field]: value };
    setFormData(prev => ({ ...prev, family: newFamily }));
  };

  const addFamilyMember = (type: 'Anak' | 'Suami/Istri' | 'Orang Tua') => {
    const newMember: FamilyMember = {
      id: `fam-${Date.now()}`,
      name: '',
      relation: type === 'Orang Tua' ? 'Ayah' : type as any,
      isDependent: false
    };
    setFormData(prev => ({ ...prev, family: [...prev.family, newMember] }));
  };

  const removeFamilyMember = (index: number) => {
    const newFamily = formData.family.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, family: newFamily }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Render Classes
  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500";
  const labelClass = "block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide";
  const sectionTitle = "text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2";

  // --- TAB CONTENTS ---

  const renderTab1_Personal = () => (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className={sectionTitle}>Identitas Diri</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className={labelClass}>Gelar Depan</label>
            <input type="text" name="frontTitle" value={formData.frontTitle} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
          <div className="md:col-span-1">
            <label className={labelClass}>Nama Lengkap (Tanpa Gelar) *</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={inputClass} disabled={readOnly} required />
          </div>
          <div className="md:col-span-1">
            <label className={labelClass}>Gelar Belakang</label>
            <input type="text" name="backTitle" value={formData.backTitle} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
          
          <div>
            <label className={labelClass}>NIK (16 Digit) *</label>
            <input type="text" name="nik" value={formData.nik} onChange={handleChange} className={inputClass} disabled={readOnly} required maxLength={16} />
          </div>
          {isASN && (
            <div>
              <label className={labelClass}>NIP</label>
              <input type="text" name="nip" value={formData.nip} onChange={handleChange} className={inputClass} disabled={readOnly} />
            </div>
          )}
          <div>
            <label className={labelClass}>NUPTK</label>
            <input type="text" name="nuptk" value={formData.nuptk} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>

          <div>
            <label className={labelClass}>Tempat Lahir *</label>
            <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className={inputClass} disabled={readOnly} required />
          </div>
          <div>
            <label className={labelClass}>Tanggal Lahir *</label>
            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={inputClass} disabled={readOnly} required />
          </div>
          <div>
            <label className={labelClass}>Jenis Kelamin</label>
            <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass} disabled={readOnly}>
              <option value={Gender.L}>Laki-laki</option>
              <option value={Gender.P}>Perempuan</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Agama</label>
            <select name="religion" value={formData.religion} onChange={handleChange} className={inputClass} disabled={readOnly}>
              {['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Status Perkawinan</label>
            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputClass} disabled={readOnly}>
              {['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className={sectionTitle}>Alamat & Kontak</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Alamat Lengkap (Jalan, RT/RW) *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} className={inputClass} rows={2} disabled={readOnly} required />
          </div>
          <div>
            <label className={labelClass}>Desa / Kelurahan</label>
            <input type="text" name="village" value={formData.village} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
          <div>
            <label className={labelClass}>Kecamatan</label>
            <input type="text" name="district" value={formData.district} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
          <div>
            <label className={labelClass}>Kabupaten / Kota</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
          <div>
            <label className={labelClass}>Provinsi</label>
            <input type="text" name="province" value={formData.province} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
          <div>
            <label className={labelClass}>Kode Pos</label>
            <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
          
          <div>
            <label className={labelClass}>Nomor HP (WA) *</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} disabled={readOnly} required />
          </div>
          <div>
            <label className={labelClass}>Email Aktif *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} disabled={readOnly} required />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTab2_Employment = () => (
    <div className="space-y-6 animate-fade-in">
      <h3 className={sectionTitle}>Data Kepegawaian</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Status Kepegawaian *</label>
          <select name="status" value={formData.status} onChange={handleChange} className={inputClass} disabled={readOnly}>
            {Object.values(EmploymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Jenis Pegawai</label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="employeeType" value="Guru" checked={formData.employeeType === 'Guru'} onChange={handleChange} disabled={readOnly} />
              <span className="text-sm text-slate-700">Guru</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="employeeType" value="Tenaga Kependidikan" checked={formData.employeeType === 'Tenaga Kependidikan'} onChange={handleChange} disabled={readOnly} />
              <span className="text-sm text-slate-700">Tenaga Kependidikan</span>
            </label>
          </div>
        </div>

        <div>
          <label className={labelClass}>Jabatan</label>
          <input type="text" name="position" value={formData.position} onChange={handleChange} className={inputClass} disabled={readOnly} placeholder="Contoh: Guru Madya" />
        </div>
        <div>
          <label className={labelClass}>Tugas Utama</label>
          <input type="text" name="mainTask" value={formData.mainTask} onChange={handleChange} className={inputClass} disabled={readOnly} />
        </div>
        <div>
          <label className={labelClass}>Unit Kerja</label>
          <input type="text" name="unit" value={formData.unit} onChange={handleChange} className={inputClass} disabled={readOnly} />
        </div>
        
        {formData.employeeType === 'Guru' && (
          <div>
            <label className={labelClass}>Mata Pelajaran (Khusus Guru)</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
        )}

        <div>
          <label className={labelClass}>TMT Mulai Bertugas</label>
          <input type="date" name="tmtDuty" value={formData.tmtDuty} onChange={handleChange} className={inputClass} disabled={readOnly} />
        </div>
        {formData.employeeType === 'Guru' && (
          <div>
            <label className={labelClass}>Jam Mengajar Per Minggu</label>
            <input type="number" name="teachingHours" value={formData.teachingHours} onChange={handleChange} className={inputClass} disabled={readOnly} />
          </div>
        )}

        <div>
          <label className={labelClass}>Nomor SK Pengangkatan</label>
          <input type="text" name="skNumber" value={formData.skNumber} onChange={handleChange} className={inputClass} disabled={readOnly} />
        </div>
        <div>
          <label className={labelClass}>Pejabat Penandatangan SK</label>
          <input type="text" name="skOfficial" value={formData.skOfficial} onChange={handleChange} className={inputClass} disabled={readOnly} />
        </div>
      </div>
    </div>
  );

  const renderTab3_Specifics = () => {
    if (isASN) {
      // ASN FORM
      const asn = (formData.asnData || { asnType: formData.status === EmploymentStatus.PNS ? 'PNS' : 'PPPK' }) as Partial<AsnData>;
      const setAsn = (field: string, val: any) => handleNestedChange('asnData', field, val);

      return (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className={sectionTitle}>Data ASN ({formData.status})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Golongan / Ruang</label>
                <select value={asn.rank || ''} onChange={e => setAsn('rank', e.target.value)} className={inputClass} disabled={readOnly}>
                  <option value="">- Pilih -</option>
                  {['I/a', 'I/b', 'I/c', 'I/d', 'II/a', 'II/b', 'II/c', 'II/d', 'III/a', 'III/b', 'III/c', 'III/d', 'IV/a', 'IV/b', 'IV/c', 'IV/d', 'IV/e'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Pangkat</label>
                <input type="text" value={asn.pangkat || ''} onChange={e => setAsn('pangkat', e.target.value)} className={inputClass} disabled={readOnly} />
              </div>
              <div>
                <label className={labelClass}>TMT Golongan</label>
                <input type="date" value={asn.tmtGolongan || ''} onChange={e => setAsn('tmtGolongan', e.target.value)} className={inputClass} disabled={readOnly} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                    <label className={labelClass}>Masa Kerja (Tahun)</label>
                    <input type="number" value={asn.workingPeriodYear || 0} onChange={e => setAsn('workingPeriodYear', e.target.value)} className={inputClass} disabled={readOnly} />
                </div>
                <div className="flex-1">
                    <label className={labelClass}>(Bulan)</label>
                    <input type="number" value={asn.workingPeriodMonth || 0} onChange={e => setAsn('workingPeriodMonth', e.target.value)} className={inputClass} disabled={readOnly} />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className={sectionTitle}>Administrasi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Karpeg</label><input type="text" value={asn.karpeg || ''} onChange={e => setAsn('karpeg', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              <div><label className={labelClass}>Taspen</label><input type="text" value={asn.taspen || ''} onChange={e => setAsn('taspen', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              <div><label className={labelClass}>BPJS Kesehatan</label><input type="text" value={asn.bpjsHealth || ''} onChange={e => setAsn('bpjsHealth', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              <div><label className={labelClass}>NPWP</label><input type="text" value={asn.npwp || ''} onChange={e => setAsn('npwp', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              <div><label className={labelClass}>No. Rekening Gaji</label><input type="text" value={asn.bankAccount || ''} onChange={e => setAsn('bankAccount', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              <div><label className={labelClass}>Nama Bank</label><input type="text" value={asn.bankName || ''} onChange={e => setAsn('bankName', e.target.value)} className={inputClass} disabled={readOnly} /></div>
            </div>
          </div>

          {formData.employeeType === 'Guru' && (
              <div>
                  <h3 className={sectionTitle}>Sertifikasi Guru</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className={labelClass}>Status Sertifikasi</label>
                           <select value={asn.isCertified ? 'Sudah' : 'Belum'} onChange={e => setAsn('isCertified', e.target.value === 'Sudah')} className={inputClass} disabled={readOnly}>
                              <option value="Belum">Belum Sertifikasi</option>
                              <option value="Sudah">Sudah Sertifikasi</option>
                           </select>
                      </div>
                      {asn.isCertified && (
                          <>
                            <div><label className={labelClass}>Nomor Sertifikat Pendidik</label><input type="text" value={asn.certNumber || ''} onChange={e => setAsn('certNumber', e.target.value)} className={inputClass} disabled={readOnly} /></div>
                            <div><label className={labelClass}>NRG</label><input type="text" value={asn.nrg || ''} onChange={e => setAsn('nrg', e.target.value)} className={inputClass} disabled={readOnly} /></div>
                            <div><label className={labelClass}>Tahun Sertifikasi</label><input type="number" value={asn.certYear || ''} onChange={e => setAsn('certYear', e.target.value)} className={inputClass} disabled={readOnly} /></div>
                          </>
                      )}
                  </div>
              </div>
          )}
        </div>
      );
    } else {
      // NON-ASN FORM
      const nonAsn = (formData.nonAsnData || {}) as Partial<NonAsnData>;
      const setNonAsn = (field: string, val: any) => handleNestedChange('nonAsnData', field, val);

      return (
        <div className="space-y-6 animate-fade-in">
           <h3 className={sectionTitle}>Data Non-ASN ({formData.status})</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Nomor Kontrak Kerja</label><input type="text" value={nonAsn.contractNumber || ''} onChange={e => setNonAsn('contractNumber', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              <div className="grid grid-cols-2 gap-2">
                 <div><label className={labelClass}>Mulai Kontrak</label><input type="date" value={nonAsn.contractStart || ''} onChange={e => setNonAsn('contractStart', e.target.value)} className={inputClass} disabled={readOnly} /></div>
                 <div><label className={labelClass}>Akhir Kontrak</label><input type="date" value={nonAsn.contractEnd || ''} onChange={e => setNonAsn('contractEnd', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              </div>
              <div>
                  <label className={labelClass}>Sumber Honor</label>
                  <select value={nonAsn.honorSource || ''} onChange={e => setNonAsn('honorSource', e.target.value)} className={inputClass} disabled={readOnly}>
                      <option value="">- Pilih -</option>
                      <option value="BOS">BOS</option>
                      <option value="APBD">APBD / Daerah</option>
                      <option value="Komite">Komite Sekolah</option>
                      <option value="Yayasan">Yayasan</option>
                  </select>
              </div>
              <div><label className={labelClass}>Besaran Honor (Rp)</label><input type="number" value={nonAsn.honorAmount || ''} onChange={e => setNonAsn('honorAmount', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              <div><label className={labelClass}>No. Rekening Honor</label><input type="text" value={nonAsn.bankAccount || ''} onChange={e => setNonAsn('bankAccount', e.target.value)} className={inputClass} disabled={readOnly} /></div>
              <div><label className={labelClass}>Nama Bank</label><input type="text" value={nonAsn.bankName || ''} onChange={e => setNonAsn('bankName', e.target.value)} className={inputClass} disabled={readOnly} /></div>
           </div>
        </div>
      );
    }
  };

  const renderTab4_Education = () => {
      const edu = (formData.education || {}) as Partial<EducationData>;
      const setEdu = (field: string, val: any) => handleNestedChange('education', field, val);
      return (
        <div className="space-y-6 animate-fade-in">
            <h3 className={sectionTitle}>Pendidikan Terakhir</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Jenjang Pendidikan *</label>
                    <select value={edu.level || ''} onChange={e => setEdu('level', e.target.value)} className={inputClass} disabled={readOnly} required>
                        <option value="">- Pilih -</option>
                        {['SMA/SMK', 'D1', 'D2', 'D3', 'D4', 'S1', 'S2', 'S3'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div><label className={labelClass}>Jurusan / Prodi</label><input type="text" value={edu.major || ''} onChange={e => setEdu('major', e.target.value)} className={inputClass} disabled={readOnly} /></div>
                <div className="md:col-span-2"><label className={labelClass}>Nama Sekolah / Perguruan Tinggi</label><input type="text" value={edu.institution || ''} onChange={e => setEdu('institution', e.target.value)} className={inputClass} disabled={readOnly} /></div>
                <div><label className={labelClass}>Tahun Lulus</label><input type="number" value={edu.graduationYear || ''} onChange={e => setEdu('graduationYear', e.target.value)} className={inputClass} disabled={readOnly} /></div>
                <div><label className={labelClass}>Nomor Ijazah</label><input type="text" value={edu.certificateNumber || ''} onChange={e => setEdu('certificateNumber', e.target.value)} className={inputClass} disabled={readOnly} /></div>
            </div>
        </div>
      )
  };

  const renderTab5_Family = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
             <h3 className="text-lg font-bold text-slate-800">Data Keluarga</h3>
             {!readOnly && (
                 <div className="flex gap-2">
                     <button type="button" onClick={() => addFamilyMember('Suami/Istri')} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100">+ Pasangan</button>
                     <button type="button" onClick={() => addFamilyMember('Anak')} className="text-xs bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-100">+ Anak</button>
                 </div>
             )}
        </div>
        
        {formData.family.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-lg">Belum ada data keluarga. Tambahkan jika ada.</div>
        ) : (
            <div className="space-y-4">
                {formData.family.map((member, idx) => (
                    <div key={member.id} className="p-4 border border-slate-200 rounded-xl relative hover:shadow-sm transition-shadow">
                        {!readOnly && (
                            <button type="button" onClick={() => removeFamilyMember(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        )}
                        <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase">{member.relation} {idx + 1}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                             <div>
                                <label className={labelClass}>Nama Lengkap</label>
                                <input type="text" value={member.name} onChange={e => handleFamilyChange(idx, 'name', e.target.value)} className={inputClass} disabled={readOnly} />
                             </div>
                             <div>
                                <label className={labelClass}>NIK</label>
                                <input type="text" value={member.nik || ''} onChange={e => handleFamilyChange(idx, 'nik', e.target.value)} className={inputClass} disabled={readOnly} />
                             </div>
                             <div>
                                <label className={labelClass}>Tempat Lahir</label>
                                <input type="text" value={member.birthPlace || ''} onChange={e => handleFamilyChange(idx, 'birthPlace', e.target.value)} className={inputClass} disabled={readOnly} />
                             </div>
                             <div>
                                <label className={labelClass}>Tanggal Lahir</label>
                                <input type="date" value={member.birthDate || ''} onChange={e => handleFamilyChange(idx, 'birthDate', e.target.value)} className={inputClass} disabled={readOnly} />
                             </div>
                             {member.relation === 'Anak' && (
                                 <div>
                                    <label className={labelClass}>Status Anak</label>
                                    <select value={member.status || ''} onChange={e => handleFamilyChange(idx, 'status', e.target.value)} className={inputClass} disabled={readOnly}>
                                        <option value="">- Pilih -</option>
                                        <option value="Kandung">Kandung</option>
                                        <option value="Tiri">Tiri</option>
                                        <option value="Angkat">Angkat</option>
                                    </select>
                                 </div>
                             )}
                             <div>
                                <label className={labelClass}>Pekerjaan / Sekolah</label>
                                <input type="text" value={member.job || ''} onChange={e => handleFamilyChange(idx, 'job', e.target.value)} className={inputClass} disabled={readOnly} />
                             </div>
                             <div className="flex items-center pt-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={member.isDependent || false} onChange={e => handleFamilyChange(idx, 'isDependent', e.target.checked)} disabled={readOnly} />
                                    <span className="text-sm text-slate-700">Masuk Tanggungan (Gaji)</span>
                                </label>
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const renderTab6_Documents = () => (
      <div className="animate-fade-in">
          <DocumentUpload employeeId={formData.id || 'new'} />
      </div>
  );

  const renderTab7_Verification = () => {
    const verif = formData.verification || { isVerified: 'Belum Diverifikasi', adminNotes: '', lastUpdated: '' };
    const setVerif = (field: string, val: any) => handleNestedChange('verification', field, val);

    return (
      <div className="space-y-6 animate-fade-in">
         <h3 className={sectionTitle}>Status Verifikasi Data</h3>
         
         <div className={`p-4 rounded-xl border ${
             verif.isVerified === 'Disetujui' ? 'bg-emerald-50 border-emerald-200' :
             verif.isVerified === 'Perlu Perbaikan' ? 'bg-amber-50 border-amber-200' :
             'bg-slate-50 border-slate-200'
         }`}>
             <div className="flex items-center gap-3 mb-2">
                 <div className={`p-2 rounded-full text-white ${
                      verif.isVerified === 'Disetujui' ? 'bg-emerald-500' :
                      verif.isVerified === 'Perlu Perbaikan' ? 'bg-amber-500' :
                      'bg-slate-400'
                 }`}>
                     {verif.isVerified === 'Disetujui' ? <CheckCircle size={20} /> : <FileText size={20} />}
                 </div>
                 <div>
                     <h4 className="font-bold text-slate-800">{verif.isVerified}</h4>
                     <p className="text-xs text-slate-500">Terakhir diupdate: {verif.lastUpdated || '-'}</p>
                 </div>
             </div>
             <p className="text-sm text-slate-700 mt-2">{verif.adminNotes || 'Belum ada catatan dari admin.'}</p>
         </div>

         {/* Admin Control Area */}
         {isAdmin && (
             <div className="bg-slate-800 text-white p-6 rounded-xl mt-6">
                 <h4 className="font-bold mb-4 flex items-center gap-2"><User size={18}/> Area Admin</h4>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Ubah Status</label>
                         <select value={verif.isVerified} onChange={e => setVerif('isVerified', e.target.value)} className="w-full bg-slate-700 border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none">
                             <option value="Belum Diverifikasi">Belum Diverifikasi</option>
                             <option value="Disetujui">Disetujui (Valid)</option>
                             <option value="Perlu Perbaikan">Perlu Perbaikan</option>
                         </select>
                     </div>
                     <div>
                         <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Catatan Verifikator</label>
                         <textarea value={verif.adminNotes} onChange={e => setVerif('adminNotes', e.target.value)} className="w-full bg-slate-700 border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:outline-none" rows={3} placeholder="Tulis catatan revisi untuk pegawai..." />
                     </div>
                 </div>
             </div>
         )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      {/* Header Tabs */}
      <div className="border-b border-slate-100 overflow-x-auto">
        <div className="flex items-center min-w-max">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative
                            ${isActive ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
                        `}
                    >
                        <Icon size={18} />
                        {tab.label}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                        )}
                    </button>
                )
            })}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
         <form onSubmit={handleSubmit} id="employee-form" className="max-w-4xl mx-auto">
            {activeTab === 0 && renderTab1_Personal()}
            {activeTab === 1 && renderTab2_Employment()}
            {activeTab === 2 && renderTab3_Specifics()}
            {activeTab === 3 && renderTab4_Education()}
            {activeTab === 4 && renderTab5_Family()}
            {activeTab === 5 && renderTab6_Documents()}
            {activeTab === 6 && renderTab7_Verification()}
         </form>
      </div>

      {/* Footer / Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
         <div className="text-xs text-slate-400 hidden md:block">
             Pastikan data yang diinput valid dan benar.
         </div>
         <div className="flex gap-3 ml-auto">
             {activeTab > 0 && (
                 <button type="button" onClick={() => setActiveTab(prev => prev - 1)} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors">
                     Kembali
                 </button>
             )}
             
             {activeTab < TABS.length - 1 ? (
                 <button type="button" onClick={() => setActiveTab(prev => prev + 1)} className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-lg shadow-slate-900/10">
                     Selanjutnya <ChevronRight size={16} />
                 </button>
             ) : (
                !readOnly && (
                    <button type="submit" form="employee-form" className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                        <Save size={16} /> Simpan Data
                    </button>
                )
             )}
         </div>
      </div>
    </div>
  );
};