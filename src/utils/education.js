/**
 * Returns a readable education display string
 * @param {Object} member 
 * @returns {string}
 */
const formatEducation = (member) => {
  const { education_type, education_status, current_standard, degree } = member;

  if (education_type === 'SCHOOL') {
    return `Class ${current_standard || ''}`.trim();
  }
  
  if (education_type === 'COLLEGE' || education_type === 'GRADUATED') {
    const deg = degree || '';
    if (education_status === 'COMPLETED') {
      return `${deg} Graduate`.trim();
    }
    return deg || (education_type === 'COLLEGE' ? 'College' : 'Graduate');
  }
  
  if (education_type === 'WORKING') return 'Working';
  if (education_type === 'BUSINESS') return 'Business';
  
  return 'Other';
};

module.exports = { formatEducation };
