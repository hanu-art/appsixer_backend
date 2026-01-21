import express from 'express';

import { getJobs , getJobById , getJobsCount } from '../controllers/jobDiva.controller.js';
const router = express.Router();

router.get('/jobdiva/jobs', getJobs);
router.get('/jobdiva/jobs/count', getJobsCount);
router.get('/jobdiva/jobs/:id', getJobById);

export default router;