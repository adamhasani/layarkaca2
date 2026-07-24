import { createRequire } from "module";
const require = createRequire(import.meta.url);
const config = require("./firebase-applet-config.json");
console.log(config);
