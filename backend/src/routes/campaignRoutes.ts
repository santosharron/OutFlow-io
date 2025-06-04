import { Router } from 'express';
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign
} from '../controllers/campaignController';

const router = Router();

// Campaign CRUD routes
router.route('/')
  .get(getCampaigns)      // GET /api/campaigns
  .post(createCampaign);  // POST /api/campaigns

router.route('/:id')
  .get(getCampaign)       // GET /api/campaigns/:id
  .put(updateCampaign)    // PUT /api/campaigns/:id
  .delete(deleteCampaign); // DELETE /api/campaigns/:id

export default router; 