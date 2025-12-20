export function formatDateRange(dateStart: string, dateEnd: string) {
  const startDate = new Date(dateStart);
  const endDate = new Date(dateEnd);
  
  const formatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    calendar: 'buddhist' // แปลงเป็น พ.ศ.
  });
  
  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

export default formatDateRange;