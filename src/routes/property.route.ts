import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { PropertyController } from '@/controllers/property.controller';
import { validatePaginationParams } from '@/middlewares/pagination.middleware';

export class PropertyRoute implements Routes {
  public path = '/property';
  public router: Router = Router();
  public property = new PropertyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, validatePaginationParams, this.property.getProperties);
    this.router.get(`${this.path}/:id(\\d+)`, this.property.getPropertyById);
  }
}
