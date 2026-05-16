const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');

const getMemberWithAccess = async (id, user) => {
  const member = await prisma.member.findUnique({
    where: { id },
    include: { family: { select: { village_id: true } } },
  });
  if (!member) throw ApiError.notFound('Member not found');

  if (user.role === 'VILLAGE_ADMIN' && member.family.village_id !== user.village_id) {
    throw ApiError.forbidden('Access denied');
  }

  return member;
};

const createMember = async (data, user) => {
  const family = await prisma.family.findUnique({ where: { id: data.family_id } });
  if (!family) throw ApiError.notFound('Family not found');

  if (user.role === 'VILLAGE_ADMIN' && family.village_id !== user.village_id) {
    throw ApiError.forbidden('Access denied');
  }

  return prisma.member.create({ data });
};

const updateMember = async (id, data, user) => {
  await getMemberWithAccess(id, user);
  return prisma.member.update({ where: { id }, data });
};

const deleteMember = async (id, user) => {
  await getMemberWithAccess(id, user);
  await prisma.member.delete({ where: { id } });
};

module.exports = { createMember, updateMember, deleteMember };
