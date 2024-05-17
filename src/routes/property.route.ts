import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { PropertyController } from '@/controllers/property.controller';
import { validatePaginationParamsMiddleware, validateSortParamsMiddleware } from '@/middlewares/pagination.middleware';

export class PropertyRoute implements Routes {
  public path = '/property';
  public router: Router = Router();
  public property = new PropertyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, validatePaginationParamsMiddleware, validateSortParamsMiddleware, this.property.getProperties);
    this.router.get(`${this.path}/count`, this.property.getPropertyCount);
    this.router.get(`${this.path}/:id(\\d+)`, this.property.getPropertyById);
    this.router.get(`${this.path}/:city`, validatePaginationParamsMiddleware, validateSortParamsMiddleware, this.property.getProperties);
  }
}
