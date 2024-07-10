import { z } from 'zod';
import { type FeatureSchema, type PropertySchema } from '@/models/property.schema';

export enum SORT_ORDER {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum SORT_COLUMNS {
  PRICE = 'price',
  ID = 'id',
}

export enum AVAILABLE_CITIES {
  ISLAMABAD = 'islamabad',
  RAWALPINDI = 'rawalpindi',
  LAHORE = 'lahore',
  KARACHI = 'karachi',
}

export type IProperty = z.infer<typeof PropertySchema>;
export type IFeature = z.infer<typeof FeatureSchema>;

export interface ISearchPropertiesProps {
  city?: string;
  search?: string;
  page_number: number;
  page_size?: number;
  sort_by?: SORT_COLUMNS;
  sort_order?: SORT_ORDER;
  property_type?: string;
  area_min?: string;
  area_max?: string;
  price_min?: string;
  price_max?: string;
  bedrooms?: string;
  start_date?: string;
  end_date?: string;
  purpose?: string;
}

export interface IGetPropertiesCountMapProps {
  city?: string;
  search?: string;
  area_min?: string;
  area_max?: string;
  price_min?: string;
  price_max?: string;
  bedrooms?: string;
  start_date?: string;
  end_date?: string;
  purpose?: string;
}

export interface IConstructBaseQueryProps {
  city?: string;
  search?: string;
  property_types?: string[];
  bedrooms?: string;
  price_min?: string;
  price_max?: string;
  area_min?: string;
  area_max?: string;
  start_date?: string;
  end_date?: string;
  purpose?: string;
}

export interface IFindAllPropertiesProps {
  city?: string;
  page_number: number;
  page_size?: number;
  sort_by?: SORT_COLUMNS;
  sort_order?: SORT_ORDER;
  purpose?: string;
}
// export interface IProperty {
//   id: number;
//   desc: string;
//   header: string;
//   type: string;
//   price: number;
//   location: string;
//   bath: string;
//   area: string;
//   purpose: string;
//   bedroom: string;
//   added: number;
//   initial_amount: string;
//   monthly_installment: string;
//   remaining_installments: string;
//   url: string;
//   created_at: string;
//   updated_at: string;
//   cover_photo_url: string;
//   available: boolean;
//   features: IFeature[];
// }

// export interface IFeature {
//   category: string;
//   features: string[];
// }
