import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ success: true, message: 'Logistics routes working' });
});

export default router;
