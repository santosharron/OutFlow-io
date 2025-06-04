import { Request, Response } from 'express';
import { Campaign } from '../models/Campaign';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Get all campaigns (excluding DELETED)
export const getCampaigns = asyncHandler(async (req: Request, res: Response) => {
  const campaigns = await Campaign.find({ 
    status: { $ne: 'DELETED' } 
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: campaigns.length,
    data: campaigns
  });
});

// Get single campaign by ID
export const getCampaign = asyncHandler(async (req: Request, res: Response) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign || campaign.status === 'DELETED') {
    throw createError('Campaign not found', 404);
  }

  res.status(200).json({
    success: true,
    data: campaign
  });
});

// Create new campaign
export const createCampaign = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, leads, accountIDs } = req.body;

  if (!name || !description) {
    throw createError('Name and description are required', 400);
  }

  // Allow creating campaigns without leads initially - they can be added later
  const campaignLeads = leads && Array.isArray(leads) ? leads : [];
  const campaignAccountIDs = accountIDs && Array.isArray(accountIDs) ? accountIDs : [];

  const campaign = await Campaign.create({
    name,
    description,
    leads: campaignLeads,
    accountIDs: campaignAccountIDs,
    status: 'ACTIVE'
  });

  res.status(201).json({
    success: true,
    data: campaign
  });
});

// Update campaign
export const updateCampaign = asyncHandler(async (req: Request, res: Response) => {
  let campaign = await Campaign.findById(req.params.id);

  if (!campaign || campaign.status === 'DELETED') {
    throw createError('Campaign not found', 404);
  }

  const { name, description, status, leads, accountIDs } = req.body;

  if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
    throw createError('Status must be either ACTIVE or INACTIVE', 400);
  }

  campaign = await Campaign.findByIdAndUpdate(
    req.params.id,
    {
      ...(name && { name }),
      ...(description && { description }),
      ...(status && { status }),
      ...(leads && { leads }),
      ...(accountIDs && { accountIDs })
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: campaign
  });
});

// Soft delete campaign
export const deleteCampaign = asyncHandler(async (req: Request, res: Response) => {
  const campaign = await Campaign.findById(req.params.id);

  if (!campaign || campaign.status === 'DELETED') {
    throw createError('Campaign not found', 404);
  }

  campaign.status = 'DELETED';
  await campaign.save();

  res.status(200).json({
    success: true,
    message: 'Campaign deleted successfully'
  });
}); 