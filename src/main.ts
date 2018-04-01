
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "./index.html";

import * as $ from "jquery";

import Test1 from "./test1/script";
import Test2 from "./test2/script";
import Test3 from "./test3/script";

let currentTest: IDisposable = new Test3();

$("#test1").on("click", () => {
    currentTest.dispose();
    currentTest = new Test1();
});

$("#test2").on("click", () => {
    currentTest.dispose();
    currentTest = new Test2();
});

$("#test3").on("click", () => {
    currentTest.dispose();
    currentTest = new Test3();
});