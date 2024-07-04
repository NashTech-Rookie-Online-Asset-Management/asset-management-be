import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../jwt-auth.guard';

const mockReflector = {
  get: jest.fn(),
};

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: Reflector,
          useValue: mockReflector,
        },
        JwtAuthGuard,
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('Should return true if the handler is public', () => {
    mockReflector.get.mockReturnValue(true);
    expect(guard.canActivate({ getHandler: jest.fn() } as any)).toBe(true);
  });

  it('Should call the super canActivate method if the handler is not public', () => {
    mockReflector.get.mockReturnValue(false);
    const canActivateSpy = jest.spyOn(JwtAuthGuard.prototype, 'canActivate');
    canActivateSpy.mockReturnValue(true);
    expect(guard.canActivate({ getHandler: jest.fn() } as any)).toBe(true);
    expect(canActivateSpy).toHaveBeenCalled();
  });
});
