const router = require('express').Router();
const villageController = require('../controllers/village.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { villageRules, uuidParam, validate } = require('../middleware/validate.middleware');
const { upload } = require('../config/cloudinary');

// All village routes require authentication
router.use(authenticate);

// GET /villages  — all authenticated users
router.get('/', villageController.listVillages);

// GET /villages/:id
router.get('/:id', uuidParam('id'), validate, villageController.getVillage);

// POST /villages  — SUPER_ADMIN only
router.post(
  '/',
  authorize('SUPER_ADMIN'),
  upload.single('cover_image'),
  villageRules,
  validate,
  villageController.createVillage
);

// PUT /villages/:id  — SUPER_ADMIN only
router.put(
  '/:id',
  authorize('SUPER_ADMIN'),
  uuidParam('id'),
  upload.single('cover_image'),
  validate,
  villageController.updateVillage
);

// DELETE /villages/:id  — SUPER_ADMIN only
router.delete(
  '/:id',
  authorize('SUPER_ADMIN'),
  uuidParam('id'),
  validate,
  villageController.deleteVillage
);

module.exports = router;
