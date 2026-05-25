import React, { useState, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2, PenLine, X, Check } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import SignatureCanvas from 'react-signature-canvas';

// ── Types ─────────────────────────────────────────────────
type DocStatus = 'Draft' | 'In Review' | 'Signed';

interface Document {
  id: number;
  name: string;
  type: string;
  size: string;
  lastModified: string;
  shared: boolean;
  status: DocStatus;
}

// ── Status badge variant ──────────────────────────────────
const statusVariant: Record<DocStatus, 'secondary' | 'warning' | 'success'> = {
  Draft:       'secondary',
  'In Review': 'warning',
  Signed:      'success',
};

// ── Initial documents ─────────────────────────────────────
const initialDocuments: Document[] = [
  { id: 1, name: 'Pitch Deck 2024.pdf',       type: 'PDF',         size: '2.4 MB', lastModified: '2024-02-15', shared: true,  status: 'Signed'    },
  { id: 2, name: 'Financial Projections.xlsx', type: 'Spreadsheet', size: '1.8 MB', lastModified: '2024-02-10', shared: false, status: 'In Review' },
  { id: 3, name: 'Business Plan.docx',         type: 'Document',    size: '3.2 MB', lastModified: '2024-02-05', shared: true,  status: 'Draft'     },
  { id: 4, name: 'Market Research.pdf',        type: 'PDF',         size: '5.1 MB', lastModified: '2024-01-28', shared: false, status: 'Draft'     },
];

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [signingDoc, setSigningDoc] = useState<Document | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const sigRef = useRef<SignatureCanvas>(null);

  // ── Upload ────────────────────────────────────────────────
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const newDoc: Document = {
      id: Date.now(),
      name: file.name,
      type: file.name.endsWith('.pdf') ? 'PDF' : file.name.endsWith('.xlsx') ? 'Spreadsheet' : 'Document',
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      lastModified: new Date().toISOString().split('T')[0],
      shared: false,
      status: 'Draft',
    };
    setDocuments(prev => [newDoc, ...prev]);
    showSuccess(`"${file.name}" uploaded successfully!`);
  };

  // ── Status change ─────────────────────────────────────────
  const changeStatus = (id: number, status: DocStatus) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  // ── Delete ────────────────────────────────────────────────
  const deleteDoc = (id: number) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // ── Signature confirm ─────────────────────────────────────
  const confirmSignature = () => {
    if (!signingDoc) return;
    if (sigRef.current?.isEmpty()) {
      alert('Please draw your signature first.');
      return;
    }
    changeStatus(signingDoc.id, 'Signed');
    setSigningDoc(null);
    showSuccess(`"${signingDoc.name}" signed successfully!`);
  };

  // ── Toast ─────────────────────────────────────────────────
  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Upload, review, and e-sign your important files</p>
        </div>

        {/* ── Upload button — plain label, no Button component ── */}
        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors">
          <Upload size={18} />
          Upload Document
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xlsx"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
      </div>

      {/* ── Success toast ── */}
      {successMsg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          <Check size={18} />
          <span className="text-sm font-medium">{successMsg}</span>
        </div>
      )}

      {/* ── Status summary chips ── */}
      <div className="flex gap-3 flex-wrap">
        {(['Draft', 'In Review', 'Signed'] as DocStatus[]).map(s => (
          <div key={s} className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 text-sm shadow-sm">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
              s === 'Draft' ? 'bg-gray-400' : s === 'In Review' ? 'bg-yellow-400' : 'bg-green-500'
            }`} />
            <span className="text-gray-700 font-medium">{s}</span>
            <span className="text-gray-400">({documents.filter(d => d.status === s).length})</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Sidebar ── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">12.5 GB</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary-600 rounded-full" style={{ width: '65%' }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available</span>
                <span className="font-medium text-gray-900">7.5 GB</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Access</h3>
              <div className="space-y-1">
                {['Recent Files', 'Shared with Me', 'Starred', 'Trash'].map(label => (
                  <button key={label} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status legend */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Status Guide</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400 flex-shrink-0" />Draft – not submitted</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />In Review – pending</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />Signed – fully executed</div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Document list ── */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">All Documents</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Sort by</Button>
                <Button variant="outline" size="sm">Filter</Button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-gray-200"
                  >
                    {/* Icon */}
                    <div className="p-2 bg-primary-50 rounded-lg mr-4 flex-shrink-0">
                      <FileText size={24} className="text-primary-600" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
                        {doc.shared && <Badge variant="secondary" size="sm">Shared</Badge>}
                        <Badge variant={statusVariant[doc.status]} size="sm">{doc.status}</Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                        <span>{doc.type}</span>
                        <span>{doc.size}</span>
                        <span>Modified {doc.lastModified}</span>
                      </div>

                      {/* Status action buttons */}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {doc.status === 'Draft' && (
                          <button
                            onClick={() => changeStatus(doc.id, 'In Review')}
                            className="text-xs px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md hover:bg-yellow-100 transition-colors"
                          >
                            Submit for Review
                          </button>
                        )}
                        {doc.status === 'In Review' && (
                          <button
                            onClick={() => setSigningDoc(doc)}
                            className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-colors flex items-center gap-1"
                          >
                            <PenLine size={12} /> E-Sign
                          </button>
                        )}
                        {doc.status === 'Signed' && (
                          <span className="text-xs px-2 py-1 bg-green-50 text-green-600 border border-green-200 rounded-md flex items-center gap-1">
                            <Check size={12} /> Fully Signed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action icons */}
                    <div className="flex items-center gap-1 ml-4 flex-shrink-0">
                      <Button variant="ghost" size="sm" className="p-2" aria-label="Download">
                        <Download size={18} />
                      </Button>
                      <Button variant="ghost" size="sm" className="p-2" aria-label="Share">
                        <Share2 size={18} />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        className="p-2 text-red-500 hover:text-red-700"
                        aria-label="Delete"
                        onClick={() => deleteDoc(doc.id)}
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <FileText size={40} className="mx-auto mb-3 opacity-40" />
                    <p>No documents yet. Upload one to get started.</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════
          E-SIGNATURE MODAL
      ══════════════════════════════════════ */}
      {signingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">

            {/* Modal header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <PenLine size={20} className="text-primary-600" /> E-Sign Document
                </h2>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{signingDoc.name}</p>
              </div>
              <button
                onClick={() => setSigningDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Draw your signature in the box below.
            </p>

            {/* Signature canvas */}
            <div className="border-2 border-primary-300 rounded-xl overflow-hidden bg-white mb-4">
              <SignatureCanvas
                ref={sigRef}
                penColor="#1d4ed8"
                canvasProps={{ width: 460, height: 180, className: 'w-full' }}
              />
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => sigRef.current?.clear()} className="flex-1">
                Clear
              </Button>
              <Button onClick={confirmSignature} className="flex-1" leftIcon={<Check size={16} />}>
                Confirm Signature
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};