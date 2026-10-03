// npm run down — stop every process holding the benchmark site's ports or binaries.
import { stopSite } from "./lib/umbraco.mjs";

const pids = stopSite();
console.log(pids.length ? `Stopped Umbraco (pids ${pids.join(", ")})` : "Umbraco was not running");
