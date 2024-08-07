import { UnauthorizedException } from '@nestjs/common';
import {
  mockJwtService,
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import * as bcrypt from 'bcryptjs';
import { mockUserPayload } from './config/mock-data';
describe('AuthService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a login response with valid credentials', async () => {
      const authPayload = { username: 'testuser', password: 'password123' };
      const hashedPassword = await bcrypt.hash(authPayload.password, 10);
      const mockUser = {
        username: authPayload.username,
        password: hashedPassword,
        id: 1,
        staffCode: 'SD0001',
        status: 'ACTIVE',
        type: 'USER',
      };

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        mockUser,
      );

      // Execute the login method
      const result = await service.login(authPayload);

      // Assertions
      expect(result.accessToken).toBe('mocked.token');
      expect(result.refreshToken).toBe('mocked.token');
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { username: authPayload.username },
      });
      // Called for accessToken and refreshToken
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });
    // case username not exist
    it('should throw UnauthorizedException if username does not exist', async () => {
      const authPayload = {
        username: 'nonexistentuser',
        password: 'password123',
      };

      (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(service.login(authPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
        where: { username: authPayload.username },
      });
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
    });
  });
  // case user is disabled
  it('should throw UnauthorizedException if account is disabled', async () => {
    const authPayload = { username: 'testuser', password: 'password123' };
    const mockUser = {
      username: authPayload.username,
      password: 'hashedpassword',
      id: 1,
      staffCode: 'SD0001',
      status: 'DISABLED',
      type: 'USER',
    };

    (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
      mockUser,
    );

    await expect(service.login(authPayload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
      where: { username: authPayload.username },
    });
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  // case: username or password incorrect
  it('should throw UnauthorizedException if password is incorrect', async () => {
    const authPayload = { username: 'testuser', password: 'incorrectpassword' };
    const hashedPassword = await bcrypt.hash('password123', 10);
    const mockUser = {
      username: authPayload.username,
      password: hashedPassword,
      id: 1,
      staffCode: 'SD0001',
      status: 'ACTIVE',
      type: 'USER',
    };

    (mockPrismaService.account.findUnique as jest.Mock).mockResolvedValue(
      mockUser,
    );

    await expect(service.login(authPayload)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(mockPrismaService.account.findUnique).toHaveBeenCalledWith({
      where: { username: authPayload.username },
    });
    expect(mockJwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should generate login response with access and refresh tokens', async () => {
    const signAsyncSpy = jest
      .spyOn(mockJwtService, 'signAsync')
      .mockResolvedValueOnce('accessToken')
      .mockResolvedValueOnce('refreshToken');

    const result = await service['generateLoginResponse'](mockUserPayload);

    expect(result).toBeDefined();
    expect(result.accessToken).toBe('accessToken');
    expect(result.refreshToken).toBe('refreshToken');
    expect(result.payload).toEqual({
      username: mockUserPayload.username,
      sub: mockUserPayload.id,
      staffCode: mockUserPayload.staffCode,
      status: mockUserPayload.status,
      type: mockUserPayload.type,
      location: mockUserPayload.location,
    });

    expect(signAsyncSpy).toHaveBeenCalledTimes(2);
    expect(signAsyncSpy).toHaveBeenNthCalledWith(
      1,
      {
        username: mockUserPayload.username,
        sub: mockUserPayload.id,
        staffCode: mockUserPayload.staffCode,
        status: mockUserPayload.status,
        type: mockUserPayload.type,
        location: mockUserPayload.location,
      },
      {
        expiresIn: '1h',
      },
    );
    expect(signAsyncSpy).toHaveBeenNthCalledWith(
      2,
      {
        username: mockUserPayload.username,
        sub: mockUserPayload.id,
        staffCode: mockUserPayload.staffCode,
        status: mockUserPayload.status,
        type: mockUserPayload.type,
        location: mockUserPayload.location,
      },
      {
        expiresIn: '7d',
      },
    );
  });
});
