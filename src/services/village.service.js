const prisma = require('../config/prisma');
const { ApiError } = require('../utils/ApiError');
const { getPagination, buildMeta } = require('../utils/pagination');

const listVillages = async (query) => {
  const { page, limit, skip } = getPagination(query);
  const search = query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {};

  const [villages, total] = await Promise.all([
    prisma.village.findMany({
      where: search,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: { _count: { select: { families: true } } },
    }),
    prisma.village.count({ where: search }),
  ]);

  return { villages, meta: buildMeta(total, page, limit) };
};

const getVillage = async (id) => {
  const village = await prisma.village.findUnique({
    where: { id },
    include: { _count: { select: { families: true } } },
  });
  if (!village) throw ApiError.notFound('Village not found');
  return village;
};

const createVillage = async (data, coverImageUrl) => {
  return prisma.village.create({
    data: { ...data, cover_image: coverImageUrl || null },
  });
};

const updateVillage = async (id, data, coverImageUrl) => {
  await getVillage(id);
  return prisma.village.update({
    where: { id },
    data: {
      ...data,
      ...(coverImageUrl && { cover_image: coverImageUrl }),
    },
  });
};

const deleteVillage = async (id) => {
  await getVillage(id);
  await prisma.village.delete({ where: { id } });
};

module.exports = { listVillages, getVillage, createVillage, updateVillage, deleteVillage };
