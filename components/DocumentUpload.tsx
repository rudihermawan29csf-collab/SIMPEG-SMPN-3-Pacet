import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Eye, HardDrive } from 'lucide-react';
import { DocumentItem } from '../types';
import { mockDataService } from '../services/mockService';

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
    setDocuments(docs);
    setLoading(false);
  };

  const handleFileChange = async (docId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File terlalu besar! Maksimal 2 MB sesuai aturan Google Drive Sekolah.");
      return;
    }

    setUploadingId(docId);
    try {
      // Pass employeeId to simulate folder generation in Google Drive
      const updatedDoc = await mockDataService.uploadDocument(employeeId, docId, file);
      setDocuments(prev => prev.map(d => d.id === docId ? updatedDoc : d));
    } catch (error) {
      alert("Gagal mengunggah dokumen ke Google Drive.");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Memuat daftar dokumen...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-blue-500" />
                Kelengkapan Dokumen
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                Format: PDF / JPG / PNG (Max 2MB)
                </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-100">
                <HardDrive size={14} />
                <span>Google Drive Storage</span>
            </div>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {documents.map((doc) => (
          <div key={doc.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
            
            <div className="flex items-start gap-4 flex-1">
              <div className={`
                p-3 rounded-xl flex-shrink-0
                ${doc.status === 'uploaded' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}
              `}>
                {doc.status === 'uploaded' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
              
              <div>
                <h4 className="font-medium text-slate-800">{doc.label}</h4>
                {doc.status === 'uploaded' ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {doc.fileName}
                    </span>
                    <span className="text-xs text-slate-400">
                      • {doc.size} • via Google Drive
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-amber-600 mt-1 font-medium">Dokumen belum diunggah</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {doc.status === 'uploaded' ? (
                <>
                  <button 
                    onClick={() => window.open(doc.url, '_blank')}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                    title="Lihat di Google Drive"
                  >
                    <Eye size={20} />
                    <span className="text-xs font-medium hidden sm:inline">Lihat</span>
                  </button>
                  {/* Re-upload button */}
                  <div className="relative">
                    <input
                      type="file"
                      id={`file-${doc.id}`}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(doc.id, e)}
                    />
                    <label 
                      htmlFor={`file-${doc.id}`}
                      className="cursor-pointer p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                    >
                      <Upload size={20} />
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
                      flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-full sm:w-auto cursor-pointer transition-all
                      ${uploadingId === doc.id 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border border-blue-200'}
                    `}
                  >
                     {uploadingId === doc.id ? 'Mengunggah...' : (
                       <>
                         <Upload size={16} />
                         <span>Upload ke Drive</span>
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
