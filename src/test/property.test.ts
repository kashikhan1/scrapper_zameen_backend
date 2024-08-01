import request from 'supertest';
import { Container } from 'typedi';
import { mock, MockProxy } from 'jest-mock-extended';
import { App } from '@/app';
import { PropertyRoute } from '@routes/property.route';
import { PropertyService } from '@/services/property.service';
import { getPropertyTypes, getPropertyPurpose } from '@/utils/helpers';
import { AVAILABLE_CITIES } from '@/types';

jest.mock('@/services/property.service');
jest.mock('@/utils/helpers', () => ({
  getPropertyTypes: jest.fn(),
  getPropertyPurpose: jest.fn(),
}));
const propertyServiceMock: MockProxy<PropertyService> = mock<PropertyService>();

const getMockPropertiesData = () => ({
  count: 2,
  rows: [
    {
      id: 1,
      description: 'description',
      header: 'Header',
      type: 'house',
      price: 95000000,
      cover_photo_url: 'cover_photo_url.jpeg',
      available: true,
      area: 450,
      location: 'Islamabad',
    } as any,
    {
      id: 1,
      description: 'description',
      header: 'Header',
      type: 'house',
      price: 9000000,
      cover_photo_url: 'cover_photo_url.jpeg',
      available: true,
      area: 490,
      location: 'Islamabad',
    } as any,
  ],
});

const mockfindAllProperties = () => {
  propertyServiceMock.findAllProperties.mockResolvedValue(getMockPropertiesData());
};

const mockSearchProperties = () => {
  propertyServiceMock.searchProperties.mockResolvedValue(getMockPropertiesData());
};

