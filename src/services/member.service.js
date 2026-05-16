const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { calculateAge } = require('../utils/age');
const { formatEducation } = require('../utils/education');

const formatMember = (member) => {
  if (!member) return null;
  return {
    ...member,
    age: calculateAge(member.date_of_birth),
    education_display: formatEducation(member),
  };
};

const getMemberWithAccess = async (id, user) => {
  const member = await prisma.member.findUnique({
    where: { id },
    include: { family: { select: { village_id: true } } },
  });
  if (!member) throw ApiError.notFound('Member not found');

  if (user.role === 'VILLAGE_ADMIN' && member.family.village_id !== user.village_id) {
    throw ApiError.forbidden('Access denied');
  }

  return formatMember(member);
};

const createMember = async (data, user) => {
  const family = await prisma.family.findUnique({ where: { id: data.family_id } });
  if (!family) throw ApiError.notFound('Family not found');

  if (user.role === 'VILLAGE_ADMIN' && family.village_id !== user.village_id) {
    throw ApiError.forbidden('Access denied');
  }

  // Ensure date_of_birth is a Date object
  if (data.date_of_birth) {
    data.date_of_birth = new Date(data.date_of_birth);
  }

  const member = await prisma.member.create({ data });
  return formatMember(member);
};

const updateMember = async (id, data, user) => {
  await getMemberWithAccess(id, user);
  
  if (data.date_of_birth) {
    data.date_of_birth = new Date(data.date_of_birth);
  }

  const member = await prisma.member.update({ where: { id }, data });
  return formatMember(member);
};

const deleteMember = async (id, user) => {
  await getMemberWithAccess(id, user);
  await prisma.member.delete({ where: { id } });
};

module.exports = { createMember, updateMember, deleteMember, formatMember };
