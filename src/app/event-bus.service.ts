import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/filter';

export type Payload = any;
export interface EventBusMessage {
    channel: string;
    payload: Payload;
}

@Injectable()
export class EventBusService {
    public listen: Observable<Payload>;

    private next;
    constructor() {
        this.listen = new Observable(observer => {
            this.next = (payload: Payload) => observer.next(payload);
            return _ => _ /* nothing to clean */;
        });
        this.channelEmmiter = this.channelEmmiter.bind(this);
        this.emit = this.emit.bind(this);
    }

    allChannels(): Observable<EventBusMessage> {
        return this.listen;
    }

    channel(channelName: string): Observable<Payload> {
        return this.listen
            .filter(e => e.channel === channelName)
            .map(e => e.payload);
    }

    channelEmmiter(channelName) {
        console.log('made listener for', channelName);
        return (payload: Payload): void =>
            this.emit({ channel: channelName, payload });
    }

    emit({ channel, payload }: { channel: string; payload: Payload }): void {
        console.log('emit', channel);
        // make it async, as observables aren't by default.
        // it needs to be async to prevent issues with usage in life-cycle hooks
        Promise.resolve().then(() => this.next({ channel, payload }));
    }
}
