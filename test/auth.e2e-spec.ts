import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Authentication system', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it('handles user signup', () => {
        const email = 'ngsrgkossfft@pagns.com';

        return request(app.getHttpServer())
            .post('/auth/signup')
            .send({ email, password: 'nsgrsog' })
            .expect(201)
            .then((res) => {
                const { id, email } = res.body;
                expect(id).toBeDefined();
                expect(email).toEqual(email);
            });
    });

    it('returns currently signed up user', async () => {
        const email = 'naegjoar@naojroae.com';

        const res = await request(app.getHttpServer())
            .post('/auth/signup')
            .send({ email, password: 'odjgagg' })
            .expect(201);

        const cookie = res.get('Set-Cookie');

        const currentUserResponse = await request(app.getHttpServer())
            .get('/auth/currentUser')
            .set('Cookie', cookie)
            .expect(200);

        expect(currentUserResponse.body.email).toEqual(email);
    });
});
