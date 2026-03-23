
/**
 * FMJAM Utility Functions
 */

/**
 * Generates a unique ID using crypto.randomUUID if available, 
 * falling back to a random string.
 */
export function generateId(prefix: string = ''): string {
  let id: string;
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      id = Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
    }
  } catch (e) {
    id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  }
  
  return prefix ? `${prefix}-${id}` : id;
}

/**
 * Formats a date to Swedish locale.
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Truncates text to a specified length.
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
