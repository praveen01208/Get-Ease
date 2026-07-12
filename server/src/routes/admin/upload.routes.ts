import { Router } from 'express';
import multer from 'multer';
import { uploadVideo, getVideoStatus, uploadFile, getUploadJobs } from '../../controllers/admin.upload.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 * 1024 } }); // 5GB

router.post('/video', upload.single('video'), uploadVideo);
router.get('/video/:videoId/status', getVideoStatus);
router.post('/file', upload.single('file'), uploadFile);
router.get('/jobs', getUploadJobs);

export default router;
