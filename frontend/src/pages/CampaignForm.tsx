import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, SaveIcon, PlusIcon } from 'lucide-react';
import { campaignApi } from '../services/api';
import { Campaign, CreateCampaignData, UpdateCampaignData } from '../types';
import toast from 'react-hot-toast';

const CampaignForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchCampaign();
    }
  }, [id, isEditing]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignApi.getById(id!);
      const campaign = response.data;
      setFormData({
        name: campaign.name,
        description: campaign.description,
        status: campaign.status === 'DELETED' ? 'INACTIVE' : campaign.status,
      });
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to load campaign');
      navigate('/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    try {
      setSaving(true);
      
      if (isEditing) {
        const updateData: UpdateCampaignData = {
          name: formData.name,
          description: formData.description,
          status: formData.status,
        };
        await campaignApi.update(id!, updateData);
        toast.success('Campaign updated successfully');
      } else {
        const createData: CreateCampaignData = {
          name: formData.name,
          description: formData.description,
          leads: [],
          accountIDs: [],
        };
        await campaignApi.create(createData);
        toast.success('Campaign created successfully');
      }
      
      navigate('/campaigns');
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} campaign`);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-500 text-lg ml-4">Loading campaign...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/campaigns')}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Update your campaign details' : 'Set up a new LinkedIn outreach campaign'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card max-w-2xl">
        <div className="card-content p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input w-full"
                placeholder="Enter campaign name..."
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input w-full resize-vertical"
                placeholder="Describe your campaign objectives and target audience..."
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {isEditing ? (
                      <SaveIcon className="h-4 w-4 mr-2" />
                    ) : (
                      <PlusIcon className="h-4 w-4 mr-2" />
                    )}
                    {isEditing ? 'Update Campaign' : 'Create Campaign'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tips */}
      <div className="card max-w-2xl bg-blue-50 border-blue-200">
        <div className="card-content p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Campaign Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Use descriptive names that reflect your target audience</li>
            <li>• Set clear objectives in the description for better tracking</li>
            <li>• Start with INACTIVE status to test your setup before going live</li>
            <li>• You can add leads and customize messages after creating the campaign</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CampaignForm; 