import { PropertyType } from '@/models/models';

export interface IvalidateSearchFiltersMiddlewareQueryParams {
  property_type: string;
  area_min: string;
  area_max: string;
  price_min: string;
  price_max: string;
  bedrooms: string;
  start_date: string;
  end_date: string;
}

export interface IvalidatePaginationParamsMiddlewareQueryParams {
  page_size: string;
  page_number: string;
}

export interface IvalidatePropertyTypeFilterQueryParams {
  property_type: PropertyType;
}

export interface IvalidateAreaFilterQueryParams {
  area_min: string;
  area_max: string;
}
