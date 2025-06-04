import React from 'react';

// Campaign types
export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  leads: string[];
  accountIDs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignData {
  name: string;
  description: string;
  leads: string[];
  accountIDs: string[];
}

export interface UpdateCampaignData {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  leads?: string[];
  accountIDs?: string[];
}

// LinkedIn Profile types
export interface LinkedInProfile {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
}

export interface GeneratedMessage {
  message: string;
  profile: LinkedInProfile;
}

export interface MessageVariations {
  messages: string[];
  count: number;
  profile: LinkedInProfile;
}

// Scraped Profile types
export interface ScrapedProfile {
  id?: string;
  fullName: string;
  headline: string;
  currentJobTitle: string;
  companyName: string;
  location: string;
  profileUrl: string;
  about: string;
  profilePhoto: string;
  scrapedAt?: string;
}

export interface ScrapeRequest {
  url: string;
  maxProfiles?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    details?: any;
    stack?: string;
  };
}

// Form types
export interface CampaignFormData {
  name: string;
  description: string;
  leads: string;
  accountIDs: string;
}

export interface MessageFormData {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
  profileUrl?: string;
  messageType?: string;
  tone?: string;
  customPrompt?: string;
}

// UI State types
export interface LoadingState {
  campaigns: boolean;
  campaign: boolean;
  message: boolean;
  profiles: boolean;
  scraping: boolean;
}

export interface ErrorState {
  campaigns: string | null;
  campaign: string | null;
  message: string | null;
  profiles: string | null;
  scraping: string | null;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
}

// Table types
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Button types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
} 