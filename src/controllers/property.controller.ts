import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import { PropertyService } from '@/services/property.service';

export class PropertyController {
  public property = Container.get(PropertyService);

  public getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page_size, page_number } = req.query as { page_size: string; page_number: string };
      const findAllPropertiesData = await this.property.findAllProperties(Number(page_size), Number(page_number));
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
}
