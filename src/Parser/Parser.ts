import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { translatorURL } from "../../config.json";
import MangaTitle from "../Database/Models/MangaTitle";
import MangaPagesParser from "./MangaPagesParser";

export interface IParseResult {
    title: string;
    altTitle: string;
    rating: number;
    votes: number;
    views: number;
}

export default class Parser {
    browser: Browser;
    page: Page;

    async init() {
        puppeteer.use(StealthPlugin());
        this.browser = await puppeteer.launch({
            //@ts-ignore
            headless: true,
            defaultViewport: {
                width: 1280,
                height: 720,
            }
        });
        this.page = await this.createPage();
    }

    private async createPage() {
        const page = await this.browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36");
        return page;
    }

    async parse() {
        console.log(`Start parsing mangalib at ${new Date().toTimeString()}`);
        await this.page.goto(translatorURL, { waitUntil: "domcontentloaded" });
        await this.autoScrollDown();

        let mangaUrls: string[] = await this.page.$$eval(".media-card", elems => elems.map(elem => elem.getAttribute("href")));
        mangaUrls = mangaUrls.map(url => !url.startsWith("https://mangalib.me") ? `https://mangalib.me${url}` : url);

        const MangaPageParser = new MangaPagesParser(mangaUrls, this.page);

        let result: IParseResult[] = [];

        while (MangaPageParser.hasNext) {
            if (MangaPageParser.isInProgress) {
                continue;
            }

            const data = await MangaPageParser.parse();
            result.push(data);
        }
        
        await MangaTitle.addFromParsedResult(result);
        console.log(`Finish parsing mangalib at ${new Date().toTimeString()}`);
    }

    private async autoScrollDown() {
        await this.page.evaluate(async () => {
            return await new Promise(resolve => {
                let totalHeight = 0;
                let distance = 100;
                let timer = setInterval(() => {
                    let { scrollHeight } = document.body;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        resolve(true);
                    }
                }, 20);
            })
        });
    }
}