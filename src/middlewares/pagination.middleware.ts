import { SORT_COLUMNS, SORT_ORDER } from '@/types';
import { Request, Response, NextFunction } from 'express';

// Middleware to validate page_size and page_number
export const validatePaginationParamsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.page_size == null) {
    req.query.page_size = '10';
  }
  if (req.query.page_number == null) {
    req.query.page_number = '1';
  }
  const { page_size, page_number } = req.query;
  if (
    page_size !== undefined &&
    page_number !== undefined &&
    !isNaN(Number(page_size)) &&
    !isNaN(Number(page_number)) &&
    Number(page_number) >= 0 &&
    Number(page_size) >= 0
  ) {
    next();
  } else {
    res.status(400).json({ message: 'Invalid pagination parameters. Both page_size and page_number must be valid numbers.' });
  }
};

export const validateSortParamsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.sort_by == null) {
    req.query.sort_by = SORT_COLUMNS.ID;
  }
  if (req.query.sort_order == null) {
    req.query.sort_order = SORT_ORDER.ASC;
  }
  const { sort_by, sort_order } = req.query;
  if (
    sort_by !== undefined &&
    sort_order !== undefined &&
    Object.values(SORT_COLUMNS).includes(sort_by as SORT_COLUMNS) &&
    Object.values(SORT_ORDER).includes(sort_order as SORT_ORDER)
  ) {
    next();
  } else {
    res.status(400).json({
      message:
        'Invalid sort parameters. sort_by must be one of the following: ' +
        Object.values(SORT_COLUMNS).join(', ') +
        ' and sort_order must be one of the following: ' +
        Object.values(SORT_ORDER).join(', '),
    });
  }
};
