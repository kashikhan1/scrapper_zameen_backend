import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { PropertyController } from '@/controllers/property.controller';
import { validateCityParam, validateSearchQueryParamMiddleware, validateSearchFiltersMiddleware } from '@/middlewares/validation.middleware';
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
    this.router.get(`${this.path}/available-cities`, this.property.getAvailableCities);
    this.router.get(
      `${this.path}/search`,
      validateSearchQueryParamMiddleware,
      validatePaginationParamsMiddleware,
      validateSortParamsMiddleware,
      validateSearchFiltersMiddleware,
      this.property.searchProperties,
    );
    this.router.get(`${this.path}/:id(\\d+)`, this.property.getPropertyById);
    this.router.get(`${this.path}/count/:city`, validateCityParam, this.property.getPropertyCount);
    this.router.get(
      `${this.path}/search/:city`,
      validateSearchQueryParamMiddleware,
      validatePaginationParamsMiddleware,
      validateSortParamsMiddleware,
      validateCityParam,
      validateSearchFiltersMiddleware,
      this.property.searchProperties,
    );
    this.router.get(
      `${this.path}/:city`,
      validatePaginationParamsMiddleware,
      validateSortParamsMiddleware,
      validateCityParam,
      this.property.getProperties,
    );
  }
}
