import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import { PropertyService } from '@/services/property.service';
import { SORT_COLUMNS, SORT_ORDER } from '@/types';

export class PropertyController {
  public property = Container.get(PropertyService);

  public getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page_size, page_number, sort_by, sort_order } = req.query as {
        page_size: string;
        page_number: string;
        sort_by: SORT_COLUMNS;
        sort_order: SORT_ORDER;
      };
      const city = req.params.city;
      const findAllPropertiesData = await this.property.findAllProperties({
        city,
        page_number: Number(page_number),
        page_size: Number(page_size),
        sort_by,
        sort_order,
      });
      res.status(200).json({ data: findAllPropertiesData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };
  public getPropertyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyId = Number(req.params.id);
      const property = await this.property.findPropertyById(propertyId);
      res.status(200).json({ data: property, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };
  public getPropertyCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const propertyCount = await this.property.getPropertyCount({ city: req.params.city });
      res.status(200).json({ data: propertyCount, message: 'count' });
    } catch (error) {
      next(error);
    }
  };
  public getAvailableCities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cities = await this.property.availableCitiesData();
      res.status(200).json({ data: cities, message: 'available-cities' });
    } catch (error) {
      next(error);
    }
  };
}
