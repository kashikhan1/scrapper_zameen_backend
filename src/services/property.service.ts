import { Service } from 'typedi';
import { QueryTypes } from 'sequelize';
import { sequelize } from '@config/sequelize';
import { POPULARITY_TREND_URL, AREA_TREND_URL } from '@config/index';
import { AVAILABLE_CITIES, SORT_COLUMNS, SORT_ORDER } from '@/types';
import { getPropertyTypes } from '@/utils/helpers';

@Service()
export class PropertyService {
  private validateSortParams(sort_by: SORT_COLUMNS, sort_order: SORT_ORDER) {
    if (!Object.values(SORT_COLUMNS).includes(sort_by)) {
      throw new Error('Invalid sort_by column');
    }
    if (!Object.values(SORT_ORDER).includes(sort_order)) {
      throw new Error('Invalid sort_order');
    }
  }

  private getSortColumn(sort_by: SORT_COLUMNS) {
    return sort_by;
  }
  private mapProperties(properties: object[]) {
    return properties.map((property: any) => {
      const externalId = property?.url?.split('-').slice(-3)[0];
      return { ...property, popularity_trends: `${POPULARITY_TREND_URL}${externalId}`, area_trends: `${AREA_TREND_URL}${externalId}` };
    });
  }
  private async getTotalCount(baseQuery: string, replacements: any): Promise<number> {
    const countQuery = `SELECT COUNT(*) as total ${baseQuery};`;
    const countResult = await sequelize.query(countQuery, {
      type: QueryTypes.SELECT,
      replacements,
    });
    return countResult[0]['total'];
  }