describe('Property', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  let app;
  beforeAll(() => {
    Container.set(PropertyService, propertyServiceMock);
    const route = new PropertyRoute();
    route.property.property = propertyServiceMock;
    app = new App([route]).getServer();
    (getPropertyTypes as jest.Mock).mockResolvedValue(['house', 'apartment']);
    (getPropertyPurpose as jest.Mock).mockResolvedValue(['for_rent', 'for_sale']);
  });
  describe('GET /property', () => {
    it('should retrieve properties with default pagination and sorting', async () => {
      mockfindAllProperties();
      const response = await request(app).get('/property').query({ purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'findAll');
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });

    it('should retrieve properties with custom pagination', async () => {
      mockfindAllProperties();
      const response = await request(app).get('/property').query({ page_size: 5, page_number: 2, purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });

    it('should retrieve properties sorted by price in descending order', async () => {
      mockfindAllProperties();
      const response = await request(app).get('/property').query({ sort_by: 'price', sort_order: 'DESC', purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
      const prices = response.body.data.properties.map(property => Number(property.price));
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });
    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app).get('/property').query({ page_size: -1, page_number: 0 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid sorting parameters', async () => {
      const response = await request(app).get('/property').query({ sort_by: 'unknown_field', sort_order: 'DESC' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid sorting parameters (sort_order)', async () => {
      const response = await request(app).get('/property').query({ sort_by: 'price', sort_order: 'unknown' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('Should return error', async () => {
      propertyServiceMock.findAllProperties.mockRejectedValue('Error');
      const response = await request(app).get('/property').query({ purpose: 'for_sale' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/count', () => {
    it('should retrieve the total count of properties', async () => {
      propertyServiceMock.getPropertiesCountMap.mockResolvedValue({
        'Agricultural Land': 76,
        Building: 2618,
        'Commercial Plot': 2768,
        Factory: 558,
      });
      const response = await request(app).get('/property/count').query({ purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message');
    });
    it('should retrieve the total count of properties', async () => {
      propertyServiceMock.getPropertiesCountMap.mockResolvedValue({
        'Agricultural Land': 76,
        Building: 2618,
        'Commercial Plot': 2768,
        Factory: 558,
      });
      const response = await request(app).get('/property/count/islamabad').query({ purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message');
    });
    it('Should return error', async () => {
      propertyServiceMock.getPropertiesCountMap.mockRejectedValue('Error');
      const response = await request(app).get('/property/count').query({ purpose: 'for_sale' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/:id', () => {
    it('should retrieve a property by ID', async () => {
      propertyServiceMock.findPropertyById.mockResolvedValue([{ id: 1 }]);
      const response = await request(app).get('/property/1');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'findOne');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0]).toHaveProperty('id', 1);
    });

    it('should return empty array for a non-existent property ID', async () => {
      propertyServiceMock.findPropertyById.mockResolvedValue([]);
      const response = await request(app).get('/property/9999');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'findOne');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(0);
    });
    it('Should return error', async () => {
      propertyServiceMock.findPropertyById.mockRejectedValue('Error');
      const response = await request(app).get('/property/1');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/:city', () => {
    it('should retrieve properties in a specific city with default pagination and sorting', async () => {
      mockfindAllProperties();
      const response = await request(app).get('/property/islamabad').query({ purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'findAll');
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
      response.body.data.properties.forEach(property => {
        expect(property.location?.toLowerCase()?.includes('islamabad')).toBeTruthy();
      });
    });

    it('should retrieve properties in a specific city with custom pagination', async () => {
      mockfindAllProperties();
      const response = await request(app).get('/property/islamabad').query({ page_size: 5, page_number: 2, purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
      response.body.data.properties.forEach(property => {
        expect(property.location?.toLowerCase()?.includes('islamabad')).toBeTruthy();
      });
    });

    it('should retrieve properties in a specific city sorted by price in descending order', async () => {
      mockfindAllProperties();
      const response = await request(app).get('/property/islamabad').query({ sort_by: 'price', sort_order: 'DESC', purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
      const prices = response.body.data.properties.map(property => Number(property.price));
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });
    it('should return no data for invalid city name', async () => {
      const response = await request(app).get('/property/invalid city name');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('Should return error', async () => {
      propertyServiceMock.findAllProperties.mockRejectedValue('Error');
      const response = await request(app).get('/property/islamabad').query({ purpose: 'for_sale' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/search', () => {
    it('should retrieve properties with default pagination and sorting', async () => {
      mockSearchProperties();
      const response = await request(app).get('/property/search');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'search-properties');
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });

    it('should retrieve properties with custom pagination', async () => {
      mockSearchProperties();
      const response = await request(app).get('/property/search').query({ page_size: 5, page_number: 2, purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });

    it('should retrieve properties sorted by price in descending order', async () => {
      mockfindAllProperties();
      const response = await request(app).get('/property/search').query({ sort_by: 'price', sort_order: 'DESC', purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
      const prices = response.body.data.properties.map(property => Number(property.price));
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });
    it('should return 400 for invalid purpose parameter', async () => {
      const response = await request(app).get('/property/search').query({ purpose: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return error when get property purpose rejects', async () => {
      (getPropertyPurpose as jest.Mock).mockRejectedValueOnce('Error occured!');
      const response = await request(app).get('/property/search').query({ purpose: 'for_sale' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app).get('/property/search').query({ page_size: -1, page_number: 0 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid sorting parameters', async () => {
      const response = await request(app).get('/property/search').query({ sort_by: 'unknown_field', sort_order: 'DESC' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid sorting parameters (sort_order)', async () => {
      const response = await request(app).get('/property/search?').query({ sort_by: 'price', sort_order: 'unknown' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid location_ids parameters', async () => {
      const response = await request(app).get('/property/search').query({ location_ids: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should search', async () => {
      mockSearchProperties();
      const responses = await Promise.all([
        request(app).get('/property/search').query({ location_ids: '1,2,3', purpose: 'for_sale' }),
        request(app).get('/property/search').query({ location_ids: '123', purpose: 'for_sale' }),
        request(app).get('/property/search').query({ location_ids: '1', purpose: 'for_sale' }),
      ]);
      responses.forEach(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('message', 'search-properties');
        expect(res.body.data).toBeInstanceOf(Object);
      });
    });
    it('should return 400 for invalid price_min parameter', async () => {
      const response = await request(app).get('/property/search').query({ price_min: -1 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid price_max parameter', async () => {
      const response = await request(app).get('/property/search').query({ price_max: -1 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid area_min parameter', async () => {
      const response = await request(app).get('/property/search').query({ area_min: -1 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid area_max parameter', async () => {
      const response = await request(app).get('/property/search').query({ area_max: -1 });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid bedrooms parameter', async () => {
      const response = await request(app).get('/property/search').query({ bedrooms: '1,a' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid property_type parameter', async () => {
      const response = await request(app).get('/property/search').query({ property_type: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid start_date parameter', async () => {
      const response = await request(app).get('/property/search').query({ start_date: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid end_date parameter', async () => {
      const response = await request(app).get('/property/search').query({ end_date: 'invalid' });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('Should return error', async () => {
      propertyServiceMock.searchProperties.mockRejectedValue('Error');
      const response = await request(app).get('/property/search').query({ location_ids: '1,2,3', purpose: 'for_sale' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/available-cities', () => {
    it('Should return available cities list', async () => {
      propertyServiceMock.availableCitiesData.mockResolvedValue(Object.values(AVAILABLE_CITIES));
      const response = await request(app).get('/property/available-cities');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body).toHaveProperty('message', 'available-cities');
    });
    it('Should return error', async () => {
      propertyServiceMock.availableCitiesData.mockRejectedValue('Error occured!');
      const response = await request(app).get('/property/available-cities');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/featured', () => {
    it('Should return featured properties', async () => {
      mockSearchProperties();
      const response = await request(app).get('/property/featured').query({ purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });
    it('Should return error', async () => {
      propertyServiceMock.searchProperties.mockRejectedValue('Error');
      const response = await request(app).get('/property/featured').query({ purpose: 'for_sale' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/similar', () => {
    it('Should return featured properties', async () => {
      propertyServiceMock.findPropertyById.mockResolvedValue([
        {
          id: 1,
          desc: 'description',
          header: 'Header',
          type: 'House',
          price: 95000000,
          cover_photo_url: 'cover_photo_url.jpeg',
          available: true,
          area: '20 Marla',
          location: 'Islamabad',
        },
      ]);
      mockSearchProperties();
      const response = await request(app).get('/property/similar').query({ id: 1, purpose: 'for_sale' });
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });
    it('Should return error', async () => {
      propertyServiceMock.searchProperties.mockRejectedValue(new Error('This should not be done!'));
      const response = await request(app).get('/property/similar').query({ id: 1, purpose: 'for_sale' });
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/suggestions', () => {
    it('Should return a list of suggestions', async () => {
      propertyServiceMock.autoCompleteLocation.mockResolvedValue([{ name: 'test1' } as any, { name: 'test2' } as any]);
      const response = await request(app).get('/property/suggestions');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'auto-complete-locations');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toEqual([{ name: 'test1' }, { name: 'test2' }]);
    });
    it('Should return error', async () => {
      propertyServiceMock.autoCompleteLocation.mockRejectedValue('Error occured!');
      const response = await request(app).get('/property/suggestions');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message');
    });
  });
});
