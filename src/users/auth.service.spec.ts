import { Test } from '@nestjs/testing';
import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common/exceptions';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import User from './user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        const users: User[] = [];
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(
                    (user) => user.email === email
                );
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = {
                    id: Math.floor(Math.random() * 999999),
                    email,
                    password,
                } as User;
                users.push(user);
                return Promise.resolve(user);
            },
        };

        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService,
                },
            ],
        }).compile();

        service = module.get(AuthService);
    });

    it('creates an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    describe('signup()', () => {
        it('creates a new user with hashed password', async () => {
            const user = await service.signup('test@test.com', '123456');
            expect(user).toBeDefined();

            const [salt, hash] = user.password.split('.');
            expect(salt).toBeDefined();
            expect(hash).toBeDefined();
        });

        it('throws an error when user tries to signup with existing email address', async () => {
            await service.signup('test@test.com', 'test');
            await expect(
                service.signup('test@test.com', '123456')
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('signin()', () => {
        it('throws an error if user signs in with unused email', async () => {
            await expect(
                service.signin('test@test.com', 'test')
            ).rejects.toThrow(NotFoundException);
        });

        it('throws an error if user signs in with invalid password', async () => {
            await service.signup('test@test.com', 'test');
            await expect(
                service.signin('test@test.com', 'adgsrgd')
            ).rejects.toThrow(BadRequestException);
        });

        it('signs in a user with correct password supplied', async () => {
            await service.signup('test@test.com', 'test');
            const user = await service.signin('test@test.com', 'test');

            expect(user).toBeDefined();
        });
    });
});
