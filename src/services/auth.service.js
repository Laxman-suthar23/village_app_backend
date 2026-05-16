const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { signToken } = require('../utils/jwt');
const { ApiError } = require('../utils/ApiError');

const login = async ({ mobile, password }) => {
  const user = await prisma.user.findUnique({ where: { mobile } });
  if (!user) throw ApiError.unauthorized('Invalid mobile or password');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw ApiError.unauthorized('Invalid mobile or password');

  const token = signToken({ id: user.id, role: user.role, village_id: user.village_id });

  const { password: _, ...safeUser } = user;
  return { token, user: safeUser };
};

const createVillageAdmin = async ({ name, mobile, password, village_id }) => {
  const exists = await prisma.user.findUnique({ where: { mobile } });
  if (exists) throw ApiError.badRequest('Mobile already registered');

  const village = await prisma.village.findUnique({ where: { id: village_id } });
  if (!village) throw ApiError.notFound('Village not found');

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, mobile, password: hashed, role: 'VILLAGE_ADMIN', village_id },
    select: { id: true, name: true, mobile: true, role: true, village_id: true, created_at: true },
  });

  return user;
};

module.exports = { login, createVillageAdmin };
