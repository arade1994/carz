import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common/exceptions';

import { AuthService } from './auth.service';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import User from './user.entity';

describe('UsersController', () => {
    let controller: UsersController;
    let fakeUsersService: Partial<UsersService>;
    let fakeAuthService: Partial<AuthService>;

    beforeEach(async () => {
        const users: User[] = [];
        fakeUsersService = {
            create: (email: string, password: string) => {
                const user = {
                    id: Math.floor(Math.random() * 999999),
                    email,
                    password,
                } as User;
                users.push(user);
                return Promise.resolve(user);
            },
            findOne: (id: number) => {
                const user = users.find((u) => u.id === id);
                return Promise.resolve(user);
            },
            find: (email: string) => {
                const filteredUsers = users.filter(
                    (user) => user.email === email
                );
                return Promise.resolve(filteredUsers);
            },
            remove: (id: number) => {
                const userIndex = users.findIndex((user) => user.id === id);
                const removedUser = users.splice(userIndex, 1)[0];
                return Promise.resolve(removedUser);
            },
            update: (id: number, attrs: Partial<User>) => {
                let updatedUser: User;
                users.forEach((user) => {
                    if (user.id === id) {
                        Object.assign(user, attrs);
                        updatedUser = user;
                    }
                });

                return Promise.resolve(updatedUser);
            },
        };

        fakeAuthService = {
            signup: async (email: string, password: string) => {
                const user = await fakeUsersService.create(email, password);
                return Promise.resolve(user);
            },
            signin: (email: string, password: string) => {
                const user = users.find(
                    (u) => u.email === email && u.password === password
                );
                return Promise.resolve(user);
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: fakeUsersService,
                },
                {
                    provide: AuthService,
                    useValue: fakeAuthService,
                },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('currentUser()', () => {
        it('returns the currently signed in user', async () => {
            const createdUser = await fakeUsersService.create(
                'test@test.com',
                'test'
            );
            const user = controller.currentUser(createdUser);
            expect(user).toBeDefined();
        });
    });

    describe('createUser()', () => {
        it('signs up user and signs userId to the session object', async () => {
            const session = { userId: null };
            const user = await controller.createUser(
                { email: 'test@test.com', password: 'test' },
                session
            );
            expect(user).toBeDefined();
            expect(session.userId).toBeDefined();
        });
    });

    describe('signUser()', () => {
        it('signs the user in and signs userId to session object', async () => {
            const createdUser = await fakeUsersService.create(
                'test@test.com',
                'test'
            );
            const session = { userId: null };
            const user = await controller.signUser(
                { email: createdUser.email, password: createdUser.password },
                session
            );
            expect(user).toBeDefined();
            expect(session.userId).toBeDefined();
        });
    });

    describe('signout()', () => {
        it('signs out user and sets userId inside session to null', async () => {
            const createdUser = await fakeUsersService.create(
                'test@test.com',
                'test'
            );
            const session = { userId: null };
            await controller.signUser(
                { email: createdUser.email, password: createdUser.password },
                session
            );
            controller.signout(session);
            expect(session.userId).toBeNull();
        });
    });

    describe('findUser()', () => {
        it('returns ad user with given id', async () => {
            const createdUser = await fakeUsersService.create(
                'test@test.com',
                'test'
            );
            const user = await controller.findUser(createdUser.id.toString());
            expect(user).toBeDefined();
        });

        it('throws an exception when user is not found', async () => {
            await expect(controller.findUser('1')).rejects.toThrowError(
                NotFoundException
            );
        });

        it('throws an error when incorrect parameter id is sent', async () => {
            await expect(controller.findUser(null)).rejects.toThrowError(
                NotFoundException
            );
        });
    });

    describe('findAllUsers()', () => {
        it('returns all users with given email', async () => {
            const createdUser = await fakeUsersService.create(
                'test@test.com',
                'test'
            );
            const users = await controller.findAllUsers(createdUser.email);
            expect(users.length).toEqual(1);
            expect(users[0].email).toEqual(createdUser.email);
        });

        it('return no users with fake email', async () => {
            const users = await controller.findAllUsers(null);
            expect(users.length).toEqual(0);
        });
    });

    describe('updateUser()', () => {
        it('updates user successfully', async () => {
            const createdUser = await fakeUsersService.create(
                'test@test.com',
                'test'
            );
            const updatedUser = await controller.updateUser(
                createdUser.id.toString(),
                { email: 'test2@test.com', password: 'test' }
            );
            expect(updatedUser.email).toEqual('test2@test.com');
        });
    });

    describe('removeUser()', () => {
        it('removes user with id', async () => {
            const createdUser = await fakeUsersService.create(
                'test@test.com',
                'test'
            );
            await controller.removeUser(createdUser.id.toString());
            await expect(
                controller.findUser(createdUser.id.toString())
            ).rejects.toThrowError(NotFoundException);
        });
    });
});
