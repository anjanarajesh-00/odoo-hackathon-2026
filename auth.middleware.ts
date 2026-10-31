import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../common/errors/AppError.js';
import { UserRole } from '../../common/types/index.js';
import { getAuthProvider } from './adapters/index.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Authentication token missing');
    }

    const provider = getAuthProvider();
    const user = await provider.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(
          `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`
        )
      );
    }

    next();
  };
};