  private async getTotalCountGroupedByTypes(baseQuery: string, replacements: any): Promise<{ [key: string]: number }> {
    const countQuery = `SELECT type, COUNT(*) as total ${baseQuery} GROUP BY type;`;
    const countResult = await sequelize.query(countQuery, {
      type: QueryTypes.SELECT,
      replacements,
    });

    return countResult.reduce<{ [key: string]: number }>((map, row: { type: string; total: number }) => {
      map[row.type] = row.total;
      return map;
    }, {});
  }
  private constructBaseQuery({
    city,
    search,
    property_types = [],
    bedrooms,
    price_min,
    price_max,
    area_min,
    area_max,
  }: {
    city?: string;
    search?: string;
    property_types?: string[];
    bedrooms?: string;
    price_min?: string;
    price_max?: string;
    area_min?: string;
    area_max?: string;
  }): { baseQuery: string; replacements: any } {
    let baseQuery = `FROM property_v2 WHERE 1=1 `;
    const replacements: any = {};

    if (city) {
      baseQuery += `AND location ILIKE :city `;
      replacements.city = `%${city}%`;
    }

    if (search) {
      baseQuery += `AND (header ILIKE :search OR location ILIKE :search OR bath ILIKE :search OR purpose ILIKE :search OR initial_amount ILIKE :search OR monthly_installment ILIKE :search OR remaining_installments ILIKE :search) `;
      replacements.search = `%${search}%`;
    }

    if (property_types.length > 0) {
      baseQuery += `AND type IN (:property_types) `;
      replacements.property_types = property_types;
    }

    if (bedrooms) {
      baseQuery += `AND bedroom IN (:bedrooms) `;
      replacements.bedrooms = bedrooms.split(',');
    }

    if (price_min) {
      baseQuery += `AND price >= :price_min `;
      replacements.price_min = Number(price_min);
    }

    if (price_max) {
      baseQuery += `AND price <= :price_max `;
      replacements.price_max = Number(price_max);
    }

    if (area_min) {
      baseQuery += `AND (
          CASE 
            WHEN area ILIKE '%kanal%' THEN CAST(REPLACE(SPLIT_PART(area, ' ', 1), ',', '') AS double precision) * 4500
            WHEN area ILIKE '%marla%' THEN CAST(REPLACE(SPLIT_PART(area, ' ', 1), ',', '') AS double precision) * 225
            WHEN area ILIKE '%sq. yd.%' THEN CAST(REPLACE(SPLIT_PART(area, ' ', 1), ',', '') AS double precision) * 9
            ELSE 0
          END
        )`;
      baseQuery += ` >= :min_area `;
      replacements.min_area = Number(area_min);
    }

    if (area_max) {
      baseQuery += `AND (
          CASE 
            WHEN area ILIKE '%kanal%' THEN CAST(REPLACE(SPLIT_PART(area, ' ', 1), ',', '') AS double precision) * 4500
            WHEN area ILIKE '%marla%' THEN CAST(REPLACE(SPLIT_PART(area, ' ', 1), ',', '') AS double precision) * 225
            WHEN area ILIKE '%sq. yd.%' THEN CAST(REPLACE(SPLIT_PART(area, ' ', 1), ',', '') AS double precision) * 9
            ELSE 0
          END
        )`;
      baseQuery += ` <= :max_area `;
      replacements.max_area = Number(area_max);
    }

    return { baseQuery, replacements };
  }
  public async findAllProperties({
    city,
    page_number,
    page_size = 10,
    sort_by = SORT_COLUMNS.ID,
    sort_order = SORT_ORDER.ASC,
  }: {
    city?: string;
    page_number: number;
    page_size?: number;
    sort_by?: SORT_COLUMNS;
    sort_order?: SORT_ORDER;
  }): Promise<any> {
    this.validateSortParams(sort_by, sort_order);

    const { baseQuery, replacements } = this.constructBaseQuery({ city });
    const totalCount = await this.getTotalCount(baseQuery, replacements);

    const sortColumn = this.getSortColumn(sort_by);
    const offset = (page_number - 1) * page_size;

    const query = `SELECT * ${baseQuery} ORDER BY ${sortColumn} ${sort_order} LIMIT :page_size OFFSET :offset`;
    replacements.page_size = page_size;
    replacements.offset = offset;

    const properties = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements,
    });
    return { properties: this.mapProperties(properties), total_count: totalCount };
  }
  public async findPropertyById(propertyId: number) {
    return await sequelize.query(`SELECT * FROM property_v2 WHERE id = :propertyId`, {
      type: QueryTypes.SELECT,
      replacements: { propertyId },
    });
  }
  public async getPropertyCount({ city }: { city?: string }) {
    const query = city ? `SELECT COUNT(*) FROM property_v2 WHERE location ILIKE :city;` : `SELECT COUNT(*) FROM property_v2;`;
    const replacements = city ? { city: `%${city}%` } : {};
    return await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements,
    });
  }
  public async availableCitiesData() {
    return Object.values(AVAILABLE_CITIES);
  }
  public async getPropertiesCountMap({
    city,
    search,
    area_min,
    area_max,
    price_min,
    price_max,
    bedrooms,
  }: {
    city?: string;
    search: string;
    area_min: string;
    area_max: string;
    price_min: string;
    price_max: string;
    bedrooms: string;
  }) {
    const propertyTypes = await getPropertyTypes();

    const { baseQuery, replacements } = this.constructBaseQuery({
      city,
      search,
      property_types: propertyTypes,
      bedrooms,
      price_min,
      price_max,
      area_min,
      area_max,
    });
    return await this.getTotalCountGroupedByTypes(baseQuery, replacements);
  }

  public async searchProperties({
    city,
    search,
    page_number,
    page_size = 10,
    sort_by = SORT_COLUMNS.ID,
    sort_order = SORT_ORDER.ASC,
    property_type,
    area_min,
    area_max,
    price_min,
    price_max,
    bedrooms,
  }: {
    city?: string;
    search: string;
    page_number: number;
    page_size?: number;
    sort_by?: SORT_COLUMNS;
    sort_order?: SORT_ORDER;
    property_type: string;
    area_min: string;
    area_max: string;
    price_min: string;
    price_max: string;
    bedrooms: string;
  }): Promise<any> {
    this.validateSortParams(sort_by, sort_order);

    const { baseQuery, replacements } = this.constructBaseQuery({
      city,
      search,
      property_types: property_type ? [property_type] : [],
      bedrooms,
      price_min,
      price_max,
      area_min,
      area_max,
    });
    const totalCount = await this.getTotalCount(baseQuery, replacements);

    const sortColumn = this.getSortColumn(sort_by);
    const offset = (page_number - 1) * page_size;

    const query = `SELECT * ${baseQuery} ORDER BY ${sortColumn} ${sort_order} LIMIT :page_size OFFSET :offset`;
    replacements.page_size = page_size;
    replacements.offset = offset;

    const properties = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements,
    });
    return {
      properties: this.mapProperties(properties),
      total_count: totalCount,
      property_count_map: await this.getPropertiesCountMap({
        city,
        search,
        area_min,
        area_max,
        price_min,
        price_max,
        bedrooms,
      }),
    };
  }
}
