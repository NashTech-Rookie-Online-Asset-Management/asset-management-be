import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';

export const mockAuthService = {
  login: jest.fn(),
  changePassword: jest.fn(),
  refresh: jest.fn(),
  getProfile: jest.fn(),
  changePasswordFirstTime: jest.fn(),
};

export const mockResponse: any = {
  cookie: jest.fn(),
  json: jest.fn(),
  clearCookie: jest.fn(),
};
export let controller: AuthController;
export let authService: AuthService;
export let originalEnv: NodeJS.ProcessEnv;
export const setupTestController = async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [{ provide: AuthService, useValue: mockAuthService }],
  }).compile();

  controller = module.get<AuthController>(AuthController);
  authService = module.get<AuthService>(AuthService);
};
