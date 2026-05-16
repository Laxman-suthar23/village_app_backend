const familyService = require('../services/family.service');
const { successResponse } = require('../utils/response');

const listFamilies = async (req, res, next) => {
  try {
    const result = await familyService.listFamilies(req.query, req.user);
    successResponse(res, { data: result.families, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

const searchFamilies = async (req, res, next) => {
  try {
    const result = await familyService.searchFamilies(req.query, req.user);
    successResponse(res, { data: result.families, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

const getFamily = async (req, res, next) => {
  try {
    const family = await familyService.getFamily(req.params.id, req.user);
    successResponse(res, { data: family });
  } catch (err) {
    next(err);
  }
};

const createFamily = async (req, res, next) => {
  try {
    const photoUrl = req.file?.path || null;
    const family = await familyService.createFamily(req.body, photoUrl, req.user.id);
    successResponse(res, { statusCode: 201, message: 'Family created', data: family });
  } catch (err) {
    next(err);
  }
};

const updateFamily = async (req, res, next) => {
  try {
    const photoUrl = req.file?.path || null;
    const family = await familyService.updateFamily(req.params.id, req.body, photoUrl, req.user);
    successResponse(res, { message: 'Family updated', data: family });
  } catch (err) {
    next(err);
  }
};

const deleteFamily = async (req, res, next) => {
  try {
    await familyService.deleteFamily(req.params.id, req.user);
    successResponse(res, { message: 'Family deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listFamilies, searchFamilies, getFamily, createFamily, updateFamily, deleteFamily };
