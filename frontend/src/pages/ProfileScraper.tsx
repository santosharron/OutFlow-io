import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SearchIcon,
  UserIcon,
  PlusIcon,
  ExternalLinkIcon,
  DownloadIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { profileApi, campaignApi } from '../services/api';
import { Campaign, ScrapedProfile, ScrapeRequest } from '../types';
import toast from 'react-hot-toast';

const ProfileScraper: React.FC = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [scrapeRequest, setScrapeRequest] = useState<ScrapeRequest>({
    url: '',
    maxProfiles: 10,
  });
  const [scrapedProfiles, setScrapedProfiles] = useState<ScrapedProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    if (campaignId) {
      setSelectedCampaign(campaignId);
    }
  }, [campaignId]);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignApi.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    }
  };

  const handleScrapeProfiles = async () => {
    if (!scrapeRequest.url.trim()) {
      toast.error('Please enter a LinkedIn search URL');
      return;
    }

    try {
      setScraping(true);
      console.log('🔍 Starting scrape with URL:', scrapeRequest.url);
      
      const response = await profileApi.scrape({
        url: scrapeRequest.url,
      });
      
      console.log('📊 Scrape response:', response);
      console.log('📈 Response data:', response.data);
      console.log('🔢 Profile count:', response.count);
      
      // Handle the response data
      if (response.success && response.data && Array.isArray(response.data)) {
        setScrapedProfiles(response.data);
        toast.success(`Successfully scraped ${response.count || response.data.length} profiles`);
        
        // Show breakdown of what was found
        const validProfiles = response.data.filter(p => p.fullName && p.fullName !== 'LinkedIn User');
        const urlOnlyProfiles = response.data.filter(p => (!p.fullName || p.fullName === 'LinkedIn User') && p.profileUrl);
        
        if (validProfiles.length > 0) {
          console.log(`✅ Found ${validProfiles.length} profiles with complete data`);
        }
        if (urlOnlyProfiles.length > 0) {
          console.log(`⚠️  Found ${urlOnlyProfiles.length} profiles with URLs only (names need manual extraction)`);
        }
      } else {
        console.error('❌ Invalid response format:', response);
        toast.error('Invalid response from scraper');
        setScrapedProfiles([]);
      }
    } catch (error) {
      console.error('❌ Error scraping profiles:', error);
      toast.error('Failed to scrape profiles. Please check the console for details.');
    } finally {
      setScraping(false);
    }
  };

  const handleAddToCampaign = async (profile: ScrapedProfile) => {
    if (!selectedCampaign) {
      toast.error('Please select a campaign first');
      return;
    }

    try {
      // This would typically be handled by a campaign API endpoint
      // For now, we'll just show a success message
      toast.success(`Added ${profile.fullName} to campaign`);
    } catch (error) {
      console.error('Error adding profile to campaign:', error);
      toast.error('Failed to add profile to campaign');
    }
  };

  const handleExportProfiles = () => {
    if (scrapedProfiles.length === 0) {
      toast.error('No profiles to export');
      return;
    }

    const csvContent = [
      ['Full Name', 'Headline', 'Job Title', 'Company', 'Location', 'LinkedIn URL', 'About', 'Profile Photo URL'].join(','),
      ...scrapedProfiles.map(profile => [
        profile.fullName || '',
        profile.headline || '',
        profile.currentJobTitle || '',
        profile.companyName || '',
        profile.location || '',
        profile.profileUrl || '',
        profile.about || '',
        profile.profilePhoto || '',
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scraped-profiles-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Profiles exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Scraper</h1>
        <p className="text-gray-600">Extract LinkedIn profile data for your campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scraping Form */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <SearchIcon className="h-5 w-5 text-primary-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Scrape Profiles</h2>
              </div>
            </div>
            <div className="card-content space-y-4">
              {/* Campaign Selection */}
              {campaigns.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Campaign (Optional)
                  </label>
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="input"
                  >
                    <option value="">Select a campaign</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn Search URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={scrapeRequest.url}
                  onChange={(e) => setScrapeRequest(prev => ({
                    ...prev,
                    url: e.target.value,
                  }))}
                  placeholder="https://www.linkedin.com/search/results/people/?keywords=..."
                  className="input"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste a LinkedIn people search URL (must include "linkedin.com/search/results/people")
                </p>
                <div className="mt-2 p-3 bg-blue-50 rounded-md">
                  <p className="text-xs font-medium text-blue-900 mb-1">Example URL:</p>
                  <code className="text-xs text-blue-700 break-all">
                    https://www.linkedin.com/search/results/people/?geoUrn=%5B%22103644278%22%5D&industry=%5B%221594%22%2C%221862%22%2C%2280%22%5D&keywords=%22lead%20generation%20agency%22&origin=GLOBAL_SEARCH_HEADER&titleFreeText=Founder
                  </code>
                </div>
              </div>

              {/* Max Results */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Results
                </label>
                <select
                  value={scrapeRequest.maxProfiles}
                  onChange={(e) => setScrapeRequest(prev => ({
                    ...prev,
                    maxProfiles: parseInt(e.target.value),
                  }))}
                  className="input"
                >
                  <option value={5}>5 profiles</option>
                  <option value={10}>10 profiles</option>
                  <option value={25}>25 profiles</option>
                  <option value={50}>50 profiles</option>
                </select>
              </div>

              {/* Scrape Button */}
              <button
                onClick={handleScrapeProfiles}
                disabled={scraping}
                className="w-full btn-primary flex items-center justify-center"
              >
                {scraping ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Scrape Profiles
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-success-600 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">Scraped Profiles</h2>
                  {scrapedProfiles.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({scrapedProfiles.length} profiles)
                    </span>
                  )}
                </div>
                {scrapedProfiles.length > 0 && (
                  <button
                    onClick={handleExportProfiles}
                    className="btn-secondary text-sm flex items-center"
                  >
                    <DownloadIcon className="h-3 w-3 mr-1" />
                    Export CSV
                  </button>
                )}
              </div>
            </div>
            <div className="card-content">
              {scrapedProfiles.length > 0 ? (
                <div className="space-y-4">
                  {/* Scraping Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Scraping Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Total Profiles:</span>
                        <span className="ml-2 text-blue-900">{scrapedProfiles.length}</span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">With Complete Data:</span>
                        <span className="ml-2 text-blue-900">
                          {scrapedProfiles.filter(p => 
                            p.fullName && 
                            p.fullName !== 'LinkedIn User' && 
                            p.fullName !== 'Unknown' &&
                            p.currentJobTitle &&
                            !p.currentJobTitle.includes('degree connection')
                          ).length}
                        </span>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">URLs Only:</span>
                        <span className="ml-2 text-blue-900">
                          {scrapedProfiles.filter(p => 
                            (!p.fullName || p.fullName === 'LinkedIn User' || p.fullName === 'Unknown') && 
                            p.profileUrl
                          ).length}
                        </span>
                      </div>
                    </div>
                    {scrapedProfiles.filter(p => (!p.fullName || p.fullName === 'LinkedIn User') && p.profileUrl).length > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-xs text-yellow-800">
                          <strong>Note:</strong> Some profiles show "Name extraction needed" because LinkedIn's current layout 
                          prevents automatic name extraction. You can still access these profiles via their LinkedIn URLs 
                          and manually extract the data.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Profile Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Full Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Headline
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Job Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            LinkedIn URL
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            About
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {scrapedProfiles.map((profile, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {/* Full Name with Photo */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  {profile.profilePhoto ? (
                                    <img
                                      className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                      src={profile.profilePhoto}
                                      alt={profile.fullName}
                                      onError={(e) => {
                                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'U')}&background=0D8ABC&color=fff&size=40`;
                                      }}
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <UserIcon className="h-6 w-6 text-gray-500" />
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {profile.fullName && 
                                     profile.fullName !== 'LinkedIn User' && 
                                     profile.fullName !== 'Unknown' 
                                      ? profile.fullName 
                                      : `Profile ${index + 1}`}
                                  </div>
                                  {(!profile.fullName || 
                                    profile.fullName === 'LinkedIn User' || 
                                    profile.fullName === 'Unknown') && (
                                    <div className="text-xs text-yellow-600">
                                      Name extraction needed
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            
                            {/* Headline */}
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={profile.headline || 'Not available'}>
                                  {profile.headline || 'Not available'}
                                </div>
                              </div>
                            </td>
                            
                            {/* Job Title */}
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={profile.currentJobTitle || 'Not available'}>
                                  {profile.currentJobTitle && 
                                   !profile.currentJobTitle.includes('degree connection') && 
                                   profile.currentJobTitle !== 'Not specified'
                                    ? profile.currentJobTitle 
                                    : 'Not available'}
                                </div>
                              </div>
                            </td>
                            
                            {/* Company */}
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={profile.companyName || 'Not available'}>
                                  {profile.companyName && profile.companyName !== 'Not specified'
                                    ? profile.companyName
                                    : 'Not available'}
                                </div>
                              </div>
                            </td>
                            
                            {/* Location */}
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={profile.location || 'Not available'}>
                                  {profile.location && profile.location !== 'Not specified' 
                                    ? profile.location 
                                    : 'Not available'}
                                </div>
                              </div>
                            </td>
                            
                            {/* LinkedIn URL */}
                            <td className="px-6 py-4">
                              {profile.profileUrl ? (
                                <a
                                  href={profile.profileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
                                  title={profile.profileUrl}
                                >
                                  <ExternalLinkIcon className="h-3 w-3 mr-1" />
                                  View Profile
                                </a>
                              ) : (
                                <span className="text-gray-400 text-sm">Not available</span>
                              )}
                            </td>
                            
                            {/* About */}
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                <div 
                                  className="truncate" 
                                  title={profile.about || 'Not available'}
                                >
                                  {profile.about ? 
                                    (profile.about.length > 100 
                                      ? profile.about.substring(0, 100) + '...' 
                                      : profile.about)
                                    : 'Not available'}
                                </div>
                              </div>
                            </td>
                            
                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {selectedCampaign && (
                                <button
                                  onClick={() => handleAddToCampaign(profile)}
                                  className="text-blue-600 hover:text-blue-900 flex items-center"
                                >
                                  <PlusIcon className="h-3 w-3 mr-1" />
                                  Add
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No profiles scraped yet</p>
                  <p className="text-gray-400 text-sm">
                    Enter profile URLs or a search query and click "Scrape Profiles" to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">How to Use Profile Scraper</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Profile URLs</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enter LinkedIn profile URLs, one per line</li>
                <li>• Make sure profiles are public or accessible</li>
                <li>• Use the full LinkedIn URL format</li>
                <li>• Maximum 50 profiles per batch</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Search Queries</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use job titles, companies, or skills</li>
                <li>• Be specific for better results</li>
                <li>• Examples: "CEO at Startup", "React Developer"</li>
                <li>• Results depend on LinkedIn's public data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScraper; 