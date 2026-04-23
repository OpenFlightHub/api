import express from 'express';

const router = express.Router()

import performanceRoute from './performance'
router.use('/performance', performanceRoute)

export default router
