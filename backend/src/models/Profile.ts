import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  fullName: string;
  headline: string;
  currentJobTitle?: string;
  companyName?: string;
  location?: string;
  profileUrl: string;
  about: string;
  profilePhoto: string;
  scraped: boolean;
  scrapedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    headline: {
      type: String,
      default: '',
      trim: true
    },
    currentJobTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters']
    },
    companyName: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters']
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters']
    },
    profileUrl: {
      type: String,
      required: [true, 'Profile URL is required'],
      unique: true,
      validate: {
        validator: function(url: string) {
          return /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/.test(url);
        },
        message: 'Please provide a valid LinkedIn profile URL'
      }
    },
    about: {
      type: String,
      default: '',
      trim: true
    },
    profilePhoto: {
      type: String,
      default: '',
      trim: true
    },
    scraped: {
      type: Boolean,
      default: true
    },
    scrapedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Indexes for efficient queries
profileSchema.index({ profileUrl: 1 });
profileSchema.index({ companyName: 1 });
profileSchema.index({ location: 1 });
profileSchema.index({ scraped: 1 });
profileSchema.index({ scrapedAt: -1 });

// Static method to find profiles by company
profileSchema.statics.findByCompany = function(companyName: string) {
  return this.find({ 
    companyName: { $regex: companyName, $options: 'i' } 
  });
};

// Static method to find profiles by location
profileSchema.statics.findByLocation = function(location: string) {
  return this.find({ 
    location: { $regex: location, $options: 'i' } 
  });
};

export const Profile = mongoose.model<IProfile>('Profile', profileSchema); 