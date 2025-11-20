import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation invalide',
      errors: err.flatten()
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Conflit: valeur déjà utilisée',
      meta: err.meta
    });
  }

  const status = err.status || 500;

  return res.status(status).json({
    success: false,
    message: err.message || 'Erreur interne du serveur',
    details: err.details || null
  });
}
