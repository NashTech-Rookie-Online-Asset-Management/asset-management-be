import {
  controller,
  mockResponse,
  setupTestController,
} from './config/test-setup';
import { Response } from 'express';
import { Cookies } from 'src/common/constants';

describe('AuthController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logout', () => {
    it('should clear cookies and return successful logout message', async () => {
      await controller.logout(mockResponse as Response);

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        Cookies.ACCESS_TOKEN,
      );
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(Cookies.USER);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logout successful',
      });
    });
  });
});
