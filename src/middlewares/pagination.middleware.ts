import { Request, Response, NextFunction } from 'express';

// Middleware to validate page_size and page_number
export const validatePaginationParams = (req: Request, res: Response, next: NextFunction) => {
  if (req.query.page_size == null) {
    req.query.page_size = '10';
  }
  if (req.query.page_number == null) {
    req.query.page_number = '1';
  }
  const { page_size, page_number } = req.query;
  if (page_size !== undefined && page_number !== undefined && !isNaN(Number(page_size)) && !isNaN(Number(page_number))) {
    next();
  } else {
    res.status(400).json({ message: 'Invalid pagination parameters. Both page_size and page_number must be valid numbers.' });
  }
};
