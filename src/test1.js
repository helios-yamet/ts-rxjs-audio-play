import Rx from 'rxjs/Rx';

export default class Test1 {

    constructor() {

        var myObservable = Rx.Observable.create(observer => {
            observer.next('foo');
            setTimeout(() => observer.next('bar'), 1000);
        });
        myObservable.subscribe(value => console.log(value));
    }
}