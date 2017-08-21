import { Component, OnInit } from '@angular/core';
import { EventBusService } from './event-bus.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'app';
    lastTweetCopied$ = this.evb.channel('tweets');
    constructor(private evb: EventBusService) {}
}
