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

export interface IProperty {
  id: number;
  desc: string;
  header: string;
  type: string;
  price: number;
  location: string;
  bath: string;
  area: string;
  purpose: string;
  bedroom: string;
  added: number;
  initial_amount: string;
  monthly_installment: string;
  remaining_installments: string;
  url: string;
  created_at: string;
  updated_at: string;
  cover_photo_url: string;
  available: boolean;
  features: IFeature[];
}

export interface IFeature {
  category: string;
  features: string[];
}
