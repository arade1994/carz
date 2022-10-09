import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common/exceptions';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import User from './user.entity';

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        fakeUsersService = {
            find: () => Promise.resolve([]),
            create: (email: string, password: string) =>
                Promise.resolve({ id: 1, email, password } as User),
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

    it('creates and instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    it('creates a new user with hashed password', async () => {
        const user = await service.signup('anterade99@gmail.com', '123456');
        expect(user).toBeDefined();

        const [salt, hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws and error when user tries to signup with existing email address', async () => {
        fakeUsersService.find = () =>
            Promise.resolve([{ id: 1, email: 'a', password: 's' } as User]);
        await expect(
            service.signup('anterade99@gmail.com', '123456')
        ).rejects.toThrow(BadRequestException);
    });
});
