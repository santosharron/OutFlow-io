import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MegaphoneIcon,
  MessageSquareIcon,
  UsersIcon,
  TrendingUpIcon,
  PlusIcon,
} from 'lucide-react';
import { campaignApi } from '../services/api';
import { Campaign } from '../types';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

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

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'ACTIVE').length,
    inactiveCampaigns: campaigns.filter(c => c.status === 'INACTIVE').length,
    totalLeads: campaigns.reduce((sum, c) => sum + c.leads.length, 0),
  };

  const recentCampaigns = campaigns
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome to OutFlo Campaign Management</p>
        </div>
        <Link
          to="/campaigns"
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Campaign
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-md transition-shadow">
          <div className="card-content p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MegaphoneIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="card-content p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUpIcon className="h-8 w-8 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="card-content p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-md transition-shadow">
          <div className="card-content p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquareIcon className="h-8 w-8 text-secondary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Inactive Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveCampaigns}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link
          to="/campaigns"
          className="card hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
        >
          <div className="card-content p-6">
            <div className="flex items-center">
              <MegaphoneIcon className="h-6 w-6 text-primary-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Campaigns</h3>
                <p className="text-gray-600 mt-1">Create, edit, and manage your campaigns</p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/message-generator"
          className="card hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
        >
          <div className="card-content p-6">
            <div className="flex items-center">
              <MessageSquareIcon className="h-6 w-6 text-success-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Generate Messages</h3>
                <p className="text-gray-600 mt-1">Create personalized LinkedIn messages</p>
              </div>
            </div>
          </div>
        </Link>

        <Link
          to="/profile-scraper"
          className="card hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
        >
          <div className="card-content p-6">
            <div className="flex items-center">
              <UsersIcon className="h-6 w-6 text-warning-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Scrape Profiles</h3>
                <p className="text-gray-600 mt-1">Extract LinkedIn profile data</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Campaigns */}
      <div className="card">
        <div className="card-header px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Campaigns</h2>
            <Link
              to="/campaigns"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="card-content p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-500">Loading campaigns...</p>
            </div>
          ) : recentCampaigns.length > 0 ? (
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-500">
                        {campaign.leads.length} leads
                      </span>
                      <span className="text-xs text-gray-500">
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`badge ${
                        campaign.status === 'ACTIVE'
                          ? 'badge-success'
                          : 'badge-warning'
                      }`}
                    >
                      {campaign.status}
                    </span>
                    <Link
                      to={`/campaigns/${campaign.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <MegaphoneIcon className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-500 text-center mb-6 max-w-md">
                Create your first campaign to get started with LinkedIn outreach
              </p>
              <Link
                to="/campaigns"
                className="btn-primary flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create your first campaign
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 