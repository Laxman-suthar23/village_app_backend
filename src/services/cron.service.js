const cron = require('node-cron');
const prisma = require('../config/prisma');

/**
 * Logic:
 * - Every June 1st
 * - Find all members where:
 *   education_type = SCHOOL
 *   education_status = STUDYING
 *   academic_year < current_year
 * 
 * Then:
 * - current_standard += 1
 * - academic_year = current_year
 */
const promoteStudents = async () => {
  console.log(`[${new Date().toISOString()}] [Cron] Starting yearly class promotion...`);
  const currentYear = new Date().getFullYear();

  try {
    // Note: Prisma updateMany doesn't support increment directly in some versions
    // But since we want to avoid duplicate updates and perform it safely:
    
    const studentsToPromote = await prisma.member.findMany({
      where: {
        education_type: 'SCHOOL',
        education_status: 'STUDYING',
        academic_year: {
          lt: currentYear
        }
      }
    });

    if (studentsToPromote.length === 0) {
      console.log(`[Cron] No students found for promotion.`);
      return;
    }

    let updatedCount = 0;
    // We update individually to handle any potential custom logic or Prisma limitations
    // though updateMany with increment works in newer Prisma.
    // For simplicity and following the requirement "academic_year = current_year"
    
    for (const student of studentsToPromote) {
      await prisma.member.update({
        where: { id: student.id },
        data: {
          current_standard: (student.current_standard || 0) + 1,
          academic_year: currentYear
        }
      });
      updatedCount++;
    }

    console.log(`[Cron] Promotion completed. Updated ${updatedCount} members.`);
  } catch (error) {
    console.error('[Cron] Promotion failed:', error);
  }
};

// Run every June 1st at 00:00: '0 0 1 6 *'
const initCron = () => {
  cron.schedule('0 0 1 6 *', promoteStudents);
  console.log('[Cron] Yearly promotion job scheduled for June 1st');
};

module.exports = { initCron, promoteStudents };
