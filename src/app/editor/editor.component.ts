import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UnitableService } from '../unitable.service';
import * as Lorum from 'lorem-ipsum';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
    @ViewChild('text') ta: ElementRef;
    private text: HTMLTextAreaElement;
    tweets: string[] = [];

    constructor() {}

    ngOnInit() {
        this.text = this.ta.nativeElement;
        //console.log('hi', this.ta.nativeElement, this.text);
        this.lorum();
        this.lorum();
        this.insertText('🤤😒😓😔😕🙃🤑😲☹️☹🙁😖😞😟😤');
        this.lorum();
        this.insertText('😢😭😦😧😨😩🤯😬😰');
        this.lorum();
        this.insertText('😱😳🤪😵😡😠🤬😷🤒🤕🤢🤮');
        this.lorum();
        this.insertText('🤧😇🤠🤡🤥🤫🤭🧐🤓😈👿👹👺');
        this.lorum();
        this.insertText('💀☠️☠👻👽👾🤖💩😺😸😹😻😼😽');
        this.lorum();
        this.insertText('🙀😿😾🙈🙉🙊👶👶🏻👶🏼👶🏽👶🏾👶🏿🧒🧒🏻🧒🏼🧒🏽');
        this.lorum();
        this.insertText('🧒🏾🧒🏿👦👦🏻👦🏼👦🏽👦🏾👦🏿👧👧🏻👧🏼👧');
        this.lorum();
        this.lorum();
    }

    insertText(text: string) {
        const t = this.text;
        const pos = t.selectionStart + text.length;
        const before = t.value.substring(0, t.selectionStart);
        const after = t.value.substr(t.selectionEnd);
        // console.log(t.selectionStart, t.selectionEnd, before, after);

        t.value = before + text + after;
        t.focus();
        t.selectionEnd = pos;
        this.split(this.text.value);
    }

    lorum() {
        this.insertText(Lorum({ count: 1 }) + '\n\n');
    }

    split(text) {
        // text.split('').forEach((c: string) => {
        //     if (c.charCodeAt(0) < 32) {
        //         console.log(c.charCodeAt(0));
        //     }
        // });
        const words = text.trim().split(' ');
        let last = '';
        let tweet = '';
        this.tweets.length = 0;
        while (words.length) {
            // last.split('').forEach((c: string, i) => {
            //     if (c.charCodeAt(0) < 32) {
            //         console.log(c.charCodeAt(0), i, last);
            //     }
            // });
            if (last === '---\n') {
                this.tweets.push(tweet.trim());
                tweet = '';
                last = '';
            }
            if (last && tweet.length + last.length > 130) {
                this.tweets.push(tweet.trim());
                tweet = '';
            }
            tweet += last + ' ';
            last = words.shift();
            if (last.indexOf('\n---\n') !== -1) {
                const r = last.split('\n');
                const index = r.findIndex(e => e === '---');
                const before = [];
                const after = [];
                r.forEach((e, i) => {
                    if (i < index - 1) {
                        before.push(e);
                    }
                    if (i > index) {
                        after.push(e);
                    }
                });
                console.log(before, index, after, r.length);
                last = before.join('\n');
                words.unshift('---\n', after.join('\n'));
            }
        }
        if (tweet || last) {
            this.tweets.push((tweet + last).trim());
        }
        const l = this.tweets.length;
        this.tweets = this.tweets.map((t, i) => `(${i + 1}/${l}) ${t}`);
    }
}
