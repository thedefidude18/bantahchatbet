import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useToast } from '../../contexts/ToastContext';

interface EditEventModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Should have a default export
export default function EditEventModal({ event, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    start_time: event.start_time || '',
    end_time: event.end_time || '',
  });
  const [loading, setLoading] = useState(false);
  const { supabase } = useSupabase();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('events')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', event.id);

      if (error) throw error;

      toast.showSuccess('Event updated successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.showError(error.message || 'Failed to update event');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />

        <div className="relative bg-[#242538] rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-bold text-white mb-4">
            Edit Event
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1a1b2e] text-white rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1a1b2e] text-white rounded-lg"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Start Time</label>
              <input
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1a1b2e] text-white rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">End Time</label>
              <input
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1a1b2e] text-white rounded-lg"
                required
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white rounded-lg hover:bg-white/10"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#CCFF00] text-black rounded-lg font-medium disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
};