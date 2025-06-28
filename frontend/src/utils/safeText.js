export function safeText(value) {
  if (typeof value === 'string' || typeof value === 'number') {
    return value;
  } else if (value === null || value === undefined) {
    return '-';
  } else {
    // Log if a React element or object is being passed
    if (typeof value === 'object' && value !== null && value.$$typeof) {
      console.error('React element passed to safeText:', value);
      return '[React element]';
    }
    try {
      return JSON.stringify(value);
    } catch {
      return 'Invalid value';
    }
  }
} 