const fs = require("fs");

const file = "src/App.jsx";
const source = fs.readFileSync(file, "utf8");
const updated = source.replace(/\.(png|jpg)(?=["'])/g, ".webp");
fs.writeFileSync(file, updated, "utf8");
