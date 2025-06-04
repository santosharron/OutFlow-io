import { Router } from 'express';
import {
  getProfiles,
  getProfile,
  searchProfiles,
  scrapeProfiles,
  deleteProfile,
  getProfileStats
} from '../controllers/profileController';

const router = Router();

// Profile routes
router.route('/')
  .get(getProfiles);

router.route('/search')
  .get(searchProfiles);

router.route('/scrape')
  .post(scrapeProfiles);

router.route('/stats')
  .get(getProfileStats);

router.route('/:id')
  .get(getProfile)
  .delete(deleteProfile);

export default router; 