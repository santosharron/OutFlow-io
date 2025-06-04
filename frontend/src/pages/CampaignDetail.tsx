import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EditIcon,
  TrashIcon,
  UsersIcon,
  MessageSquareIcon,
  CalendarIcon,
  PlayIcon,
  PauseIcon,
  UserIcon,
} from 'lucide-react';
import { campaignApi } from '../services/api';
import { Campaign } from '../types';
import toast from 'react-hot-toast';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampaign(id);
    }
  }, [id]);

  const fetchCampaign = async (campaignId: string) => {
    try {
      setLoading(true);
      const response = await campaignApi.getById(campaignId);
      setCampaign(response.data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast.error('Failed to fetch campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign || !window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await campaignApi.delete(campaign.id);
      toast.success('Campaign deleted successfully');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const handleToggleStatus = async () => {
    if (!campaign) return;

    const newStatus = campaign.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      const response = await campaignApi.update(campaign.id, {
        ...campaign,
        status: newStatus,
      });
      setCampaign(response.data);
      toast.success(`Campaign ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
        <Link to="/campaigns" className="btn-primary mt-4">
          Back to Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/campaigns"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-600">{campaign.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggleStatus}
            className={`btn-secondary flex items-center ${
              campaign.status === 'ACTIVE' ? 'text-warning-600' : 'text-success-600'
            }`}
          >
            {campaign.status === 'ACTIVE' ? (
              <>
                <PauseIcon className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </button>
          <Link
            to={`/campaigns/${campaign.id}/edit`}
            className="btn-secondary flex items-center"
          >
            <EditIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handleDeleteCampaign}
            className="btn-danger flex items-center"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Campaign Details</h2>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <span
                    className={`badge ${
                      campaign.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Leads
                  </label>
                  <div className="flex items-center">
                    <UsersIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">{campaign.leads.length}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created
                  </label>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Updated
                  </label>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-900">
                      {new Date(campaign.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
            </div>
            <div className="card-content space-y-3">
              <Link
                to={`/message-generator?campaign=${campaign.id}`}
                className="w-full btn-primary flex items-center justify-center"
              >
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                Generate Messages
              </Link>
              <Link
                to={`/profile-scraper?campaign=${campaign.id}`}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <UsersIcon className="h-4 w-4 mr-2" />
                Add Leads
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Campaign Leads</h2>
            <span className="text-sm text-gray-500">
              {campaign.leads.length} total leads
            </span>
          </div>
        </div>
        <div className="card-content">
          {campaign.leads.length > 0 ? (
            <div className="space-y-4">
              {campaign.leads.map((lead, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">
                        LinkedIn Profile {index + 1}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {lead}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={lead}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View Profile
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No leads in this campaign yet</p>
              <p className="text-gray-400 text-sm mb-6">
                Add leads to start your outreach campaign
              </p>
              <Link
                to={`/profile-scraper?campaign=${campaign.id}`}
                className="btn-primary"
              >
                Add Leads
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail; 