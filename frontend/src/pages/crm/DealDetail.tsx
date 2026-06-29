import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { Deal, ApiResponse } from '@/types';
import {
  ArrowLeft,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { usePermission } from '@/hooks';

export default function DealDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = usePermission();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Document upload state
  const [docType, setDocType] = useState('Agreement');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Verification modal state
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyingDocId, setVerifyingDocId] = useState<number | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'verified' | 'rejected'>('verified');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [isVerifyLoading, setIsVerifyLoading] = useState(false);

  // Approval state
  const [isApprovalLoading, setIsApprovalLoading] = useState(false);

  const fetchDealDetails = async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<Deal>>(`/deals/${id}`);
      setDeal(response.data.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load deal details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDealDetails();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !deal) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('file', selectedFile);

    try {
      await api.post(`/deals/${deal.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSelectedFile(null);
      fetchDealDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenVerifyModal = (docId: number) => {
    setVerifyingDocId(docId);
    setVerifyStatus('verified');
    setVerifyNotes('');
    setIsVerifyModalOpen(true);
  };

  const handleVerifyDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal || !verifyingDocId) return;

    setIsVerifyLoading(true);
    try {
      await api.post(`/deals/${deal.id}/documents/${verifyingDocId}/verify`, {
        status: verifyStatus,
        notes: verifyNotes,
      });
      setIsVerifyModalOpen(false);
      fetchDealDetails();
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyLoading(false);
    }
  };

  const handleDealApproval = async (action: 'approve' | 'reject') => {
    if (!deal) return;
    const confirmMsg =
      action === 'approve'
        ? 'Are you sure you want to APPROVE this deal? It will be marked as WON.'
        : 'Are you sure you want to REJECT this deal? It will be marked as LOST.';
    if (!confirm(confirmMsg)) return;

    setIsApprovalLoading(true);
    try {
      await api.post(`/deals/${deal.id}/approve`, {
        action,
        notes: `Processed by ${action === 'approve' ? 'Approval' : 'Rejection'} workflow.`,
      });
      fetchDealDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process deal approval.');
    } finally {
      setIsApprovalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="p-6 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="mx-auto text-danger-500" size={48} />
        <h2 className="text-xl font-bold text-neutral-900">Error</h2>
        <p className="text-neutral-500">{error || 'Deal not found.'}</p>
        <button
          onClick={() => navigate('/crm/deals')}
          className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-lg shadow"
        >
          Back to Deals
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/crm/deals')}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to deals
      </button>

      {/* Header Panel */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">{deal.title}</h1>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border ${
                deal.status === 'won'
                  ? 'bg-success-50 text-success-700 border-success-100'
                  : deal.status === 'lost'
                  ? 'bg-danger-50 text-danger-700 border-danger-100'
                  : deal.status === 'approval'
                  ? 'bg-purple-50 text-purple-700 border-purple-100'
                  : 'bg-warning-50 text-warning-700 border-warning-100'
              }`}
            >
              {deal.status}
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1">Lead: {deal.lead?.contact_name}</p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-xs text-neutral-400 font-medium">DEAL VALUE</p>
          <p className="text-2xl font-black text-primary-600 mt-0.5">
            ₹{(deal.value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns — Deal & Lead Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-neutral-850 border-b border-neutral-100 pb-3">
              Deal Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-neutral-400 text-xs font-medium">Assigned BDM</p>
                <p className="text-neutral-900 font-semibold mt-1">
                  {deal.assigned_bdm?.name || 'Unassigned'}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium">Territory</p>
                <p className="text-neutral-900 font-semibold mt-1">
                  {deal.territory?.name || 'None'}
                </p>
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium">Document Verification</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border mt-1 ${
                    deal.verification_status === 'verified'
                      ? 'bg-success-50 text-success-700 border-success-100'
                      : deal.verification_status === 'rejected'
                      ? 'bg-danger-50 text-danger-700 border-danger-100'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  {deal.verification_status}
                </span>
              </div>
              <div>
                <p className="text-neutral-400 text-xs font-medium">Approval Status</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border mt-1 ${
                    deal.approval_status === 'approved'
                      ? 'bg-success-50 text-success-700 border-success-100'
                      : deal.approval_status === 'rejected'
                      ? 'bg-danger-50 text-danger-700 border-danger-100'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200'
                  }`}
                >
                  {deal.approval_status}
                </span>
              </div>
            </div>

            {deal.description && (
              <div className="border-t border-neutral-100 pt-4">
                <p className="text-neutral-400 text-xs font-medium">Description</p>
                <p className="text-neutral-700 text-sm mt-1.5 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                  {deal.description}
                </p>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-neutral-850 border-b border-neutral-100 pb-3">
              Deal Documents
            </h3>

            <div className="space-y-4">
              {deal.documents && deal.documents.length > 0 ? (
                deal.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-neutral-200 text-neutral-600 flex items-center justify-center font-bold">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-neutral-900">{doc.document_type}</p>
                        <a
                          href={`/storage/${doc.file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 mt-0.5"
                        >
                          {doc.file_name}
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Verification Badge */}
                      <div className="flex flex-col items-end">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            doc.verification_status === 'verified'
                              ? 'bg-success-50 text-success-700 border-success-100'
                              : doc.verification_status === 'rejected'
                              ? 'bg-danger-50 text-danger-700 border-danger-100'
                              : 'bg-warning-50 text-warning-700 border-warning-100'
                          }`}
                        >
                          {doc.verification_status === 'verified' && <CheckCircle2 size={12} />}
                          {doc.verification_status === 'rejected' && <XCircle size={12} />}
                          {doc.verification_status === 'pending' && <Clock size={12} />}
                          {doc.verification_status}
                        </span>
                        {doc.notes && (
                          <span className="text-[10px] text-neutral-500 mt-1 max-w-[150px] truncate">
                            {doc.notes}
                          </span>
                        )}
                      </div>

                      {/* Verify Action (Admin Only) */}
                      {isAdmin() && doc.verification_status === 'pending' && (
                        <button
                          onClick={() => handleOpenVerifyModal(doc.id)}
                          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-500 italic py-4">No documents uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column — Actions (Upload & Deal Approvals) */}
        <div className="space-y-6">
          {/* Upload Card */}
          {deal.status !== 'won' && deal.status !== 'lost' && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-neutral-850">Upload Document</h3>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Document Type
                  </label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                  >
                    <option value="Agreement">Partnership Agreement</option>
                    <option value="ID Proof">Business ID Proof</option>
                    <option value="Tax Certificate">Tax Registration Certificate</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                    Select File
                  </label>
                  <input
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="w-full text-xs text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Upload size={16} />
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </form>
            </div>
          )}

          {/* Deal Approval Card (Admin Only) */}
          {isAdmin() && deal.verification_status === 'verified' && deal.status === 'approval' && (
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-neutral-850">Deal Approval</h3>
              <p className="text-xs text-neutral-500">
                All documents have been successfully verified. Please approve or reject this deal.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDealApproval('reject')}
                  disabled={isApprovalLoading}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2 border border-danger-200 hover:bg-danger-50 text-danger-700 font-semibold rounded-lg transition-colors cursor-pointer text-sm"
                >
                  <X size={16} />
                  Reject
                </button>
                <button
                  onClick={() => handleDealApproval('approve')}
                  disabled={isApprovalLoading}
                  className="flex-1 flex items-center justify-center gap-1 px-4 py-2 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm"
                >
                  <Check size={16} />
                  Approve
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Document Verification Modal (Admin Only) */}
      {isVerifyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
            <h2 className="text-xl font-bold text-neutral-950 mb-4">Verify Document</h2>
            <form onSubmit={handleVerifyDocument} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Verification Action
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="verify_status"
                      value="verified"
                      checked={verifyStatus === 'verified'}
                      onChange={() => setVerifyStatus('verified')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    Approve / Verify
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                    <input
                      type="radio"
                      name="verify_status"
                      value="rejected"
                      checked={verifyStatus === 'rejected'}
                      onChange={() => setVerifyStatus('rejected')}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    Reject / Require Re-upload
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase mb-1">
                  Notes
                </label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Agreement matches signatory details..."
                  rows={3}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  className="px-4 py-2 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifyLoading}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isVerifyLoading ? 'Saving...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
