import { Injectable, OnInit, NgZone } from '@angular/core';
import { Jsonp, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import * as idbk from 'idb-keyval';

export interface Token {
    group: string;
    subgroup: string;
    codepoints: string[];
    chr: string;
    tok: string;
    tags: string[];
    twemojiData?: string;
}
@Injectable()
export class UnitableService implements OnInit {
    tokens: Promise<Token[]>;
    tags: Set<string>;
    groups: Map<string, Set<string>>;
    constructor(private http: Http, private zone: NgZone) {
        this.tokens = this.ngOnInit();
    }

    async ngOnInit() {
        // const s = document.createElement('script');
        // s.type = 'text/template';
        // s.src = 'http://unicode.org/Public/emoji/5.0/emoji-sequences.txt';
        // s.addEventListener('load', (...args) => {
        //     console.log(args, s);
        // });
        // document.head.appendChild(s);
        // tslint:disable:no-console
        // console.time('read file');
        const txt = await this.load();
        // console.timeEnd('read file');
        // console.time('parse');
        const tokens = this.parseUnicdeText(txt);
        // console.timeEnd('parse');
        // console.time('groupify');
        const { tags, groups } = this.groupify(tokens);
        this.tags = tags;
        this.groups = groups;
        // console.timeEnd('groupify');
        this.loadTwitdata(tokens).then(() => console.log('done loading twit'));
        return tokens;
    }

    parseUnicdeText(txt): Token[] {
        const lines = txt.split('\n').filter(line => line.trim() !== '');
        const tokens: Token[] = [];
        let group, subgroup;
        let errs = 0;
        for (let i = 0; i < lines.length; i += 1) {
            const line = lines[i].trim();
            try {
                parseLine(line);
            } catch (e) {
                console.log(++errs, i, line);
                // dummy, just ignore failed lines, we might miss a single emoji
            }
        }
        return tokens;

        function parseLine(line) {
            if (line.startsWith('# group:')) {
                group = line.split(':').map(i => i.trim())[1];
                return;
            }
            if (line.startsWith('# subgroup:')) {
                subgroup = line.split(':').map(i => i.trim())[1];
                return;
            }
            if (!line.startsWith('#')) {
                const codepoints = line
                    .split(';')[0]
                    .trim()
                    .split(' ')
                    .map(point => parseInt(point.trim(), 16));
                const chr = String.fromCodePoint(...codepoints);
                const work = line
                    .split('#')
                    .map(w => w.trim())[1]
                    .split(' ')
                    .map(t => t.trim().toLowerCase());
                const tok = work.shift();
                const tags = work;

                tokens.push({
                    group,
                    subgroup,
                    codepoints,
                    chr,
                    tok,
                    tags
                });
            }
        }
    }

    groupify(tokens) {
        const tags = new Set();
        const groups = tokens.reduce((acc, token) => {
            token.tags.forEach(t => tags.add(t));
            acc.has(token.group)
                ? acc.get(token.group).add(token.subgroup)
                : acc.set(token.group, new Set([token.subgroup]));
            return acc;
        }, new Map());
        return { tags, groups };
    }

    async load() {
        const response = await this.http
            .get('/assets/emoji-test.txt')
            .toPromise();
        return response.text();
    }

    loadTwitdata(tokens) {
        const self = this;
        const fails = JSON.parse(localStorage.getItem('failedUrls') || '[]');
        return self.zone.runOutsideAngular(loadIt);
        // return;

        async function loadIt() {
            for (const token of tokens) {
                try {
                    await self.loadIcon(token, fails);
                } catch (e) {
                    // console.log(' loading', e);
                    localStorage.setItem('failedUrls', JSON.stringify(fails));
                }
            }
            console.log('keys', idbk.keys());
        }
    }

    loadIcon(token: Token, fails: string[]) {
        const bases = {
            base: 'https://twemoji.maxcdn.com/2/',
            ext: '.png',
            size: '72x72'
        };
        const iconIndentifier = grabTheRightIcon(token.chr);

        return new Promise(async (resolve, reject) => {
            const icondata: string = (await idbk.get(
                iconIndentifier
            )) as string;
            if (icondata) {
                token.twemojiData = icondata;
                return resolve('');
            }
            window.requestAnimationFrame(() => {
                if (!iconIndentifier || fails.includes(iconIndentifier)) {
                    return resolve('');
                }
                const img: HTMLImageElement = document.createElement('img');
                img.crossOrigin = 'anonymous';
                img.addEventListener('load', () => {
                    try {
                        const canvas: HTMLCanvasElement = document.createElement(
                            'canvas'
                        );
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        canvas.getContext('2d').drawImage(img, 0, 0);
                        token.twemojiData = canvas.toDataURL();
                        // console.log('loaded, and put in DB', iconIndentifier);
                        idbk.set(iconIndentifier, token.twemojiData);
                        // .then(
                        //     () => console.log('It worked!'),
                        //     err => console.log('It failed!', err)
                        // );
                    } catch (e) {
                        // console.error(e);
                        resolve('');
                    }
                });
                img.addEventListener('error', () => {
                    fails.push(iconIndentifier);
                    reject();
                });
                img.src = defaultImageSrcGenerator(iconIndentifier, bases);
            });
        });

        function defaultImageSrcGenerator(icon, options) {
            return ''.concat(
                options.base,
                options.size,
                '/',
                icon,
                options.ext
            );
        }
        function grabTheRightIcon(rawText) {
            const UFE0Fg = /\uFE0F/g,
                U200D = String.fromCharCode(8205);
            return toCodePoint(
                rawText.indexOf(U200D) < 0
                    ? rawText.replace(UFE0Fg, '')
                    : rawText
            );
        }
        function toCodePoint(unicodeSurrogates, sep = '-') {
            let r = [],
                c = 0,
                p = 0,
                i = 0;
            while (i < unicodeSurrogates.length) {
                c = unicodeSurrogates.charCodeAt(i++);
                if (p) {
                    // tslint:disable-next-line:no-bitwise
                    r.push(
                        (65536 + ((p - 55296) << 10) + (c - 56320)).toString(16)
                    );
                    p = 0;
                } else if (55296 <= c && c <= 56319) {
                    p = c;
                } else {
                    r.push(c.toString(16));
                }
            }
            return r.join(sep);
        }
    }
}

// const response = await this.http
// .get('/assets/emoji-sequences.txt')
// .toPromise();
// const txt = response.text();
// console.timeEnd('read file');
// console.time('parse');
// const tokens = txt
// .split('\n')
// .filter(line => line.trim() !== '')
// .filter(line => !line.trim().startsWith('#'))
// .map(line => {
//     const parts = line.split(';');
//     const codepoints = parts[0]
//         .trim()
//         .split(' ')
//         .map(point => parseInt(point.trim(), 16));
//     const chr = String.fromCodePoint(...codepoints);
//     const [description, comments] = parts[2]
//         .split('#')
//         .map(i => i.trim());
//     return {
//         codepoints,
//         type: parts[1].trim(),
//         description,
//         comments,
//         chr
//     };
// });
// console.timeEnd('parse');
