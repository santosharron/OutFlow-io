import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserIcon,
  SearchIcon,
  TrashIcon,
  ExternalLinkIcon,
  DownloadIcon,
  MapPinIcon,
  UsersIcon,
  PlusIcon,
  CheckIcon,
} from 'lucide-react';
import { profileApi, campaignApi } from '../services/api';
import { ScrapedProfile, Campaign } from '../types';
import toast from 'react-hot-toast';

const Profiles: React.FC = () => {
  const [profiles, setProfiles] = useState<ScrapedProfile[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [showAddToCampaignModal, setShowAddToCampaignModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [addingToCampaign, setAddingToCampaign] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchCampaigns();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getAll();
      setProfiles(response.data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const response = await campaignApi.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    }
  };

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProfiles.length === filteredProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(filteredProfiles.map(p => p.id || '').filter(Boolean));
    }
  };

  const handleAddToCampaign = async () => {
    if (!selectedCampaignId || selectedProfiles.length === 0) {
      toast.error('Please select a campaign and at least one profile');
      return;
    }

    try {
      setAddingToCampaign(true);
      
      // Get selected profile URLs
      const selectedProfileUrls = profiles
        .filter(p => selectedProfiles.includes(p.id || ''))
        .map(p => p.profileUrl)
        .filter(Boolean);

      // Get the current campaign
      const campaign = campaigns.find(c => c.id === selectedCampaignId);
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      // Update campaign with new leads (avoiding duplicates)
      const existingLeads = campaign.leads || [];
      const newLeads = selectedProfileUrls.filter(url => !existingLeads.includes(url));
      const updatedLeads = [...existingLeads, ...newLeads];

      await campaignApi.update(selectedCampaignId, {
        leads: updatedLeads
      });

      toast.success(`Added ${newLeads.length} profiles to ${campaign.name}`);
      setSelectedProfiles([]);
      setShowAddToCampaignModal(false);
      setSelectedCampaignId('');
      
    } catch (error) {
      console.error('Error adding profiles to campaign:', error);
      toast.error('Failed to add profiles to campaign');
    } finally {
      setAddingToCampaign(false);
    }
  };

  const handleDeleteProfile = async (id: string | undefined) => {
    if (!id) {
      toast.error('Profile ID is required for deletion');
      return;
    }

    try {
      await profileApi.delete(id);
      toast.success('Profile deleted successfully');
      fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    }
  };

  const handleExportProfiles = () => {
    if (profiles.length === 0) {
      toast.error('No profiles to export');
      return;
    }

    const csvContent = [
      ['Name', 'Headline', 'Job Title', 'Company', 'Location', 'LinkedIn URL', 'About'].join(','),
      ...filteredProfiles.map(profile => [
        profile.fullName || '',
        profile.headline || '',
        profile.currentJobTitle || '',
        profile.companyName || '',
        profile.location || '',
        profile.profileUrl || '',
        (profile.about || '').replace(/"/g, '""'),
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-profiles-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Profiles exported successfully');
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = 
      (profile.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.currentJobTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCompany = !companyFilter || 
      (profile.companyName || '').toLowerCase().includes(companyFilter.toLowerCase());
    
    const matchesLocation = !locationFilter || 
      (profile.location || '').toLowerCase().includes(locationFilter.toLowerCase());

    return matchesSearch && matchesCompany && matchesLocation;
  });

  const uniqueCompanies = Array.from(new Set(
    profiles.map(p => p.companyName).filter(Boolean)
  )).sort();

  const uniqueLocations = Array.from(new Set(
    profiles.map(p => p.location).filter(Boolean)
  )).sort();

  const hasFilters = searchTerm || companyFilter || locationFilter;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profiles</h1>
          <p className="text-gray-600 mt-2">Manage your scraped LinkedIn profiles</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedProfiles.length > 0 && (
            <button
              onClick={() => setShowAddToCampaignModal(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add to Campaign ({selectedProfiles.length})
            </button>
          )}
          {profiles.length > 0 && (
            <button
              onClick={handleExportProfiles}
              className="btn-secondary flex items-center"
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export All
            </button>
          )}
        </div>
      </div>

      {/* Bulk Selection Controls */}
      {filteredProfiles.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedProfiles.length === filteredProfiles.length && filteredProfiles.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Select All ({filteredProfiles.length})
                </span>
              </label>
              {selectedProfiles.length > 0 && (
                <span className="text-sm text-primary-600 font-medium">
                  {selectedProfiles.length} selected
                </span>
              )}
            </div>
            {selectedProfiles.length > 0 && (
              <button
                onClick={() => setSelectedProfiles([])}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="card-content p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search profiles..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <select
              className="input"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              {uniqueLocations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center">
          <UsersIcon className="h-6 w-6 text-primary-600 mr-3" />
          <h2 className="text-lg font-semibold text-gray-900">
            All Profiles ({filteredProfiles.length} of {profiles.length})
          </h2>
        </div>
      </div>

      {/* Profiles List */}
      <div className="card min-h-[60vh]">
        <div className="card-content p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-500 text-lg">Loading profiles...</p>
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="space-y-4">
              {filteredProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <label className="flex items-center mt-1">
                        <input
                          type="checkbox"
                          checked={selectedProfiles.includes(profile.id || '')}
                          onChange={() => handleSelectProfile(profile.id || '')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                      </label>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-primary-600 mr-2" />
                          <h3 className="text-lg font-medium text-gray-900">
                            {profile.fullName || 'Unknown Name'}
                          </h3>
                        </div>
                        <p className="text-gray-600 mt-1">
                          {profile.currentJobTitle || 'No title available'}
                        </p>
                        <p className="text-gray-500 mt-1">
                          {profile.companyName || 'No company available'}
                        </p>
                        {profile.location && (
                          <p className="text-gray-500 mt-1 flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {profile.location}
                          </p>
                        )}
                        {profile.about && (
                          <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                            {profile.about}
                          </p>
                        )}
                        <div className="flex items-center mt-4 space-x-4">
                          <span className="text-xs text-gray-500">
                            Scraped {profile.scrapedAt ? new Date(profile.scrapedAt).toLocaleDateString() : 'Date unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {profile.profileUrl && (
                        <a
                          href={profile.profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="View LinkedIn profile"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                      )}
                      {profile.id && (
                        <button
                          onClick={() => handleDeleteProfile(profile.id!)}
                          className="p-2 text-gray-400 hover:text-danger-600 transition-colors"
                          title="Delete profile"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <UserIcon className="h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {hasFilters ? 'No profiles match your filters' : 'No profiles yet'}
              </h3>
              <p className="text-gray-500 text-center mb-8 max-w-md">
                {hasFilters
                  ? 'Try adjusting your search or filters to find what you\'re looking for'
                  : 'Use the Profile Scraper to add LinkedIn profiles to your database'}
              </p>
              {!hasFilters && (
                <Link
                  to="/profile-scraper"
                  className="btn-primary flex items-center"
                >
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Scrape Profiles
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add to Campaign Modal */}
      {showAddToCampaignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
                Add Profiles to Campaign
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Adding {selectedProfiles.length} profile{selectedProfiles.length !== 1 ? 's' : ''} to campaign
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Campaign
                </label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Choose a campaign...</option>
                  {campaigns.filter(c => c.status !== 'DELETED').map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} ({campaign.leads?.length || 0} leads)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddToCampaignModal(false);
                    setSelectedCampaignId('');
                  }}
                  className="btn-secondary"
                  disabled={addingToCampaign}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCampaign}
                  disabled={!selectedCampaignId || addingToCampaign}
                  className="btn-primary flex items-center"
                >
                  {addingToCampaign ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add to Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profiles; 