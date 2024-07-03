import { Injectable } from '@nestjs/common';

@Injectable()
export class LockService {
  private locks: Map<string, NodeJS.Timeout> = new Map();

  acquireLock(resourceId: string, timeout: number = 3): boolean {
    if (this.locks.has(resourceId)) {
      return false;
    }
    const timer = setTimeout(() => {
      this.releaseLock(resourceId);
    }, timeout * 1000);
    this.locks.set(resourceId, timer);
    return true;
  }

  releaseLock(resourceId: string): void {
    const timer = this.locks.get(resourceId);
    if (timer) {
      clearTimeout(timer);
    }
    this.locks.delete(resourceId);
  }
}
