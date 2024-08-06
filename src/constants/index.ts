import { PropertyType } from '@/models/models';

export enum PROPERTY_TYPE_CATEGORIES {
  HOME = 'home',
  PLOT = 'plot',
  COMMERCIAL = 'commercial',
}

export const PROPERTY_TYPE_PLOT_CATEGORIES: PropertyType[] = [
  'plot_file',
  'plot_form',
  'industrial_land',
  'commercial_plot',
  'residential_plot',
  'agricultural_land',
];
export const PROPERTY_TYPE_COMMERCIAL_CATEGORIES: PropertyType[] = ['shop', 'office', 'warehouse', 'factory', 'building', 'other'];
export const PROPERTY_TYPE_HOME_CATEGORIES: PropertyType[] = ['house', 'upper_portion', 'lower_portion', 'flat', 'room', 'farm_house', 'penthouse'];
