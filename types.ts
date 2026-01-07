export type Role = 'admin' | 'employee';

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export enum EmploymentStatus {
  PNS = 'PNS',
  PPPK = 'PPPK',
  HONORER = 'Honorer',
  GTT = 'GTT',
  PTT = 'PTT',
}

export enum Gender {
  L = 'Laki-laki',
  P = 'Perempuan'
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'Suami/Istri' | 'Anak' | 'Ayah' | 'Ibu';
  nik?: string;
  birthPlace?: string;
  birthDate?: string;
  education?: string;
  job?: string;
  isDependent?: boolean; // Tanggungan
  status?: string; // Kandung/Tiri/Angkat (for children), Hidup/Meninggal (for parents)
}

export interface EducationData {
  level: string; // SMA, D3, S1, S2
  major: string;
  institution: string;
  graduationYear: string;
  certificateNumber: string;
}

export interface AsnData {
  asnType: 'PNS' | 'PPPK';
  rank: string; // Golongan
  pangkat: string;
  tmtGolongan: string;
  workingPeriodYear: number;
  workingPeriodMonth: number;
  karpeg: string;
  taspen: string;
  bpjsHealth: string;
  bpjsLabor: string;
  npwp: string;
  bankAccount: string;
  bankName: string;
  isCertified: boolean;
  certNumber?: string;
  nrg?: string;
  certYear?: string;
}

export interface NonAsnData {
  contractNumber: string;
  contractStart: string;
  contractEnd: string;
  honorSource: string; // BOS, APBD, etc
  honorAmount: number;
  bankAccount: string;
  bankName: string;
}

export interface VerificationData {
  isVerified: 'Belum Diverifikasi' | 'Disetujui' | 'Perlu Perbaikan';
  adminNotes: string;
  lastUpdated: string;
}

export interface EmployeeData {
  id: string;
  // Tab 1: Personal
  fullName: string;
  frontTitle?: string;
  backTitle?: string;
  nik: string;
  nip?: string;
  nuptk?: string;
  birthPlace: string;
  birthDate: string;
  gender: Gender;
  religion: string;
  maritalStatus: string;
  address: string;
  village?: string; // Desa
  district?: string; // Kecamatan
  city?: string; // Kabupaten
  province?: string;
  postalCode?: string;
  phone: string;
  email: string;

  // Tab 2: Employment
  status: EmploymentStatus;
  employeeType: 'Guru' | 'Tenaga Kependidikan';
  position: string; // Jabatan
  mainTask: string; // Tugas Utama
  unit: string;
  subject?: string;
  tmtDuty: string; // TMT Mulai Bertugas
  teachingHours: number;
  skNumber: string;
  skOfficial: string; // Pejabat TTD SK

  // Tab 3 & 4: Specifics
  asnData?: AsnData;
  nonAsnData?: NonAsnData;

  // Tab 5: Education
  education: EducationData;

  // Tab 6: Family
  family: FamilyMember[];

  // Tab 8: Meta
  verification: VerificationData;
  completeness: number;
}

export interface DocumentItem {
  id: string;
  type: string;
  label: string;
  url?: string;
  status: 'missing' | 'uploaded' | 'verified';
  uploadedAt?: string;
  fileName?: string;
  size?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  totalPNS: number;
  totalPPPK: number;
  totalHonorer: number;
  documentsUploaded: number;
}
