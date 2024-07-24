import { Service } from 'typedi';
import { FindAttributeOptions, InferAttributes, Op, WhereOptions, col, fn } from 'sequelize';
import { POPULARITY_TREND_URL, AREA_TREND_URL, CONTACT_URL } from '@config/index';
import {
  AVAILABLE_CITIES,
  IFindAllPropertiesProps,
  IGetPropertiesCountMapProps,
  IGetWhereClauseProps,
  ISearchPropertiesProps,
  SORT_COLUMNS,
  SORT_ORDER,
} from '@/types';
import axios, { AxiosResponse } from 'axios';
import { City, Location, PropertiesModel, Property } from '@/models/models';

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

  private async findCityId(city: string): Promise<number | null> {
    if (!city) return null;

    const cityResponse = await City.findOne({
      where: { name: { [Op.iLike]: city } },
      attributes: ['id'],
    });
    return cityResponse?.id ?? null;
  }

  private selectAttributes(): FindAttributeOptions {
    return [
      'id',
      'description',
      'header',
      'type',
      'price',
      'cover_photo_url',
      'available',
      'area',
      'added',
      'bedroom',
      'bath',
      [col('Location.name'), 'location'],
      [col('City.name'), 'city'],
    ];
  }

  private async mapPropertiesDetails(properties: object[]) {
    const promises = await Promise.allSettled(
      properties.map(async (property: any) => {
        const externalId = property?.url?.split('-').slice(-3)[0];
        const [popularity_trends, area_trends, contact] = await Promise.allSettled([
          axios.get(`${POPULARITY_TREND_URL}${externalId}`),
          axios.get(`${AREA_TREND_URL}${externalId}`),
          axios.get(`${CONTACT_URL}${externalId}`),
        ]);
        const formatResponse = (response: PromiseSettledResult<AxiosResponse>) => {
          if (response.status === 'fulfilled') {
            return response.value.data;
          }
          return null;
        };
        return {
          ...property,
          popularity_trends: formatResponse(popularity_trends),
          area_trends: formatResponse(area_trends),
          external_id: externalId,
          contact: formatResponse(contact),
        };
      }),
    );
    return promises.map(promise => (promise.status === 'fulfilled' ? promise.value : null)).filter(v => v != null);
  }

  public async findAllProperties({
    city,
    page_number,
    page_size = 10,
    sort_by = SORT_COLUMNS.ID,
    sort_order = SORT_ORDER.ASC,
    purpose,
  }: IFindAllPropertiesProps): Promise<any> {
    this.validateSortParams(sort_by, sort_order);
    const cityId = await this.findCityId(city);
    const { count: totalCount, rows: properties } = await Property.findAndCountAll({
      where: {
        price: {
          [Op.gt]: 0,
        },
        purpose,
        ...(city && { city_id: cityId }),
      },
      order: [[sort_by, sort_order]],
      offset: (page_number - 1) * page_size,
      limit: page_size,
      include: [
        {
          model: Location,
          attributes: [],
        },
        {
          model: City,
          attributes: [],
        },
      ],
      attributes: this.selectAttributes(),
      raw: true,
      nest: false,
    });

    return { properties, total_count: totalCount };
  }
  public async findPropertyById(propertyId: number) {
    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: Location,
          attributes: [],
        },
        {
          model: City,
          attributes: [],
        },
      ],
      attributes: {
        include: [
          [col('Location.name'), 'location'],
          [col('City.name'), 'city'],
        ],
      },
      raw: true,
      nest: false,
    });
    if (property) return this.mapPropertiesDetails([property]);
    else return [];
  }

  public async availableCitiesData() {
    return Object.values(AVAILABLE_CITIES);
  }

  private async getCountMap(whereClause: WhereOptions<InferAttributes<PropertiesModel>>) {
    const countMap = await Property.count({
      where: whereClause,
      attributes: ['type', [fn('COUNT', col('type')), 'count']],
      group: 'type',
    });
    return countMap.reduce((acc, item) => {
      acc[item.type as string] = item.count;
      return acc;
    }, {});
  }
  public async getPropertiesCountMap({
    city,
    search,
    area_min,
    area_max,
    price_min,
    price_max,
    bedrooms,
    start_date,
    end_date,
    purpose,
  }: IGetPropertiesCountMapProps) {
    const whereClause = await this.getWhereClause({
      city,
      search,
      area_min,
      area_max,
      price_min,
      price_max,
      bedrooms,
      start_date,
      end_date,
      purpose,
    });
    return this.getCountMap(whereClause);
  }
  public async getLocationId(location: string): Promise<number | null> {
    if (!location) return null;

    const locationResponse = await Location.findOne({
      where: {
        name: {
          [Op.iLike]: `%${location}%`,
        },
      },
      attributes: ['id'],
    });
    return locationResponse?.id ?? null;
  }

  public async getWhereClause({
    city,
    search,
    area_min,
    area_max,
    price_min,
    price_max,
    bedrooms,
    start_date,
    end_date,
    purpose,
    property_type,
  }: IGetWhereClauseProps): Promise<WhereOptions<InferAttributes<PropertiesModel>>> {
    const cityIdPromise = this.findCityId(city);
    const locationIdPromise = this.getLocationId(search);
    const [cityId, locationId] = await Promise.all([cityIdPromise, locationIdPromise]);
    return {
      purpose,
      price: { [Op.gt]: 0 },
      ...(property_type && { type: property_type }),
      ...(search && { location_id: locationId }),
      ...(city && { city_id: cityId }),
      ...((area_min || area_max) && { area: { ...(area_min && { [Op.gte]: area_min }), ...(area_max && { [Op.lt]: area_max }) } }),
      ...((price_min || price_max) && { price: { ...(price_min && { [Op.gte]: price_min }), ...(price_max && { [Op.lt]: price_max }) } }),
      ...(bedrooms && { bedroom: { [Op.in]: bedrooms.split(',').map(Number) } }),
      ...((start_date || end_date) && { added: { ...(start_date && { [Op.gte]: start_date }), ...(end_date && { [Op.lt]: end_date }) } }),
    };
  }

  public async autoCompleteLocation(search: string, city: string) {
    const locationResponse = await Location.findAll({
      where:
        search || city
          ? {
              [Op.and]: [...(search ? [{ name: { [Op.iLike]: `%${search}%` } }] : []), ...(city ? [{ name: { [Op.iLike]: `%${city}%` } }] : [])],
            }
          : {},
      attributes: ['name'],
      limit: 10,
      raw: true,
    });
    return locationResponse.map(location => location.name);
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
    start_date,
    end_date,
    purpose,
  }: ISearchPropertiesProps): Promise<any> {
    this.validateSortParams(sort_by, sort_order);

    const whereClause = await this.getWhereClause({
      property_type,
      area_min,
      area_max,
      price_min,
      price_max,
      bedrooms,
      start_date,
      end_date,
      purpose,
      city,
      search,
    });

    const findAndCountAllPromise = Property.findAndCountAll({
      where: whereClause,
      order: [[sort_by, sort_order]],
      offset: (page_number - 1) * page_size,
      limit: page_size,
      include: [
        {
          model: Location,
          attributes: [],
        },
        {
          model: City,
          attributes: [],
        },
      ],
      attributes: this.selectAttributes(),
      raw: true,
      nest: false,
    });
    const [{ count: totalCount, rows: properties }] = await Promise.all([findAndCountAllPromise]);
    return {
      properties,
      total_count: totalCount,
    };
  }
}
