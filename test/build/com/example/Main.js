const resources = require("@versusjs/resources");

const f = resources.fetchJSONResource("test", "hello.json");
const h = f["helloWorld"];

if (h != null && h == true) {
    console.log("Hello World!");
} else {
    console.log("No Hello World!");
}