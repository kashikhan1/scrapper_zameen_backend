import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { HttpException } from '@exceptions/HttpException';
import { AVAILABLE_CITIES } from '@/types';
import { getPropertyPurpose, getPropertyTypes } from '@/utils/helpers';
import { isInvalidNumber, PROPERTY_CATEGORY_MAP, returnBadRequestError } from '@/utils/validation.helpers';
import { PropertyPurposeType, PropertyType } from '@/models/models';
import { IvalidateSearchFiltersMiddlewareQueryParams } from '@/types/middleware.interfaces';

/**
 * @name ValidationMiddleware
 * @description Allows use of decorator and non-decorator based validation
 * @param type dto
 * @param skipMissingProperties When skipping missing properties
 * @param whitelist Even if your object is an instance of a validation class it can contain additional properties that are not defined
 * @param forbidNonWhitelisted If you would rather to have an error thrown when any non-whitelisted properties are present
 */
export const ValidationMiddleware = (type: any, skipMissingProperties = false, whitelist = true, forbidNonWhitelisted = true) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToInstance(type, req.body);
    validateOrReject(dto, { skipMissingProperties, whitelist, forbidNonWhitelisted })
      .then(() => {
        req.body = dto;
        next();
      })
      .catch((errors: ValidationError[]) => {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
        next(new HttpException(400, message));
      });
  };
};

// Middleware to validate req.params.city
export const validateCityParam = (req: Request, res: Response, next: NextFunction) => {
  const { city } = req.params;

  if (city == null || Object.values(AVAILABLE_CITIES).includes(city as AVAILABLE_CITIES)) {
    next();
  } else {
    returnBadRequestError({ res, message: `Invalid city parameter. It must be one of following: ${Object.values(AVAILABLE_CITIES).join(', ')}` });
  }
};

export const validateSearchQueryParamMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.query.location_ids = req.query.location_ids || '';
  const { location_ids } = req.query as { location_ids: string };
  const ids = location_ids.split(',').map(id => id.trim());

  if (ids.some(isInvalidNumber)) {
    return returnBadRequestError({ res, message: 'Invalid location_ids search parameter. It must be a string of numbers separated by comma.' });
  }
  next();
};

export const validateSearchFiltersMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const defaultQueryParams = {
    property_type: '',
    area_min: '0',
    area_max: '',
    price_min: '1',
    price_max: '',
    bedrooms: '',
    start_date: '',
    end_date: '',
  };
  Object.keys(defaultQueryParams).forEach(param => {
    if (req.query[param] == null) {
      req.query[param] = defaultQueryParams[param];
    }
  });
  req.query.property_type = PROPERTY_CATEGORY_MAP[req.query.property_type as string] || req.query.property_type;
  if (['all', 'studio'].includes(req.query.bedrooms.toString().toLowerCase())) {
    req.query.bedrooms = '';
  }

  const { property_type, area_min, area_max, price_min, price_max, bedrooms, start_date, end_date } =
    req.query as unknown as IvalidateSearchFiltersMiddlewareQueryParams;

  switch (true) {
    case isInvalidNumber(price_min):
    case price_max && isInvalidNumber(price_max):
      return returnBadRequestError({ res, message: 'Invalid price parameters. Both price_min and price_max must be valid numbers.' });
    case bedrooms && bedrooms.split(',').some(isInvalidNumber):
      return returnBadRequestError({ res, message: 'Invalid bedrooms parameter. It must be a valid number.' });
    case isInvalidNumber(area_min):
    case area_max && isInvalidNumber(area_max):
      return returnBadRequestError({ res, message: 'Invalid area parameters. Both area_min and area_max must be valid numbers (in square feet).' });
    case start_date && isNaN(Date.parse(start_date)):
      return returnBadRequestError({ res, message: 'Invalid start_date parameter. It must be a valid date in iso string format.' });
    case end_date && isNaN(Date.parse(end_date)):
      return returnBadRequestError({ res, message: 'Invalid end_date parameter. It must be a valid date in iso string format.' });
    case property_type != '': {
      const PROPERTY_TYPES = await getPropertyTypes();
      const propertyTypesArray = property_type.split(',').map(type => type.trim());
      const invalidTypes = propertyTypesArray.filter(type => !PROPERTY_TYPES.includes(type as PropertyType));
      if (invalidTypes.length > 0)
        return returnBadRequestError({
          res,
          message: `Invalid property_type parameter. Following values are invalid: ${invalidTypes.join(
            ', ',
          )}. Valid values are: ${PROPERTY_TYPES.join(', ')}`,
        });
    }
  }
  next();
};

export const validatePropertyId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query as { id: string };
  if (isNaN(Number(id))) {
    return returnBadRequestError({ res, message: 'Invalid property id parameter. It must be a valid number.' });
  }
  next();
};

export const validatePurposeFilter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.query.purpose = req.query.purpose || 'for_sale';
    const { purpose } = req.query as { purpose: PropertyPurposeType };
    const dbPurpose = await getPropertyPurpose();
    if (!dbPurpose.includes(purpose)) {
      return returnBadRequestError({ res, message: `Invalid purpose parameter. It must be one of following: ${dbPurpose.join(',')}.` });
    }
    next();
  } catch (err) {
    next(err);
  }
};
