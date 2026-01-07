import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Eye, HardDrive, ExternalLink } from 'lucide-react';
import { DocumentItem } from '../types';
import { mockDataService } from '../services/mockService';
import { isDriveConfigured } from '../firebaseConfig';

interface DocumentUploadProps {
  employeeId: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ employeeId }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    loadDocs();
  }, [employeeId]);

  const loadDocs = async () => {
    setLoading(true);
    const docs = await mockDataService.getDocuments(employeeId);
    
    // Merge dengan template dokumen yang wajib ada (agar UI tetap konsisten walau belum ada file)
    const requiredDocs = [
        { id: 'ktp', label: 'KTP' },
        { id: 'kk', label: 'Kartu Keluarga' },
        { id: 'ijazah_terakhir', label: 'Ijazah Terakhir' },
        { id: 'sk_pengangkatan', label: 'SK Pengangkatan' },
        { id: 'foto', label: 'Pas Foto' }
    ];

    const mergedDocs: DocumentItem[] = requiredDocs.map(req => {
        const existing = docs.find(d => d.id === req.id);
        return existing || {
            id: req.id,
            type: 'Required',
            label: req.label,
            status: 'missing',
            fileName: '-',
            size: '-'
        };
    });

    // Tambahkan dokumen tambahan yang mungkin sudah diupload tapi tidak ada di list wajib
    docs.forEach(d => {
        if (!requiredDocs.find(req => req.id === d.id)) {
            mergedDocs.push(d);
        }
    });

    setDocuments(mergedDocs);
    setLoading(false);
  };

  const handleFileChange = async (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File terlalu besar! Maksimal 5 MB agar proses upload Google Script lancar.");
      return;
    }

    if (!isDriveConfigured) {
        alert("⚠️ URL Google Apps Script belum disetting di firebaseConfig.ts.\nSilakan deploy script dulu.");
    }

    setUploadingId(docId);
    try {
      const updatedDoc = await mockDataService.uploadDocument(employeeId, docId, file);
      
      // Update state lokal
      setDocuments(prev => prev.map(d => d.id === docId ? updatedDoc : d));
      alert(`Berhasil mengunggah ${file.name} ke Google Drive!`);
      
    } catch (error: any) {
      console.error("Upload error detail:", error);
      alert("Gagal upload. Pastikan URL Script benar dan koneksi lancar.");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat daftar dokumen dari database...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" />
                Arsip Digital Pegawai
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                File akan tersimpan otomatis di Google Drive Sekolah.
                </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-100">
                <HardDrive size={14} />
                <span>Integrated w/ Google Drive</span>
            </div>
        </div>
        {!isDriveConfigured && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center gap-2">
                <AlertCircle size={16} />
                <strong>Setup Required:</strong> Masukkan URL Google Apps Script di firebaseConfig.ts agar fitur upload berfungsi.
            </div>
        )}
      </div>

      <div className="divide-y divide-slate-100">
        {documents.map((doc) => (
          <div key={doc.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
            
            <div className="flex items-start gap-4 flex-1">
              <div className={`
                p-3 rounded-xl flex-shrink-0 transition-colors
                ${doc.status === 'uploaded' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}
              `}>
                {doc.status === 'uploaded' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
              
              <div className="flex-1">
                <h4 className="font-medium text-slate-800">{doc.label}</h4>
                {doc.status === 'uploaded' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded truncate max-w-[200px]" title={doc.fileName}>
                      {doc.fileName}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {doc.size} • {doc.uploadedAt}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 mt-1 font-medium">Belum ada file</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {doc.status === 'uploaded' ? (
                <>
                  <button 
                    onClick={() => window.open(doc.url, '_blank')}
                    className="flex-1 sm:flex-none p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-200 sm:border-transparent"
                    title="Buka File"
                  >
                    <ExternalLink size={18} />
                    <span className="text-sm font-medium sm:hidden">Buka</span>
                  </button>
                  {/* Re-upload button */}
                  <div className="relative flex-1 sm:flex-none">
                    <input
                      type="file"
                      id={`file-${doc.id}`}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(doc.id, e)}
                    />
                    <label 
                      htmlFor={`file-${doc.id}`}
                      className="cursor-pointer p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center border border-slate-200 sm:border-transparent"
                      title="Ganti File"
                    >
                      <Upload size={18} />
                      <span className="text-sm font-medium sm:hidden ml-2">Ganti</span>
                    </label>
                  </div>
                </>
              ) : (
                <div className="relative w-full sm:w-auto">
                  <input
                    type="file"
                    id={`file-${doc.id}`}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(doc.id, e)}
                    disabled={uploadingId === doc.id}
                  />
                  <label
                    htmlFor={`file-${doc.id}`}
                    className={`
                      flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto cursor-pointer transition-all shadow-sm
                      ${uploadingId === doc.id 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'}
                    `}
                  >
                     {uploadingId === doc.id ? 'Mengunggah...' : (
                       <>
                         <Upload size={16} />
                         <span>Upload File</span>
                       </>
                     )}
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
