export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  // Default error
  let status = 500;
  let message = 'Internal Server Error';
  let details = null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
    details = err.details || err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
  } else if (err.name === 'NotFoundError') {
    status = 404;
    message = 'Not Found';
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    status = 409;
    message = 'Database Constraint Error';
    details = 'The operation violates a database constraint';
  } else if (err.code === 'SQLITE_BUSY') {
    status = 503;
    message = 'Database Busy';
    details = 'The database is currently busy, please try again later';
  } else if (err.message) {
    message = err.message;
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    details = null;
  }

  const errorResponse = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  if (details) {
    errorResponse.details = details;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }

  res.status(status).json(errorResponse);
}