
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import "./index.html";

import * as $ from "jquery";

import Test1 from "./test1/script";
import Test2 from "./test2/script";
import Test3 from "./test3/script";
import Test4 from "./test4/script";
import Test5 from "./test5/script";

let currentTest: IDisposable = new Test5();

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

$("#test4").on("click", () => {
    currentTest.dispose();
    currentTest = new Test4();
});

$("#test5").on("click", () => {
    currentTest.dispose();
    currentTest = new Test5();
});