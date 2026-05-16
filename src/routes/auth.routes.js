const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { loginRules, createAdminRules, validate } = require('../middleware/validate.middleware');

// POST /auth/login
router.post('/login', loginRules, validate, authController.login);

// GET /auth/me
router.get('/me', authenticate, authController.getMe);

// POST /auth/admins  — SUPER_ADMIN only
router.post(
  '/admins',
  authenticate,
  authorize('SUPER_ADMIN'),
  createAdminRules,
  validate,
  authController.createVillageAdmin
);

module.exports = router;
