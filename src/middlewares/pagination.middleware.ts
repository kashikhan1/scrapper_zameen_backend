import { SORT_COLUMNS, SORT_ORDER } from '@/types';
import { isInvalidNumber } from '@/utils/helpers';
import { Request, Response, NextFunction } from 'express';

// Middleware to validate page_size and page_number
export const validatePaginationParamsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.page_size == null) {
    req.query.page_size = '10';
  }
  if (req.query.page_number == null) {
    req.query.page_number = '1';
  }
  const { page_size, page_number } = req.query as { page_size: string; page_number: string };
  if (isInvalidNumber(page_number) || isInvalidNumber(page_size)) {
    return res.status(400).json({ message: 'Invalid pagination parameters. Both page_size and page_number must be valid numbers.' });
  }
  next();
};

export const validateSortParamsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.sort_by == null) {
    req.query.sort_by = SORT_COLUMNS.ID;
  }
  if (req.query.sort_order == null) {
    req.query.sort_order = SORT_ORDER.ASC;
  }
  const { sort_by, sort_order } = req.query;
  if (!Object.values(SORT_COLUMNS).includes(sort_by as SORT_COLUMNS)) {
    return res.status(400).json({ message: 'sort_by must be one of the following: ' + Object.values(SORT_COLUMNS).join(', ') });
  }
  if (!Object.values(SORT_ORDER).includes(sort_order as SORT_ORDER)) {
    return res.status(400).json({ message: 'sort_order must be one of the following: ' + Object.values(SORT_ORDER).join(', ') });
  }

  next();
};
