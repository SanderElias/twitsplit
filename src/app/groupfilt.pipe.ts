import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'groupfilt'
})
export class GroupfiltPipe implements PipeTransform {
    transform(items: any[], props: object): any {
        if (!items || !props) {
            return items;
        }
        console.log(items, props);
        return items.reduce((acc, item) => {
            if (Object.keys(props).every(key => item[key] === props[key])) {
                acc.push(item);
            }
            return acc;
        }, []);
    }
}
