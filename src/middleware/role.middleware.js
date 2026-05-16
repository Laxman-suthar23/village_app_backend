const { ApiError } = require('../utils/ApiError');

/**
 * Restrict access to specific roles.
 * Usage: authorize('SUPER_ADMIN') or authorize('SUPER_ADMIN', 'VILLAGE_ADMIN')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
};

/**
 * Ensure a VILLAGE_ADMIN can only access their own village.
 * Reads villageId from: req.params.villageId, req.body.village_id, req.query.village_id
 */
const restrictToOwnVillage = (req, res, next) => {
  if (req.user.role === 'SUPER_ADMIN') return next();

  const requestedVillageId =
    req.params.villageId || req.body.village_id || req.query.village_id;

  if (requestedVillageId && requestedVillageId !== req.user.village_id) {
    return next(ApiError.forbidden('You can only access data for your own village'));
  }

  // Inject the admin's village_id for list queries
  if (!requestedVillageId) {
    req.query.village_id = req.user.village_id;
    req.body.village_id = req.user.village_id;
  }

  next();
};

module.exports = { authorize, restrictToOwnVillage };
