import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { EventBusService } from '../event-bus.service';

declare var twemoji: any;

@Component({
    selector: 'app-tweet',
    templateUrl: './tweet.component.html',
    styleUrls: ['./tweet.component.css']
})
export class TweetComponent implements OnInit {
    @Input() tweet: any;
    domEl: HTMLElement;
    html = '';
    emit;

    constructor(private ek: ElementRef, private evb: EventBusService) {}

    ngOnInit() {
        if (this.ek.nativeElement) {
            this.domEl = this.ek.nativeElement;
        }
        this.html = this.parse(this.tweet);
        this.emit = this.evb.channelEmmiter('tweets');
    }

    parse(text) {
        const chars = text.split('');
        return chars.reduce((acc, char) => {
            if (char === '\n') {
                acc += '<br>';
            } else {
                acc += char;
            }
            return acc;
        }, '');
    }

    ngAfterViewInit() {
        twemoji.parse(this.domEl);
    }

    copy() {
        this.emit(this.tweet);
        copyTextToClipboard(this.tweet);
    }
}

function copyTextToClipboard(text) {
    const textArea = document.createElement('textarea');

    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
}
