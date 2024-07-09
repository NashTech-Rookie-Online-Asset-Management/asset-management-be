import { LockService } from './lock.service';

describe('LockService', () => {
  const service = new LockService();

  it('Should acquire lock', () => {
    expect(service.acquireLock('1')).toBe(true);
  });

  it('Should release lock', () => {
    service.acquireLock('2');
    service.releaseLock('2');
    expect(service.releaseLock('2')).toBeUndefined();
  });

  it('Should release lock after time out', async () => {
    (service.releaseLock as any) = jest.fn();
    service.acquireLock('3', 1);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    expect(service.releaseLock).toHaveBeenCalledWith('3');
  });
});
