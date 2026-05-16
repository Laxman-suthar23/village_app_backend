const router = require('express').Router();
const memberController = require('../controllers/member.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { memberRules, memberUpdateRules, uuidParam, validate } = require('../middleware/validate.middleware');

router.use(authenticate);

// POST /members
router.post('/', memberRules, validate, memberController.createMember);

// PUT /members/:id
router.put('/:id', uuidParam('id'), memberUpdateRules, validate, memberController.updateMember);

// DELETE /members/:id
router.delete('/:id', uuidParam('id'), validate, memberController.deleteMember);

module.exports = router;
