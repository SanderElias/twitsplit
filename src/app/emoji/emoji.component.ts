import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    HostBinding,
    HostListener,
    ElementRef,
    ViewChild
} from '@angular/core';
import { UnitableService } from '../unitable.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/race';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/combineLatest';

declare var twemoji: any;

@Component({
    selector: 'app-emoji',
    templateUrl: './emoji.component.html',
    styleUrls: ['./emoji.component.css']
})
export class EmojiComponent implements OnInit {
    emojis: Observable<any>;
    groups: string[];
    subgroups: Observable<any[]>;
    @ViewChild('list') list: ElementRef;
    @ViewChild('sel') sel: ElementRef;
    @ViewChild('selsub') selsub: ElementRef;

    @Output() selected = new EventEmitter<string>();
    // @HostListener('click', ['$event'])
    onClick(ev) {
        if (ev.target.nodeName !== 'SPAN') {
            return;
        }
        this.selected.emit(ev.target.innerText);
    }

    constructor(private emoji: UnitableService) {}

    totwemoji(el) {
        console.log(el);
        twemoji.parse(el);
    }

    ngOnInit() {
        const list: HTMLDivElement = this.list.nativeElement;
        this.emoji.tokens.then(e => {
            this.groups = Array.from(this.emoji.groups.keys());
            if (list) {
                list.addEventListener('click', this.onClick.bind(this));
            }
            const tok = Observable.from(this.emoji.tokens);
            const groups = Observable.fromEvent(
                this.sel.nativeElement,
                'change'
            )
                .map((e: any) => e.target.value)
                .startWith('');
            const subgroups = Observable.fromEvent(
                this.selsub.nativeElement,
                'change'
            )
                .map((e: any) => e.target.value)
                .startWith('');

            this.subgroups = groups
                .map(group => this.emoji.groups.get(group) || new Set())
                .map(setit => [...setit]);
            // .do(e =>
            //     this.selsub.nativeElement.dispatchEvent(
            //         new UIEvent('change', {
            //             view: window,
            //             bubbles: true,
            //             cancelable: true
            //         })
            //     )
            // );

            this.emojis = Observable.combineLatest(
                tok,
                groups,
                subgroups
            ).map(a => {
                console.log(a);
                const items = a[0];
                const props: any = {};
                if (a[1]) {
                    props.group = a[1];
                }
                if (a[2]) {
                    props.subgroup = a[2];
                }
                return items.reduce((acc, item) => {
                    if (
                        Object.keys(props).every(
                            key => item[key] === props[key]
                        )
                    ) {
                        acc.push(item);
                    }
                    return acc;
                }, []);
            });
        });
        //upIt.subscribe(e => (this.emojis = Promise.resolve(e)));
    }
}
