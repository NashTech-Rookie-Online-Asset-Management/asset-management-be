import { mockUserPayload } from '../services/config/mock-data';
import { controller, setupTestController } from './config/test-setup';

describe('AuthController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const result = await controller.getUser({ user: mockUserPayload });
      expect(result).toEqual(mockUserPayload);
    });
  });
});
