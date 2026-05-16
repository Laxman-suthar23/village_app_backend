const { body, param, query, validationResult } = require('express-validator');
const { ApiError } = require('../utils/ApiError');

// Collect and format validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(ApiError.badRequest('Validation failed', formatted));
  }
  next();
};

// ─── Auth ────────────────────────────────────────────────────────────────────
const loginRules = [
  body('mobile').trim().notEmpty().withMessage('Mobile is required')
    .isMobilePhone().withMessage('Invalid mobile number'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Village ─────────────────────────────────────────────────────────────────
const villageRules = [
  body('name').trim().notEmpty().withMessage('Village name is required')
    .isLength({ max: 100 }).withMessage('Name too long (max 100 chars)'),
  body('description').optional().trim().isLength({ max: 500 })
    .withMessage('Description too long (max 500 chars)'),
];

// ─── Family ──────────────────────────────────────────────────────────────────
const familyRules = [
  body('head_name').trim().notEmpty().withMessage('Family head name is required')
    .isLength({ max: 100 }).withMessage('Head name too long'),
  body('father_name').optional().trim().isLength({ max: 100 }),
  body('mobile').optional().isMobilePhone().withMessage('Invalid mobile number'),
  body('gotra').optional().trim().isLength({ max: 50 }),
  body('address').optional().trim().isLength({ max: 300 }),
  body('village_id').trim().notEmpty().withMessage('Village ID is required')
    .isUUID().withMessage('Invalid village ID'),
];

const familyUpdateRules = [
  body('head_name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('father_name').optional().trim().isLength({ max: 100 }),
  body('mobile').optional().isMobilePhone().withMessage('Invalid mobile number'),
  body('gotra').optional().trim().isLength({ max: 50 }),
  body('address').optional().trim().isLength({ max: 300 }),
];

// ─── Member ───────────────────────────────────────────────────────────────────
const memberRules = [
  body('family_id').trim().notEmpty().withMessage('Family ID is required')
    .isUUID().withMessage('Invalid family ID'),
  body('name').trim().notEmpty().withMessage('Member name is required')
    .isLength({ max: 100 }),
  body('relation').optional().trim().isLength({ max: 50 }),
  body('date_of_birth').notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format (YYYY-MM-DD)')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  body('occupation').optional().trim().isLength({ max: 100 }),
  body('education_type').optional().isIn(['SCHOOL', 'COLLEGE', 'GRADUATED', 'WORKING', 'BUSINESS', 'OTHER'])
    .withMessage('Invalid education type'),
  body('education_status').optional().isIn(['STUDYING', 'COMPLETED', 'DROPPED'])
    .withMessage('Invalid education status'),
  body('current_standard').optional().isInt({ min: 1, max: 12 })
    .custom((value, { req }) => {
      if (value && req.body.education_type !== 'SCHOOL') {
        throw new Error('Current standard is only allowed for SCHOOL type');
      }
      return true;
    }),
  body('academic_year').optional({ nullable: true }).isInt({ min: 1900, max: 2100 })
    .withMessage('Invalid academic year'),
  body('academic_year').custom((value, { req }) => {
    if (req.body.education_type === 'SCHOOL' && req.body.education_status === 'STUDYING' && !value) {
      throw new Error('Academic year is required for SCHOOL students');
    }
    return true;
  }),
  body('school_or_college_name').optional().trim().isLength({ max: 200 }),
  body('degree').optional().trim().isLength({ max: 100 })
    .custom((value, { req }) => {
      if (value && !['COLLEGE', 'GRADUATED'].includes(req.body.education_type)) {
        throw new Error('Degree is only allowed for COLLEGE or GRADUATED type');
      }
      return true;
    }),
];

const memberUpdateRules = [
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('relation').optional().trim().isLength({ max: 50 }),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  body('occupation').optional().trim().isLength({ max: 100 }),
  body('education_type').optional().isIn(['SCHOOL', 'COLLEGE', 'GRADUATED', 'WORKING', 'BUSINESS', 'OTHER']),
  body('education_status').optional().isIn(['STUDYING', 'COMPLETED', 'DROPPED']),
  body('current_standard').optional().isInt({ min: 1, max: 12 })
    .custom((value, { req }) => {
      if (value && req.body.education_type && req.body.education_type !== 'SCHOOL') {
        throw new Error('Current standard is only allowed for SCHOOL type');
      }
      return true;
    }),
  body('academic_year').optional({ nullable: true }).isInt({ min: 1900, max: 2100 })
    .withMessage('Invalid academic year'),
  body('school_or_college_name').optional().trim().isLength({ max: 200 }),
  body('degree').optional().trim().isLength({ max: 100 })
    .custom((value, { req }) => {
      if (value && req.body.education_type && !['COLLEGE', 'GRADUATED'].includes(req.body.education_type)) {
        throw new Error('Degree is only allowed for COLLEGE or GRADUATED type');
      }
      return true;
    }),
];

// ─── Village Admin Creation ───────────────────────────────────────────────────
const createAdminRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('mobile').trim().notEmpty().isMobilePhone().withMessage('Valid mobile is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('village_id').trim().notEmpty().isUUID().withMessage('Valid village ID is required'),
];

// ─── UUID param ───────────────────────────────────────────────────────────────
const uuidParam = (name) => [
  param(name).isUUID().withMessage(`Invalid ${name}`),
];

module.exports = {
  validate,
  loginRules,
  villageRules,
  familyRules,
  familyUpdateRules,
  memberRules,
  memberUpdateRules,
  createAdminRules,
  uuidParam,
};
