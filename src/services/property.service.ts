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
import { splitAndTrimString } from '@/utils';

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

  private async mapPropertiesDetails(properties: PropertiesModel[]) {
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
  }: IFindAllPropertiesProps): Promise<{
    rows: PropertiesModel[];
    count: number;
  }> {
    this.validateSortParams(sort_by, sort_order);
    const cityId = await this.findCityId(city);
    return Property.findAndCountAll({
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
          [col('Location.id'), 'location_id'],
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
    location_ids,
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
      location_ids,
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
  public async getLocationId(location: string): Promise<number[]> {
    if (!location) return null;

    const locationConditions = location.split('|').map(l => ({
      name: {
        [Op.iLike]: `%${l.trim()}%`,
      },
    }));

    const locationResponse = await Location.findAll({
      where: {
        [Op.or]: locationConditions,
      },
      attributes: ['id'],
    });
    return locationResponse.map(({ id }) => id);
  }

  public async getWhereClause({
    city,
    location_ids = '',
    area_min,
    area_max,
    price_min,
    price_max,
    bedrooms = '',
    start_date,
    end_date,
    purpose,
    property_type = '',
  }: IGetWhereClauseProps): Promise<WhereOptions<InferAttributes<PropertiesModel>>> {
    const cityIdPromise = this.findCityId(city);
    const locationIds = splitAndTrimString(location_ids).map(Number);
    const bedroomsArray = splitAndTrimString(bedrooms).map(Number);
    const propertyTypesArray = splitAndTrimString(property_type);
    const [cityId] = await Promise.all([cityIdPromise]);
    return {
      purpose,
      price: { [Op.gt]: 0 },
      ...(property_type && { type: { [Op.in]: propertyTypesArray } }),
      ...(location_ids && { location_id: { [Op.in]: locationIds } }),
      ...(city && { city_id: cityId }),
      ...((area_min || area_max) && { area: { ...(area_min && { [Op.gte]: area_min }), ...(area_max && { [Op.lte]: area_max }) } }),
      ...((price_min || price_max) && { price: { ...(price_min && { [Op.gte]: price_min }), ...(price_max && { [Op.lte]: price_max }) } }),
      ...(bedrooms && { bedroom: { [Op.in]: bedroomsArray } }),
      ...((start_date || end_date) && { added: { ...(start_date && { [Op.gte]: start_date }), ...(end_date && { [Op.lte]: end_date }) } }),
    };
  }

  public async autoCompleteLocation(search: string, city: string) {
    return Location.findAll({
      where:
        search || city
          ? {
              [Op.and]: [...(search ? [{ name: { [Op.iLike]: `%${search}%` } }] : []), ...(city ? [{ name: { [Op.iLike]: `%${city}%` } }] : [])],
            }
          : {},
      attributes: ['id', 'name'],
      limit: 10,
      raw: true,
    });
  }

  public async searchProperties({
    city,
    location_ids,
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
  }: ISearchPropertiesProps): Promise<{
    rows: PropertiesModel[];
    count: number;
  }> {
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
      location_ids,
    });

    return Property.findAndCountAll({
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
  }
}
