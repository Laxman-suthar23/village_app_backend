const villageService = require('../services/village.service');
const { successResponse } = require('../utils/response');

const listVillages = async (req, res, next) => {
  try {
    const result = await villageService.listVillages(req.query);
    successResponse(res, { data: result.villages, meta: result.meta });
  } catch (err) {
    next(err);
  }
};

const getVillage = async (req, res, next) => {
  try {
    const village = await villageService.getVillage(req.params.id);
    successResponse(res, { data: village });
  } catch (err) {
    next(err);
  }
};

const createVillage = async (req, res, next) => {
  try {
    const photoUrl = req.file?.path || null;
    const village = await villageService.createVillage(req.body, photoUrl);
    successResponse(res, { statusCode: 201, message: 'Village created', data: village });
  } catch (err) {
    next(err);
  }
};

const updateVillage = async (req, res, next) => {
  try {
    const photoUrl = req.file?.path || null;
    const village = await villageService.updateVillage(req.params.id, req.body, photoUrl);
    successResponse(res, { message: 'Village updated', data: village });
  } catch (err) {
    next(err);
  }
};

const deleteVillage = async (req, res, next) => {
  try {
    await villageService.deleteVillage(req.params.id);
    successResponse(res, { message: 'Village deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { listVillages, getVillage, createVillage, updateVillage, deleteVillage };
