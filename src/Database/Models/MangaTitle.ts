import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BaseEntity, getRepository } from "typeorm";
import { IParseResult } from "../../Parser/Parser";
import TimingParsed from "./TimingParsed";

@Entity()
export default class MangaTitle extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("text")
    title: string;

    @Column("text")
    altTitle: string;

    @OneToMany(
        () => TimingParsed, 
        timingParsed => timingParsed.mangaTitle, 
        { eager: true , cascade: true },
    )
    timingsParsed: TimingParsed[] | null;

    public static async addFromParsedResult(parsedData: IParseResult[]) {
        await Promise.all(parsedData.map(async p => {
            const timingParsed = new TimingParsed();
            timingParsed.raring = p.rating;
            timingParsed.views = p.views;
            timingParsed.votes = p.votes;
            timingParsed.date = new Date();

            await TimingParsed.save(timingParsed);

            const existTitle = await MangaTitle.findOne({ where: { 
                title: p.title, 
                altTitle: p.altTitle,
            }});

            if (!existTitle) {
                const mangaTitle = new MangaTitle();
                mangaTitle.title = p.title;
                mangaTitle.altTitle = p.altTitle;
                mangaTitle.timingsParsed = [timingParsed];
                await MangaTitle.save(mangaTitle);
            } else {
                existTitle.timingsParsed.push(timingParsed);
                await MangaTitle.save(existTitle);
            }
        }));
    }
}