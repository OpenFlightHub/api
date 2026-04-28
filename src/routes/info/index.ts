import express from 'express';

const router = express.Router()

import collisionObjectsRoute from './collision-objects'
router.use('/collision-objects', collisionObjectsRoute)

export default router
