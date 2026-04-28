/**
 * Convert ISO date string (YYYY-MM-DD) to Indian display format (DD/MM/YYYY)
 */
export const formatDateDDMMYYYY = (isoDate) => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export const todayISO = () => new Date().toISOString().split('T')[0];
