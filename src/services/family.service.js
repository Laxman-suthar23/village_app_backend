const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { getPagination, buildMeta } = require('../utils/pagination');
const { formatMember } = require('./member.service');

const buildFamilyWhere = (query, user) => {
  const villageId = user.role === 'SUPER_ADMIN' ? query.village_id : user.village_id;
  const where = {};
  if (villageId) where.village_id = villageId;
  if (query.gotra) where.gotra = { equals: query.gotra, mode: 'insensitive' };
  return where;
};

const listFamilies = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const where = buildFamilyWhere(query, user);

  const [families, total] = await Promise.all([
    prisma.family.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        village: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
    }),
    prisma.family.count({ where }),
  ]);

  return { families, meta: buildMeta(total, page, limit) };
};

const searchFamilies = async (query, user) => {
  const { page, limit, skip } = getPagination(query);
  const q = query.q;

  if (!q) throw ApiError.badRequest('Search query is required');

  const villageId = user.role === 'SUPER_ADMIN' ? query.village_id : user.village_id;
  const where = {
    ...(villageId && { village_id: villageId }),
    OR: [
      { head_name: { contains: q, mode: 'insensitive' } },
      { father_name: { contains: q, mode: 'insensitive' } },
      { gotra: { contains: q, mode: 'insensitive' } },
      { address: { contains: q, mode: 'insensitive' } },
      { mobile: { contains: q } },
      { members: { some: { name: { contains: q, mode: 'insensitive' } } } },
    ],
  };

  const [families, total] = await Promise.all([
    prisma.family.findMany({
      where,
      skip,
      take: limit,
      include: {
        village: { select: { id: true, name: true } },
        members: true,
        _count: { select: { members: true } },
      },
    }),
    prisma.family.count({ where }),
  ]);

  const formattedFamilies = families.map(f => ({
    ...f,
    members: f.members.map(formatMember)
  }));

  return { families: formattedFamilies, meta: buildMeta(total, page, limit) };
};

const getFamily = async (id, user) => {
  const family = await prisma.family.findUnique({
    where: { id },
    include: {
      village: { select: { id: true, name: true } },
      members: true,
    },
  });
  if (!family) throw ApiError.notFound('Family not found');

  if (user.role === 'VILLAGE_ADMIN' && family.village_id !== user.village_id) {
    throw ApiError.forbidden('Access denied');
  }

  family.members = family.members.map(formatMember);
  return family;
};

const createFamily = async (data, photoUrl, userId) => {
  const village = await prisma.village.findUnique({ where: { id: data.village_id } });
  if (!village) throw ApiError.notFound('Village not found');

  return prisma.family.create({
    data: { ...data, photo: photoUrl || null, created_by: userId },
    include: { village: { select: { id: true, name: true } } },
  });
};

const updateFamily = async (id, data, photoUrl, user) => {
  await getFamily(id, user);
  const family = await prisma.family.update({
    where: { id },
    data: {
      ...data,
      ...(photoUrl && { photo: photoUrl }),
    },
    include: {
      village: { select: { id: true, name: true } },
      members: true,
    },
  });
  family.members = family.members.map(formatMember);
  return family;
};

const deleteFamily = async (id, user) => {
  await getFamily(id, user);
  await prisma.family.delete({ where: { id } });
};

module.exports = { listFamilies, searchFamilies, getFamily, createFamily, updateFamily, deleteFamily };
