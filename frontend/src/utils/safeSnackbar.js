export function safeEnqueueSnackbar(enqueueSnackbar, message, options) {
  if (typeof message !== 'string') {
    // Log the type and value for debugging
    console.error('Non-string message passed to safeEnqueueSnackbar:', message, typeof message);
  }
  let msg = message;
  if (typeof msg !== 'string') {
    try {
      msg = JSON.stringify(msg);
    } catch {
      msg = 'Unknown error';
    }
  }
  enqueueSnackbar(msg, options);
} 