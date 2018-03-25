import * as Rx from "rxjs/Rx";
import * as template from "!raw-loader!./test1.html";

export default class Test1 {

    constructor() {

        let content: string = document.getElementById("content")!.innerHTML = template;

        Rx.Observable.fromEvent(document, "mousemove")
            .throttleTime(100)
            .scan((count: number) => count + 2, 0)
            .subscribe(count => console.log(`Mouse moved ${count} times`));
    }
}