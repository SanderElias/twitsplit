import { Component, OnInit } from '@angular/core';
import { UnitableService } from '../unitable.service';

@Component({
    selector: 'app-emoji',
    templateUrl: './emoji.component.html',
    styleUrls: ['./emoji.component.css']
})
export class EmojiComponent implements OnInit {
    emojis = this.emoji.tokens;

    constructor(private emoji: UnitableService) {}

    ngOnInit() {
        this.emojis.then(e => {
            console.log(e);
        });
    }
}
