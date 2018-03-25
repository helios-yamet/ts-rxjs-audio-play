import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.html";

document.getElementById("test1")!.onclick = () => {
    document.getElementById("content")!.innerHTML = "";
    console.log("Test 1");
};

document.getElementById("test2")!.onclick = () => {
    document.getElementById("content")!.innerHTML = "";
    console.log("Test 2");
};

document.getElementById("test3")!.onclick = () => {
    document.getElementById("content")!.innerHTML = "";
    console.log("Test 3");
};

document.getElementById("test4")!.onclick = () => {
    document.getElementById("content")!.innerHTML = "";
    console.log("Test 4");
};

document.getElementById("test4")!.click();