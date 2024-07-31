import { PROPERTY_TYPE_CATEGORIES } from '@/constants';

export const isInvalidNumber = (value: string): boolean => isNaN(Number(value)) || Number(value) < 0;

export const PROPERTY_CATEGORY_MAP: { [key in PROPERTY_TYPE_CATEGORIES]: string } = {
  [PROPERTY_TYPE_CATEGORIES.HOME]: ['house', 'upper_portion', 'lower_portion', 'flat', 'room', 'farm_house', 'penthouse'].join(','),
  [PROPERTY_TYPE_CATEGORIES.PLOT]: ['residential_plot', 'commercial_plot', 'industrial_land', 'agricultural_land', 'plot_file', 'plot_form'].join(
    ',',
  ),
  [PROPERTY_TYPE_CATEGORIES.COMMERCIAL]: ['shop', 'office', 'warehouse', 'factory', 'building', 'other'].join(','),
};
