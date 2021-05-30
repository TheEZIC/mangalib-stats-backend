import Database from "./src/Database/Database";
import Parser from "./src/Parser/Parser";
import { startServer } from "./src/Server";

(async function() {
    await Database.init();
    await startServer();
    const parser = new Parser();

    const hours = null;
    const minutes = 20;
    const seconds = null;

    await parser.init();
    await parser.parse();

    setInterval(async () => {
        await parser.init();
        await parser.parse();
    }, (hours ?? 1) * (minutes ?? 60) * (seconds ?? 60) * 1e3);
})();

