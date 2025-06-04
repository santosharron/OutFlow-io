import { Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { generatePersonalizedMessage } from '../services/aiService';

interface LinkedInProfileData {
  name: string;
  job_title: string;
  company: string;
  location: string;
  summary: string;
}

// Generate personalized LinkedIn message
export const generateMessage = asyncHandler(async (req: Request, res: Response) => {
  const { name, job_title, company, location, summary }: LinkedInProfileData = req.body;

  // Validation
  if (!name || !job_title || !company) {
    throw createError('Name, job title, and company are required', 400);
  }

  if (name.length > 100 || job_title.length > 200 || company.length > 200) {
    throw createError('Input fields exceed maximum length', 400);
  }

  if (location && location.length > 100) {
    throw createError('Location exceeds maximum length', 400);
  }

  if (summary && summary.length > 1000) {
    throw createError('Summary exceeds maximum length', 400);
  }

  try {
    const personalizedMessage = await generatePersonalizedMessage({
      name,
      job_title,
      company,
      location,
      summary
    });

    res.status(200).json({
      success: true,
      data: {
        message: personalizedMessage,
        profile: {
          name,
          job_title,
          company,
          location,
          summary
        }
      }
    });
  } catch (error: any) {
    console.error('AI Message Generation Error:', error);
    throw createError('Failed to generate personalized message. Please try again.', 500);
  }
});

// Generate multiple messages with variations
export const generateMessageVariations = asyncHandler(async (req: Request, res: Response) => {
  const { name, job_title, company, location, summary }: LinkedInProfileData = req.body;
  const { count = 3 } = req.query;

  if (!name || !job_title || !company) {
    throw createError('Name, job title, and company are required', 400);
  }

  const variationCount = Math.min(parseInt(count as string) || 3, 5);
  
  try {
    const messages = [];
    
    for (let i = 0; i < variationCount; i++) {
      const message = await generatePersonalizedMessage({
        name,
        job_title,
        company,
        location,
        summary
      });
      messages.push(message);
    }

    res.status(200).json({
      success: true,
      data: {
        messages,
        count: messages.length,
        profile: {
          name,
          job_title,
          company,
          location,
          summary
        }
      }
    });
  } catch (error: any) {
    console.error('AI Message Generation Error:', error);
    throw createError('Failed to generate personalized messages. Please try again.', 500);
  }
}); 