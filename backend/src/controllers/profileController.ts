import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { scrapeLinkedInProfiles } from '../services/scraperService';

// Get all scraped profiles
export const getProfiles = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 20, company, location } = req.query;
  
  const options = {
    page: parseInt(page as string),
    limit: Math.min(parseInt(limit as string), 50), // Maximum 50 per page
    sort: { scrapedAt: -1 as const }
  };

  let query: any = {};
  
  if (company) {
    query.companyName = { $regex: company as string, $options: 'i' };
  }
  
  if (location) {
    query.location = { $regex: location as string, $options: 'i' };
  }

  const profiles = await Profile.find(query)
    .sort(options.sort)
    .limit(options.limit * options.page)
    .skip((options.page - 1) * options.limit);

  const total = await Profile.countDocuments(query);

  res.status(200).json({
    success: true,
    count: profiles.length,
    total,
    page: options.page,
    pages: Math.ceil(total / options.limit),
    data: profiles
  });
});

// Search profiles by LinkedIn URL
export const searchProfiles = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.query;
  
  if (!url) {
    throw createError('LinkedIn URL is required', 400);
  }

  const profiles = await Profile.find({
    profileUrl: { $regex: url as string, $options: 'i' }
  }).sort({ scrapedAt: -1 });

  res.status(200).json({
    success: true,
    count: profiles.length,
    data: profiles
  });
});

// Get single profile by ID
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    throw createError('Profile not found', 404);
  }

  res.status(200).json({
    success: true,
    data: profile
  });
});

// Scrape LinkedIn profiles (Bonus feature)
export const scrapeProfiles = asyncHandler(async (req: Request, res: Response) => {
  const { url } = req.body;
  
  if (!url || typeof url !== 'string') {
    throw createError('LinkedIn search URL is required', 400);
  }

  // Validate URL format
  if (!url.includes('linkedin.com/search/results/people')) {
    throw createError('Invalid LinkedIn search URL format', 400);
  }

  console.log('🚀 Starting LinkedIn profile scraping...');
  console.log('🔗 URL:', url);

  try {
    const result = await scrapeLinkedInProfiles(url);
    
    console.log('📡 Scraping result received:', {
      success: result.success,
      count: result.count,
      message: result.message
    });
    
    if (result.success) {
      const response = {
        success: true,
        message: result.message,
        count: result.count,
        data: result.profiles
      };
      
      console.log('✅ Sending success response to frontend:', {
        success: response.success,
        count: response.count,
        profilesLength: response.data?.length
      });
      
      res.status(200).json(response);
    } else {
      console.log('❌ Sending failure response to frontend');
      res.status(500).json({
        success: false,
        message: result.message || 'Scraping failed',
        count: 0
      });
    }
  } catch (error) {
    console.error('❌ Profile scraping error:', error);
    throw createError('Failed to scrape LinkedIn profiles', 500);
  }
});

// Delete profile
export const deleteProfile = asyncHandler(async (req: Request, res: Response) => {
  const profile = await Profile.findById(req.params.id);

  if (!profile) {
    throw createError('Profile not found', 404);
  }

  await Profile.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Profile deleted successfully'
  });
});

// Get profile statistics
export const getProfileStats = asyncHandler(async (req: Request, res: Response) => {
  const totalProfiles = await Profile.countDocuments();
  
  const companyStats = await Profile.aggregate([
    {
      $group: {
        _id: '$companyName',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const locationStats = await Profile.aggregate([
    {
      $group: {
        _id: '$location',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  const recentlyScraped = await Profile.countDocuments({
    scrapedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });

  res.status(200).json({
    success: true,
    data: {
      totalProfiles,
      recentlyScraped,
      topCompanies: companyStats,
      topLocations: locationStats
    }
  });
}); 