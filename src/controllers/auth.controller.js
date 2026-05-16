const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    successResponse(res, { message: 'Login successful', data: result });
  } catch (err) {
    next(err);
  }
};

const createVillageAdmin = async (req, res, next) => {
  try {
    const user = await authService.createVillageAdmin(req.body);
    successResponse(res, { statusCode: 201, message: 'Village admin created', data: user });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const { password, ...safeUser } = req.user;
    successResponse(res, { data: safeUser });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, createVillageAdmin, getMe };
