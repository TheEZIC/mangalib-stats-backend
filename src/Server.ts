import express from "express";
import MangaTitle from "./Database/Models/MangaTitle";

const app = express();
const port = 3228;

app.get("/api/getTitles", async (req, res) => {
    const mangaTitles = await MangaTitle.find({ relations: ["timingsParsed"] });

    res.json({
        status: 200,
        titles: mangaTitles, 
    }); 
});

export function startServer() {
    app.listen(port, () => console.log(`Server listening on port ${port}`));
}