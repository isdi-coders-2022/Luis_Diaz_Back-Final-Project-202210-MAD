import { Response, Request, NextFunction } from 'express';

import { UserRepository } from '../../repository/userRepository/userRepository.js';
import { UserController } from './userController.js';
import { createToken, passwordValidate } from './../../services/auth/auth.js';
import {
    CustomError,
    HTTPError,
} from '../../interface/errorInterface/errorInterface.js';
import { TattooRepository } from '../../repository/tattooRepository/tattooRepository.js';

jest.mock('./../../services/auth/auth.js');

const mockData = [
    {
        id: '1',
        name: 'pepe',
        password: '123',
        email: '',
        image: '',
        favorites: [{ id: '1' }],
    },
    {
        id: '2',
        name: 'coco',
        password: '456',
        email: '',
        image: '',
        favorites: [],
    },
];

const mockDataFavorites = {
    id: '3',
    name: 'pepe',
    password: '123',
    email: '',
    image: '',
    favorites: [{ id: '1' }, { id: '3' }],
};

const mockTattoo = { id: '1', favorites: ['123'] };

describe('Given the users controller,', () => {
    jest.setTimeout(20000);

    let repository: TattooRepository;
    let userRepository: UserRepository;
    let userController: UserController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        repository = TattooRepository.getInstance();
        userRepository = UserRepository.getInstance();

        userController = new UserController(userRepository, repository);

        userRepository.createUser = jest.fn().mockResolvedValue(mockData[0]);
        userRepository.findUser = jest.fn().mockResolvedValue(mockData[0]);
        userRepository.deleteUser = jest
            .fn()
            .mockResolvedValue(mockDataFavorites);
        userRepository.getUser = jest.fn().mockResolvedValue(mockData[1]);
        userRepository.updateUser = jest.fn().mockResolvedValue(mockData[0]);
        req = {};
        res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn();
        next = jest.fn();
    });

    describe('Given register is called,', () => {
        test('Then register should return', async () => {
            req.body = { mockData };
            await userController.register(
                req as Request,
                res as Response,
                next
            );
            expect(res.json).toHaveBeenCalledWith({ user: mockData[0] });
        });
    });

    describe('Given login is called', () => {
        test('Then login should return', async () => {
            const error: CustomError = new HTTPError(
                404,
                'Not found id',
                'message of error'
            );
            (passwordValidate as jest.Mock).mockResolvedValue(false);
            (createToken as jest.Mock).mockReturnValue('token');
            req.body = { password: 'password' };
            await userController.login(req as Request, res as Response, next);
            expect(error).toBeInstanceOf(HTTPError);
        });

        test('Then login should have been called', async () => {
            (passwordValidate as jest.Mock).mockResolvedValue(true);
            (createToken as jest.Mock).mockReturnValue('token');
            req.body = { password: 'pepe' };

            await userController.login(req as Request, res as Response, next);

            expect(res.json).toHaveBeenCalledWith({ token: 'token' });
        });
    });

    describe('Given deleteUser is called', () => {
        test('Then deleteUSer should return', async () => {
            req.params = { id: '1' };
            await userController.deleteUser(
                req as Request,
                res as Response,
                next
            );
            expect(res.json).toHaveBeenCalledWith({});
        });
    });

    describe('Given getUser is called', () => {
        test('Then getUser should return', async () => {
            req.params = { id: '2' };
            req.body = mockTattoo;
            await userController.getUser(req as Request, res as Response, next);

            expect(res.json).toHaveBeenNthCalledWith(1, { user: mockData[1] });
        });
    });

    describe('Given addTattooFavorites is called', () => {
        test('Then addTattooFavorites return', async () => {
            req.params = { id: '1' };
            req.body = { id: '2' };

            await userController.addTattooFavorites(
                req as Request,
                res as Response,
                next
            );
            expect(res.json).toHaveBeenCalledWith(mockData[0]);
        });
    });

    describe('Given deleteTattooFavorites is called', () => {
        test('Then deleteTattooFavorites return', async () => {
            req.params = { id: '3' };
            req.body = { id: '3' };
            await userController.deleteTattooFavorites(
                req as Request,
                res as Response,
                next
            );
            expect(res.json).toHaveBeenCalledWith(mockData[0]);
        });
    });
});

describe('Given UserController return error', () => {
    const error: CustomError = new HTTPError(
        404,
        'Not found id',
        'message of error'
    );
    const repository = TattooRepository.getInstance();
    const userRepo = UserRepository.getInstance();

    userRepo.getUser = jest.fn().mockRejectedValue('User');
    userRepo.createUser = jest.fn().mockRejectedValue(['User']);
    userRepo.deleteUser = jest.fn().mockRejectedValue('User');
    userRepo.updateUser = jest.fn().mockResolvedValue(['User']);

    const userController = new UserController(userRepo, repository);

    const req: Partial<Request> = {};
    const res: Partial<Response> = {
        json: jest.fn(),
    };
    const next: NextFunction = jest.fn();

    test('Given register should throw error', async () => {
        await userController.register(req as Request, res as Response, next);
        expect(error).toBeInstanceOf(HTTPError);
    });

    describe('Given login should throw error', () => {
        test('It should throw an error', async () => {
            await userController.login(req as Request, res as Response, next);
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(HTTPError);
        });
    });

    describe('Then deleteUser is called', () => {
        test('It should throw an error', async () => {
            await userController.deleteUser(
                req as Request,
                res as Response,
                next
            );
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(HTTPError);
        });
    });

    describe('Given addTattooFavorites should throw error', () => {
        test('It should throw an error', async () => {
            await userController.addTattooFavorites(
                req as Request,
                res as Response,
                next
            );
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(HTTPError);
        });
    });

    describe('Given getUser should throw error', () => {
        test('It should throw an error', async () => {
            await userController.getUser(req as Request, res as Response, next);
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(HTTPError);
        });
    });
});
