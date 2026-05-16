const memberService = require('../services/member.service');
const { successResponse } = require('../utils/response');

const createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body, req.user);
    successResponse(res, { statusCode: 201, message: 'Member added', data: member });
  } catch (err) {
    next(err);
  }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await memberService.updateMember(req.params.id, req.body, req.user);
    successResponse(res, { message: 'Member updated', data: member });
  } catch (err) {
    next(err);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    await memberService.deleteMember(req.params.id, req.user);
    successResponse(res, { message: 'Member deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createMember, updateMember, deleteMember };
