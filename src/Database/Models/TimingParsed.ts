import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, BaseEntity } from "typeorm";
import MangaTitle from "./MangaTitle";

@Entity()
export default class TimingParsed extends BaseEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("float")
    rating: number;

    @Column("int")
    votes: number;

    @Column("int")
    views: number;

    @Column("date")
    date: Date;

    @ManyToOne(
        () => MangaTitle, 
        mangaTitle => mangaTitle.timingsParsed,
    )
    mangaTitle: MangaTitle | null;
}