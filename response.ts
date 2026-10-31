import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): void => {
  res.status(statusCode).json({ data });
};

export const sendList = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  pageSize: number,
  statusCode = 200
): void => {
  res.status(statusCode).json({
    data,
    total,
    page,
    pageSize,
  });
};
