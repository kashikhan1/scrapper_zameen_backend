import request from 'supertest';
import { Container } from 'typedi';
import { mock, MockProxy } from 'jest-mock-extended';
import { App } from '@/app';
import { PropertyRoute } from '@routes/property.route';
import { PropertyService } from '@/services/property.service';
import { getPropertyTypes } from '@/utils/helpers';

jest.mock('@/services/property.service');
jest.mock('@/utils/helpers', () => ({
  getPropertyTypes: jest.fn(),
}));
const propertyServiceMock: MockProxy<PropertyService> = mock<PropertyService>();

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
    (getPropertyTypes as jest.Mock).mockResolvedValue(['House', 'Apartment']);
  });
  describe('GET /property', () => {
    it('should retrieve properties with default pagination and sorting', async () => {
      propertyServiceMock.findAllProperties.mockResolvedValue({
        total_count: 2,
        properties: [
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 95000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '20 Marla',
          },
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 9000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '5 Marla',
          },
        ],
      });
      const response = await request(app).get('/property');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'findAll');
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });

    it('should retrieve properties with custom pagination', async () => {
      propertyServiceMock.findAllProperties.mockResolvedValue({
        total_count: 2,
        properties: [
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 95000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '20 Marla',
          },
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 9000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '5 Marla',
          },
        ],
      });
      const response = await request(app).get('/property?page_size=5&page_number=2');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });

    it('should retrieve properties sorted by price in descending order', async () => {
      propertyServiceMock.findAllProperties.mockResolvedValue({
        properties: [{ price: 300000 }, { price: 200000 }, { price: 100000 }],
        total_count: 3,
      });
      const response = await request(app).get('/property?sort_by=price&sort_order=DESC');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
      const prices = response.body.data.properties.map(property => Number(property.price));
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });
    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app).get('/property?page_size=-1&page_number=0');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid sorting parameters', async () => {
      const response = await request(app).get('/property?sort_by=unknown_field&sort_order=DESC');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
  describe('GET /property/count', () => {
    propertyServiceMock.getPropertiesCountMap.mockResolvedValue({
      'Agricultural Land': 76,
      Building: 2618,
      'Commercial Plot': 2768,
      Factory: 558,
    });
    it('should retrieve the total count of properties', async () => {
      const response = await request(app).get('/property/count');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body).toHaveProperty('message');
    });
    it('should retrieve the total count of properties', async () => {
      const response = await request(app).get('/property/count/islamabad');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toBeInstanceOf(Object);
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
  });
  describe('GET /property/:city', () => {
    it('should retrieve properties in a specific city with default pagination and sorting', async () => {
      propertyServiceMock.findAllProperties.mockResolvedValue({
        total_count: 2,
        properties: [
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
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 9000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '5 Marla',
            location: 'Islamabad',
          },
        ],
      });
      const response = await request(app).get('/property/islamabad');
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
      propertyServiceMock.findAllProperties.mockResolvedValue({
        total_count: 2,
        properties: [
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
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 9000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '5 Marla',
            location: 'Islamabad',
          },
        ],
      });
      const response = await request(app).get('/property/islamabad?page_size=5&page_number=2');
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
      propertyServiceMock.findAllProperties.mockResolvedValue({
        properties: [{ price: 300000 }, { price: 200000 }, { price: 100000 }],
        total_count: 3,
      });
      const response = await request(app).get('/property/islamabad?sort_by=price&sort_order=DESC');
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
  });
  describe('GET /property/search', () => {
    it('should retrieve properties with default pagination and sorting', async () => {
      propertyServiceMock.searchProperties.mockResolvedValue({
        total_count: 2,
        properties: [
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
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 9000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '5 Marla',
            location: 'Islamabad',
          },
        ],
      });
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
      propertyServiceMock.searchProperties.mockResolvedValue({
        total_count: 2,
        properties: [
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
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 9000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '5 Marla',
            location: 'Islamabad',
          },
        ],
      });
      const response = await request(app).get('/property/search?page_size=5&page_number=2');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
    });

    it('should retrieve properties sorted by price in descending order', async () => {
      propertyServiceMock.findAllProperties.mockResolvedValue({
        properties: [{ price: 300000 }, { price: 200000 }, { price: 100000 }],
        total_count: 3,
      });
      const response = await request(app).get('/property/search?sort_by=price&sort_order=DESC');
      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Object);
      expect(response.body.data).toHaveProperty('properties');
      expect(response.body.data.properties).toBeInstanceOf(Array);
      expect(response.body.data).toHaveProperty('total_count');
      const prices = response.body.data.properties.map(property => Number(property.price));
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });
    it('should return 400 for invalid pagination parameters', async () => {
      const response = await request(app).get('/property/search?page_size=-1&page_number=0');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid sorting parameters', async () => {
      const response = await request(app).get('/property/search?sort_by=unknown_field&sort_order=DESC');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid sorting parameters (sort_order)', async () => {
      const response = await request(app).get('/property/search?sort_by=price&sort_order=unknown');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should search', async () => {
      propertyServiceMock.searchProperties.mockResolvedValue({
        total_count: 2,
        properties: [
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
          {
            id: 1,
            desc: 'description',
            header: 'Header',
            type: 'House',
            price: 9000000,
            cover_photo_url: 'cover_photo_url.jpeg',
            available: true,
            area: '5 Marla',
            location: 'Islamabad',
          },
        ],
      });
      const responses = await Promise.all([
        request(app).get('/property/search?query=islamabad'),
        request(app).get('/property/search?query=123'),
        request(app).get('/property/search?query=abc'),
      ]);
      responses.forEach(res => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body).toHaveProperty('message', 'search-properties');
        expect(res.body.data).toBeInstanceOf(Object);
      });
    });
    it('should return 400 for invalid price_min parameter', async () => {
      const response = await request(app).get('/property/search?price_min=-1');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid price_max parameter', async () => {
      const response = await request(app).get('/property/search?price_max=-1');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid area_min parameter', async () => {
      const response = await request(app).get('/property/search?area_min=-1');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
    it('should return 400 for invalid area_max parameter', async () => {
      const response = await request(app).get('/property/search?area_max=-1');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });
});
