export function capitalizeFirst(str) {
  if (!str) return '';
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

export function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

export function formatDate(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr.replace(/\//g, '-'));
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

export function formatDateLong(dateStr) {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr.replace(/\//g, '-'));
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark style="background:rgba(59,130,246,0.3);color:#fff;border-radius:2px;padding:0 2px">$1</mark>');
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
