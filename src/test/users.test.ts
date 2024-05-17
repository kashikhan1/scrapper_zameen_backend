import request from 'supertest';
import { App } from '@/app';
// import { User } from '@interfaces/users.interface';
import { UserRoute } from '@routes/users.route';

afterAll(async () => {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});

describe('TEST Users API', () => {
  const route = new UserRoute();
  const app = new App([route]);

  describe('[GET] /users', () => {
    it('response statusCode 200 /findAll', () => {
      return request(app.getServer()).get(`${route.path}`).expect(200);
    });
  });

  describe('[GET] /users/:id', () => {
    it('response statusCode 200 /findOne', () => {
      const userId = 1;

      return request(app.getServer()).get(`${route.path}/${userId}`).expect(200);
    });
  });

  describe('[POST] /users', () => {
    it('response statusCode 201 /created', async () => {
      return request(app.getServer())
        .post(`${route.path}`)
        .send({
          email: 'example2@email.com',
          password: 'password123456789',
        })
        .expect(201);
    });
  });

  describe('[DELETE] /users/:id', () => {
    it('response statusCode 200 /deleted', () => {
      const userId = 1;

      return request(app.getServer()).delete(`${route.path}/${userId}`).expect(200);
    });
  });
});
