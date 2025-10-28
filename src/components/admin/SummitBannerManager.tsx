"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Upload, 
  ExternalLink,
  Save,
  X,
  Image as ImageIcon
} from "lucide-react";
import { WSAButton } from "@/components/ui/wsa-button";
import Image from "next/image";

interface SummitBanner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function SummitBannerManager() {
  const [banners, setBanners] = useState<SummitBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<SummitBanner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/admin/summit-banners');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setBanners(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let imageUrl = formData.image_url;

      // Upload new image if selected
      if (selectedFile) {
        setUploading(true);
        imageUrl = await uploadImage(selectedFile);
        setUploading(false);
      }

      const url = editingBanner 
        ? '/api/admin/summit-banners'
        : '/api/admin/summit-banners';
      
      const method = editingBanner ? 'PUT' : 'POST';
      const body = editingBanner 
        ? { ...formData, image_url: imageUrl, id: editingBanner.id }
        : { ...formData, image_url: imageUrl };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await fetchBanners();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save banner:', error);
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const handleEdit = (banner: SummitBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image_url: banner.image_url,
      link_url: banner.link_url
    });
    setPreviewUrl(banner.image_url);
    setSelectedFile(null);
    setShowForm(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'summit-banners');

    const response = await fetch('/api/uploads/image', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return result.url;
  };

  const handleToggleActive = async (banner: SummitBanner) => {
    try {
      const response = await fetch('/api/admin/summit-banners', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: banner.id,
          is_active: !banner.is_active
        })
      });

      if (response.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error('Failed to toggle banner status:', error);
    }
  };

  const handleDelete = async (banner: SummitBanner) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/admin/summit-banners?id=${banner.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchBanners();
      }
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: ''
    });
    setEditingBanner(null);
    setShowForm(false);
    setSelectedFile(null);
    setPreviewUrl('');
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Summit Banner Manager</h2>
        <div className="text-center py-8">Loading banners...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Summit Banner Manager</h2>
        <WSAButton
          onClick={() => setShowForm(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Banner
        </WSAButton>
      </div>

      {/* Form Modal */}
      {showForm && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F26B21] focus:border-transparent"
                  placeholder="World Staffing Summit 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F26B21] focus:border-transparent"
                  rows={3}
                  placeholder="Join us for the premier global event in staffing..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Banner Image</label>
                <div className="space-y-3">
                  {/* File Upload */}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center gap-2 px-4 py-2 bg-[#F26B21] text-white rounded-lg hover:bg-[#E55A1A] cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {selectedFile ? 'Change Image' : 'Upload Image'}
                    </label>
                    {selectedFile && (
                      <span className="text-sm text-gray-600">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>

                  {/* URL Input as fallback */}
                  <div className="text-sm text-gray-500">
                    Or enter image URL:
                  </div>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value });
                      setPreviewUrl(e.target.value);
                      setSelectedFile(null);
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F26B21] focus:border-transparent"
                    placeholder="https://example.com/summit-banner.jpg"
                  />

                  {/* Preview */}
                  {previewUrl && (
                    <div className="mt-3">
                      <div className="text-sm font-medium mb-2">Preview:</div>
                      <div className="relative w-full max-w-md">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          width={400}
                          height={200}
                          className="rounded-lg object-cover w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Link URL</label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F26B21] focus:border-transparent"
                  placeholder="https://worldstaffingsummit.com"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <WSAButton
                  type="submit"
                  variant="primary"
                  disabled={submitting || uploading || (!selectedFile && !formData.image_url && !previewUrl)}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {uploading ? 'Uploading...' : submitting ? 'Saving...' : 'Save Banner'}
                </WSAButton>
                <WSAButton
                  type="button"
                  variant="secondary"
                  onClick={resetForm}
                >
                  Cancel
                </WSAButton>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Banners List */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No banners created yet. Add your first banner to get started.</p>
          </div>
        ) : (
          banners.map((banner) => (
            <motion.div
              key={banner.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={banner.image_url}
                    alt={banner.title}
                    width={96}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{banner.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Created: {new Date(banner.created_at).toLocaleDateString()}</span>
                        <a 
                          href={banner.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[#F26B21] hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          View Link
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`p-2 rounded-lg transition-colors ${
                          banner.is_active 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                        title={banner.is_active ? 'Active' : 'Inactive'}
                      >
                        {banner.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(banner)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(banner)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}