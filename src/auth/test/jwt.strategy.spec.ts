import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from '../strategy/jwt.strategy';
import { PayloadType } from '../types';
import { Cookies, Messages } from 'src/common/constants';

const mockPrismaService = {
  account: {
    findUnique: jest.fn(),
  },
};

const mockConfigService = {
  get: jest.fn(),
};

const mockPayload: PayloadType = {
  sub: 1,
  username: 'testuser',
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeAll(async () => {
    mockConfigService.get.mockReturnValue('secret');

    const module = await Test.createTestingModule({
      providers: [
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
        JwtStrategy,
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('Should extract jwt from cookies', () => {
    const req = { cookies: { [Cookies.ACCESS_TOKEN]: 'token' } };

    const jwtFromRequest = strategy['_jwtFromRequest'] as (req: any) => string;
    const token = jwtFromRequest(req);

    expect(token).toBe('token');
  });

  it('Should extract jwt from auth header', () => {
    const req = { headers: { authorization: 'Bearer token' } };
    const jwtFromRequest = strategy['_jwtFromRequest'] as (req: any) => string;
    const token = jwtFromRequest(req);
    expect(token).toBe('token');
  });

  it("Should return a user's information after validating", async () => {
    const user = {
      id: 1,
      staffCode: 'SD0001',
      username: 'testuser',
      status: 'ACTIVE',
      type: 'USER',
      location: 'HCM',
    };

    mockPrismaService.account.findUnique.mockResolvedValue(user);

    const result = await strategy.validate(mockPayload);

    expect(result).toEqual(user);
  });

  it('Should throw NotFoundException if user not found', async () => {
    mockPrismaService.account.findUnique.mockResolvedValue(null);

    try {
      await strategy.validate(mockPayload);
      fail('Should have thrown NotFoundException');
    } catch (error) {
      expect(error.message).toBe(Messages.USER.FAILED.NOT_FOUND);
    }
  });
});
