import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from '../role.guard';
import { AccountType, UserStatus } from '@prisma/client';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Messages } from 'src/common/constants';

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

const mockUser = {
  id: 1,
  status: UserStatus.ACTIVE,
  type: AccountType.ADMIN,
};

const mockContext = {
  getHandler: jest.fn().mockReturnThis(),
  getClass: jest.fn().mockReturnThis(),
  switchToHttp: jest.fn().mockReturnThis(),
  getRequest: jest.fn(),
};

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        RolesGuard,
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('Should return true if no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce(undefined);
    expect(guard.canActivate(mockContext as any)).toBe(true);
  });

  it('Should return false if user is inactive', () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce([AccountType.ADMIN]);
    mockContext.getRequest.mockReturnValueOnce({
      user: { ...mockUser, status: UserStatus.DISABLED },
    });
    try {
      guard.canActivate(mockContext as any);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException);
      expect(error.message).toBe(Messages.AUTH.FAILED.INACTIVE);
    }
  });

  it('Should return false if user does not have required role', () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce([AccountType.ADMIN]);
    mockContext.getRequest.mockReturnValueOnce({
      user: {
        ...mockUser,
        type: AccountType.STAFF,
      },
    });

    try {
      guard.canActivate(mockContext as any);
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe(Messages.AUTH.FAILED.DO_NOT_HAVE_PERMISSION);
    }
  });

  it('Should return true if user has required role', () => {
    mockReflector.getAllAndOverride.mockReturnValueOnce([AccountType.ADMIN]);
    mockContext.getRequest.mockReturnValueOnce({ user: mockUser });
    expect(guard.canActivate(mockContext as any)).toBe(true);
  });
});
