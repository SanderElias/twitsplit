import { Component, OnInit } from '@angular/core';
import { UnitableService } from '../unitable.service';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    tweets: string[] = [];

    constructor() {}

    ngOnInit() {}

    split(text) {
        const words = text.split(' ');
        let last = '';
        let tweet = '';
        this.tweets.length = 0;
        while (words.length) {
            if (last && tweet.length + last.length > 130) {
                this.tweets.push(tweet.trim());
                tweet = '';
            }
            tweet += last + ' ';
            last = words.shift();
        }
        if (tweet || last) {
            this.tweets.push((tweet + last).trim());
        }
        const l = this.tweets.length;
        this.tweets = this.tweets.map((t, i) => `(${i + 1}/${l}) ${t}`);
    }
}
