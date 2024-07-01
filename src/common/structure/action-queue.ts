import { BadRequestException } from '@nestjs/common';
import {
  Subject,
  catchError,
  concatMap,
  first,
  firstValueFrom,
  from,
  map,
  of,
} from 'rxjs';
import { v4 } from 'uuid';

type Event = {
  rqid: string;
  action: () => Promise<any>;
};

export default class ActionQueue {
  private queue = new Subject<Event>();
  private results = new Subject<any>();

  constructor() {
    this.queue
      .pipe(
        concatMap((event) =>
          from(event.action()).pipe(
            map((data) => ({ rqid: event.rqid, data })),
            catchError((error) => of({ rqid: event.rqid, error })),
          ),
        ),
      )
      .subscribe((value) => this.results.next(value));
  }

  public createEvent(action: () => Promise<any>): Event {
    return {
      rqid: v4(),
      action,
    };
  }

  public push(event: Event) {
    this.queue.next(event);
  }

  public async wait(rqid: string) {
    const result = await firstValueFrom(
      this.results.pipe(first((value) => value.rqid === rqid)),
    );

    if (result?.error) {
      throw new BadRequestException(result.error);
    }

    return result.data;
  }
}
