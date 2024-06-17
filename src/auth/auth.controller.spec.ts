import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { UnauthorizedException } from '@nestjs/common';
import { LoginResponseDto } from './dto/login-response.dto';
const mockAuthService = {
  login: jest.fn(),
};
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const authPayload: AuthPayloadDto = {
        username: 'validuser',
        password: 'validpassword',
      };
      const mockedLoginResponse: LoginResponseDto = {
        accessToken: 'mocked.accessToken',
        refreshToken: 'mocked.refreshToken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockedLoginResponse);

      const result = await controller.login(authPayload);

      expect(result).toEqual({
        accessToken: 'mocked.accessToken',
        refreshToken: 'mocked.refreshToken',
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const authPayload: AuthPayloadDto = {
        username: 'invaliduser',
        password: 'invalidpassword',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(
          new UnauthorizedException(
            'Username or password is incorrect. Please try again.',
          ),
        );

      await expect(controller.login(authPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
