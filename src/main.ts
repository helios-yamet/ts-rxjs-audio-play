import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.html";
import Test1 from "./test1";

document.getElementById("test1")!.onclick = () => {
    document.getElementById("content")!.innerHTML = "";
    var test1: Test1 = new Test1();
};

document.getElementById("test2")!.onclick = () => {
    document.getElementById("content")!.innerHTML = "";
};

document.getElementById("test3")!.onclick = () => {
    document.getElementById("content")!.innerHTML = "";
};

document.getElementById("test4")!.onclick = () => {
    document.getElementById("content")!.innerHTML = "";
};

document.getElementById("test1")!.click();