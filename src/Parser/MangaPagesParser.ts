import { Page } from "puppeteer";
import { IParseResult } from "./Parser";

export default class MangaPagesParser {
    private index = 0;
    private inProgress = false;

    constructor(
        private urls: string[],
        private page: Page,
    ) {}

    get hasNext() {
        return this.index + 1 < this.urls.length;
    }

    get isInProgress() {
        return this.inProgress;
    }

    public async parse(): Promise<IParseResult> {
        this.inProgress = true;
        const url = this.urls[this.index];
        await this.page.goto(url, { waitUntil: "domcontentloaded" });

        const title = await this.getInnerText(".media-name__main");
        const altTitle = await this.getInnerText(".media-name__alt");
        const rating = Number(await this.getInnerText(".media-rating__value"));
        const votes = await this.parseVotes();
        const views = await this.parseViews();

        this.inProgress = false;
        this.index++;

        return { title, altTitle, rating, votes, views };
    }

    private async parseVotes() {
        const votesString = await this.getInnerText(".media-rating__votes");
        const votes = votesString
            .replace(/\./, "")
            .replace("K", "000");

        return Number(votes);
    }

    private async parseViews() {
        return await this.page.$$eval(".media-info-list__item", elems => {
            const desiredItem = elems.find(elem => {
                const titleElement = elem.firstElementChild;
                return titleElement.textContent === "Просмотров";
            });

            return Number(desiredItem.lastElementChild.textContent.replace(/ /g, ""));
        });
    }

    private async getInnerText(selector: string) {
        await this.page.waitForSelector(selector);
        const element = await this.page.$(selector);
        const text = await (await element.getProperty('textContent')).jsonValue();
        return text as string;
    }
}