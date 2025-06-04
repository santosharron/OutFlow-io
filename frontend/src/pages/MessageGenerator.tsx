import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquareIcon,
  SparklesIcon,
  CopyIcon,
  RefreshCwIcon,
  UserIcon,
} from 'lucide-react';
import { messageApi, campaignApi } from '../services/api';
import { Campaign, GeneratedMessage, MessageFormData } from '../types';
import toast from 'react-hot-toast';

const MessageGenerator: React.FC = () => {
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get('campaign');
  
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [formData, setFormData] = useState<MessageFormData>({
    name: '',
    job_title: '',
    company: '',
    location: '',
    summary: '',
    profileUrl: '',
    messageType: 'CONNECTION_REQUEST',
    tone: 'PROFESSIONAL',
    customPrompt: '',
  });
  const [generatedMessage, setGeneratedMessage] = useState<GeneratedMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [messageVariations, setMessageVariations] = useState<string[]>([]);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateMessage = async () => {
    if (!formData.profileUrl?.trim()) {
      toast.error('Please enter a LinkedIn profile URL');
      return;
    }

    if (!formData.name?.trim()) {
      toast.error('Please enter the person\'s full name');
      return;
    }

    if (!formData.job_title?.trim()) {
      toast.error('Please enter the person\'s job title');
      return;
    }

    if (!formData.company?.trim()) {
      toast.error('Please enter the person\'s company');
      return;
    }

    try {
      setGenerating(true);
      const response = await messageApi.generate({
        name: formData.name,
        job_title: formData.job_title,
        company: formData.company,
        location: formData.location,
        summary: formData.summary,
      });
      setGeneratedMessage(response.data);
      toast.success('Message generated successfully!');
    } catch (error) {
      console.error('Error generating message:', error);
      toast.error('Failed to generate message');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyMessage = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success('Message copied to clipboard!');
    } catch (error) {
      console.error('Error copying message:', error);
      toast.error('Failed to copy message');
    }
  };

  const handleGenerateVariations = async () => {
    if (!generatedMessage) return;

    try {
      setLoading(true);
      const response = await messageApi.generateVariations({
        name: formData.name,
        job_title: formData.job_title,
        company: formData.company,
        location: formData.location,
        summary: formData.summary,
      }, 3);
      setMessageVariations(response.data.messages);
      toast.success('Message variations generated!');
    } catch (error) {
      console.error('Error generating variations:', error);
      toast.error('Failed to generate variations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Message Generator</h1>
        <p className="text-gray-600">Generate personalized LinkedIn messages using AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <SparklesIcon className="h-5 w-5 text-primary-600 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Generate Message</h2>
            </div>
          </div>
          <div className="card-content space-y-4">
            {/* Campaign Selection */}
            {campaigns.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign (Optional)
                </label>
                <select
                  name="campaignId"
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

            {/* Profile URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn Profile URL *
              </label>
              <input
                type="url"
                name="profileUrl"
                value={formData.profileUrl}
                onChange={handleInputChange}
                placeholder="https://linkedin.com/in/username"
                className="input"
                required
              />
            </div>

            {/* Profile Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                name="job_title"
                value={formData.job_title}
                onChange={handleInputChange}
                placeholder="Software Engineer"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Google"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="San Francisco, CA"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                placeholder="Brief professional summary..."
                rows={3}
                className="textarea"
              />
            </div>

            {/* Message Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Type
              </label>
              <select
                name="messageType"
                value={formData.messageType}
                onChange={handleInputChange}
                className="input"
              >
                <option value="CONNECTION_REQUEST">Connection Request</option>
                <option value="FOLLOW_UP">Follow-up Message</option>
                <option value="INTRODUCTION">Introduction</option>
                <option value="PITCH">Sales Pitch</option>
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <select
                name="tone"
                value={formData.tone}
                onChange={handleInputChange}
                className="input"
              >
                <option value="PROFESSIONAL">Professional</option>
                <option value="CASUAL">Casual</option>
                <option value="FRIENDLY">Friendly</option>
                <option value="FORMAL">Formal</option>
              </select>
            </div>

            {/* Custom Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Instructions (Optional)
              </label>
              <textarea
                name="customPrompt"
                value={formData.customPrompt}
                onChange={handleInputChange}
                placeholder="Add any specific instructions or context for the message..."
                rows={3}
                className="textarea"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateMessage}
              disabled={generating || !formData.profileUrl?.trim() || !formData.name?.trim() || !formData.job_title?.trim() || !formData.company?.trim()}
              className="w-full btn-primary flex items-center justify-center"
            >
              {generating ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Generate Message
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Message */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquareIcon className="h-5 w-5 text-success-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Generated Message</h2>
              </div>
              {generatedMessage && (
                <button
                  onClick={handleGenerateVariations}
                  disabled={loading}
                  className="btn-secondary text-sm flex items-center"
                >
                  {loading ? (
                    <>
                      <RefreshCwIcon className="h-3 w-3 mr-1 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <RefreshCwIcon className="h-3 w-3 mr-1" />
                      Variations
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="card-content">
            {generatedMessage ? (
              <div className="space-y-4">
                {/* Profile Info */}
                {generatedMessage.profile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {generatedMessage.profile.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {generatedMessage.profile.job_title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {generatedMessage.profile.company}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Message */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-900">Generated Message</h3>
                    <button
                      onClick={() => handleCopyMessage(generatedMessage.message)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy message"
                    >
                      <CopyIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {generatedMessage.message}
                  </p>
                </div>

                {/* Message Variations */}
                {messageVariations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">Variations</h3>
                    {messageVariations.map((variation: string, index: number) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700">
                            Variation {index + 1}
                          </h4>
                          <button
                            onClick={() => handleCopyMessage(variation)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy variation"
                          >
                            <CopyIcon className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {variation}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquareIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">No message generated yet</p>
                <p className="text-gray-400 text-sm">
                  Enter a LinkedIn profile URL and click "Generate Message" to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-medium text-gray-900">Tips for Better Messages</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Profile URL Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use the full LinkedIn profile URL</li>
                <li>• Make sure the profile is public or accessible</li>
                <li>• Double-check the URL for typos</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Message Tips</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Keep messages concise and personalized</li>
                <li>• Use custom instructions for specific contexts</li>
                <li>• Generate variations to test different approaches</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageGenerator; 