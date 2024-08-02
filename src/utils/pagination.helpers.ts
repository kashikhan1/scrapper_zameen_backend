import { splitAndTrimString } from '.';
import { HttpException } from '@/exceptions/HttpException';
import { SORT_COLUMNS, SORT_ORDER, SortingOrder } from '@/types';

export const parseSortParams = (sort_by: string, sort_order: string): SortingOrder => {
  const sortByArray = splitAndTrimString(sort_by);
  const sortOrderArray = splitAndTrimString(sort_order);

  if (sortByArray.length !== sortOrderArray.length) {
    throw new HttpException(400, 'sort_by and sort_order must have the same number of elements');
  }
  if (sortByArray.length === 0 || sortOrderArray.length === 0) {
    return [[SORT_COLUMNS.ID, SORT_ORDER.ASC]];
  }
  return sortByArray.map((sortBy, index) => {
    const sortOrder = sortOrderArray[index];

    if (!Object.values(SORT_COLUMNS).includes(sortBy as SORT_COLUMNS)) {
      throw new HttpException(400, `Invalid sort_by value "${sortBy}". Valid values are: ${Object.values(SORT_COLUMNS).join(', ')}`);
    }

    if (!Object.values(SORT_ORDER).includes(sortOrder as SORT_ORDER)) {
      throw new HttpException(400, `Invalid sort_order value "${sortOrder}". Valid values are: ${Object.values(SORT_ORDER).join(', ')}`);
    }

    return [sortBy as SORT_COLUMNS, sortOrder as SORT_ORDER];
  });
};
