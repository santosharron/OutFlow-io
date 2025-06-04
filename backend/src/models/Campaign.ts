import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  leads: string[];
  accountIDs: string[];
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      maxlength: [100, 'Campaign name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required'],
      trim: true,
      maxlength: [500, 'Campaign description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['ACTIVE', 'INACTIVE', 'DELETED'],
        message: 'Status must be either ACTIVE, INACTIVE, or DELETED'
      },
      default: 'ACTIVE'
    },
    leads: [{
      type: String,
      validate: {
        validator: function(url: string) {
          // Basic LinkedIn URL validation
          return /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/.test(url);
        },
        message: 'Please provide a valid LinkedIn profile URL'
      }
    }],
    accountIDs: [{
      type: String,
      required: true,
      validate: {
        validator: function(id: string) {
          // Basic ObjectId validation
          return mongoose.Types.ObjectId.isValid(id);
        },
        message: 'Please provide a valid account ID'
      }
    }]
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

// Index for efficient queries
campaignSchema.index({ status: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ name: 1 });

// Pre-save middleware to ensure status validation
campaignSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    const allowedStatuses = ['ACTIVE', 'INACTIVE', 'DELETED'];
    if (!allowedStatuses.includes(this.status)) {
      return next(new Error('Invalid status value'));
    }
  }
  next();
});

// Instance method to check if campaign is active
campaignSchema.methods.isActive = function(): boolean {
  return this.status === 'ACTIVE';
};

// Instance method to check if campaign is deleted
campaignSchema.methods.isDeleted = function(): boolean {
  return this.status === 'DELETED';
};

// Static method to find non-deleted campaigns
campaignSchema.statics.findNonDeleted = function() {
  return this.find({ status: { $ne: 'DELETED' } });
};

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema); 