import { Response } from 'express';
import {
  PROPERTY_TYPE_CATEGORIES,
  PROPERTY_TYPE_HOME_CATEGORIES,
  PROPERTY_TYPE_PLOT_CATEGORIES,
  PROPERTY_TYPE_COMMERCIAL_CATEGORIES,
} from '@/constants';

export const isInvalidNumber = (value: string): boolean => {
  const num = Number(value);
  return isNaN(num) || num < 0 || !isFinite(num);
};

export const PROPERTY_CATEGORY_MAP: { [key in PROPERTY_TYPE_CATEGORIES]: string } = {
  [PROPERTY_TYPE_CATEGORIES.HOME]: PROPERTY_TYPE_HOME_CATEGORIES.join(','),
  [PROPERTY_TYPE_CATEGORIES.PLOT]: PROPERTY_TYPE_PLOT_CATEGORIES.join(','),
  [PROPERTY_TYPE_CATEGORIES.COMMERCIAL]: PROPERTY_TYPE_COMMERCIAL_CATEGORIES.join(','),
};

export const returnBadRequestError = ({ res, message }: { res: Response; message: string }) => res.status(400).json({ message });
