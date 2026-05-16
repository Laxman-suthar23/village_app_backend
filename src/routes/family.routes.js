const router = require('express').Router();
const familyController = require('../controllers/family.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { restrictToOwnVillage } = require('../middleware/role.middleware');
const { familyRules, familyUpdateRules, uuidParam, validate } = require('../middleware/validate.middleware');
const { upload } = require('../config/cloudinary');

router.use(authenticate);

// GET /families/search?q=
router.get('/search', restrictToOwnVillage, familyController.searchFamilies);

// GET /families
router.get('/', restrictToOwnVillage, familyController.listFamilies);

// GET /families/:id
router.get('/:id', uuidParam('id'), validate, familyController.getFamily);

// POST /families
router.post(
  '/',
  restrictToOwnVillage,
  upload.single('photo'),
  familyRules,
  validate,
  familyController.createFamily
);

// PUT /families/:id
router.put(
  '/:id',
  uuidParam('id'),
  upload.single('photo'),
  familyUpdateRules,
  validate,
  familyController.updateFamily
);

// DELETE /families/:id
router.delete('/:id', uuidParam('id'), validate, familyController.deleteFamily);

module.exports = router;
