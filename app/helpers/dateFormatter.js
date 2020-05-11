export const formatDate = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
  const mo = new Intl.DateTimeFormat('en', { month: 'long' }).format(d);
  const da = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(d);
  return `${da} ${mo} ${ye}`;
};
