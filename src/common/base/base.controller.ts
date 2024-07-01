import ActionQueue from '../structure/action-queue';

export class BaseController {
  protected actionQueue = new ActionQueue();
}
