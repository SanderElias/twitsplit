import { Injectable, OnInit } from '@angular/core';
import { Jsonp, Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UnitableService implements OnInit {
    tokens: Promise<[any]>;
    constructor(private http: Http) {
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
        console.time('read file');
        const response = await this.http
            .get('/assets/emoji-test.txt')
            .toPromise();
        const txt = response.text();
        console.timeEnd('read file');
        console.time('parse');
        const lines = txt.split('\n').filter(line => line.trim() !== '');
        let group, subgroup;
        const tokens = [];
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
                const work = line.split('#');

                const [tok, ...tags] = work[1].split[' ']; // .map(tag => tag.trim().toLowerCase());

                //actual data line
                tokens.push({
                    group,
                    subgroup,
                    codepoints,
                    chr,
                    line,
                    tok,
                    tags
                });
            }
        }

        console.timeEnd('parse');

        return tokens;
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
