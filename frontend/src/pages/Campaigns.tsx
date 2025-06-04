import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  MegaphoneIcon,
  UsersIcon,
} from 'lucide-react';
import { campaignApi } from '../services/api';
import { Campaign } from '../types';
import toast from 'react-hot-toast';

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignApi.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await campaignApi.delete(id);
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success('Campaign deleted successfully');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || campaign.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-2">Manage your LinkedIn outreach campaigns</p>
        </div>
        <Link
          to="/campaigns/new"
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="card min-h-[60vh]">
        <div className="card-content p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-500 text-lg">Loading campaigns...</p>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="space-y-6">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <MegaphoneIcon className="h-5 w-5 text-primary-600 mr-2" />
                        <h3 className="text-lg font-medium text-gray-900">
                          {campaign.name}
                        </h3>
                        <span
                          className={`ml-3 badge ${
                            campaign.status === 'ACTIVE'
                              ? 'badge-success'
                              : 'badge-warning'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-2">{campaign.description}</p>
                      <div className="flex items-center mt-4 space-x-6">
                        <div className="flex items-center text-sm text-gray-500">
                          <UsersIcon className="h-4 w-4 mr-1" />
                          {campaign.leads.length} leads
                        </div>
                        <div className="text-sm text-gray-500">
                          Created {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Updated {new Date(campaign.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/campaigns/${campaign.id}`}
                        className="btn-secondary text-sm"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/campaigns/${campaign.id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit campaign"
                      >
                        <EditIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                        title="Delete campaign"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <MegaphoneIcon className="h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || filterStatus !== 'ALL'
                  ? 'No campaigns match your filters'
                  : 'No campaigns yet'}
              </h3>
              <p className="text-gray-500 text-center mb-8 max-w-md">
                {searchTerm || filterStatus !== 'ALL'
                  ? 'Try adjusting your search or filters to find what you\'re looking for'
                  : 'Create your first campaign to get started with LinkedIn outreach'}
              </p>
              {!searchTerm && filterStatus === 'ALL' && (
                <Link
                  to="/campaigns/new"
                  className="btn-primary flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Campaign
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-content text-center">
              <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
              <p className="text-sm text-gray-500">Total Campaigns</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content text-center">
              <p className="text-2xl font-bold text-success-600">
                {campaigns.filter(c => c.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-gray-500">Active Campaigns</p>
            </div>
          </div>
          <div className="card">
            <div className="card-content text-center">
              <p className="text-2xl font-bold text-primary-600">
                {campaigns.reduce((sum, c) => sum + c.leads.length, 0)}
              </p>
              <p className="text-sm text-gray-500">Total Leads</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns; 