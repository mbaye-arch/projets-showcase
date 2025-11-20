import multer from 'multer';

const MYSQL_CONNECTION_ERRORS = new Set([
  'ECONNREFUSED',
  'PROTOCOL_CONNECTION_LOST',
  'ETIMEDOUT',
  'ENOTFOUND'
]);

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`
    });
  }

  if (MYSQL_CONNECTION_ERRORS.has(error.code)) {
    return res.status(503).json({
      success: false,
      message:
        "Base de données indisponible. Vérifie que MySQL est démarré puis relance le serveur backend.",
      code: error.code
    });
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
};
