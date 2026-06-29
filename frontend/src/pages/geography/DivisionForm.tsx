import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import type { Division, ApiResponse } from '@/types';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function DivisionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isEdit) {
      const fetchDivision = async () => {
        setIsLoading(true);
        try {
          const response = await api.get<ApiResponse<Division>>(`/divisions/${id}`);
          const div = response.data.data;
          setFormData({
            name: div.name,
            code: div.code,
            description: div.description || '',
            is_active: div.is_active,
          });
        } catch (err) {
          console.error(err);
          setError('Failed to load division details.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDivision();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitLoading(true);

    try {
      if (isEdit) {
        await api.put(`/divisions/${id}`, formData);
      } else {
        await api.post('/divisions', formData);
      }
      navigate('/geography/divisions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save division.');
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/geography/divisions')}
        className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to divisions
      </button>

      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          {isEdit ? 'Edit Division' : 'Create Division'}
        </h1>
        <p className="text-neutral-500 text-sm">
          {isEdit ? 'Update details of the division.' : 'Add a new geographic division to the hierarchy.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-danger-50 border border-danger-100 text-danger-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Division Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. North Division"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Division Code
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. DIV-NORTH"
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all disabled:bg-neutral-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide a brief description..."
              rows={4}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-neutral-700">
                Active status
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
            <button
              type="button"
              onClick={() => navigate('/geography/divisions')}
              className="px-4 py-2 border border-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitLoading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              {isSubmitLoading ? 'Saving...' : 'Save Division'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
