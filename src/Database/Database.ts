import { Connection, createConnection } from "typeorm";
import MangaTitle from "./Models/MangaTitle";
import TimingParsed from "./Models/TimingParsed";

export default class Database {
    static connection: Connection;

    static async init() {
        this.connection = await createConnection({
            type: "sqlite",
            database: "./database.db",
            synchronize: true,
            entities: [
                MangaTitle,
                TimingParsed,
            ]
        });
    }
}