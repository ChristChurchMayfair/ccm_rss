import { Episode } from "./rss/episode"

export type SanityRef = {
    _ref: string,
    _type: string
}

export type SanitySermon = {
    _id: string,
  _type: string,
  durationInSeconds: number,
  event: SanityRef,
  passages: string[],
  preachedAt: string,
  series: SanityRef
  speakers: SanityRef[],
  title: string,
  url: string
}

export type BasicSermon = {
    id: string,
    title: string,
    passage?: string,
    seriesId: string,
    preachedAt: string,
    durationInSeconds: number,
    link: string,
    authorIds: string[],
    eventId: string,
}

export function parseBasicSermonFromGraphqlReponse(sermon: any): BasicSermon | undefined {
    return {
        id: sermon.id,
        title: sermon.name,
        passage: sermon.passage,
        seriesId: sermon.series.id,
        preachedAt: sermon.preachedAt,
        durationInSeconds: sermon.duration,
        link: sermon.url,
        authorIds: sermon.speakers.map((s: any) => s.id),
        eventId: sermon.event.id
    }
}

export function convertBasicSermonToRawSanityObject(sermon: BasicSermon): any {
    return {
        _id: sermon.id,
        _type: "sermon",
        durationInSeconds: sermon.durationInSeconds,
        event: {
            _ref: sermon.eventId,
            _type: "reference"
        },
        passages: [
            sermon.passage
        ],
        preachedAt: sermon.preachedAt,
        series: {
            _ref: sermon.seriesId,
            _type: "reference"
        },
        speakers: sermon.authorIds.map(id => {
            return {
                _ref: id,
                _type: "reference"
            }
        }
        ),
        title: sermon.title,
        url: sermon.link
    }
}

export type Sermon = {
    id: string,
    title: string,
    passage?: string,
    seriesTitle: string,
    seriesSubtitle?: string,
    preachedAt: string,
    duration: number,
    link: string,
    imageUrl?: string,
    author: string,
    event: string,
}

export function parseSermonFromGraphqlReponse(sermon: any): Sermon | undefined {
    if (sermon.speakers.length === 0) {
        return undefined
    }
    return {
        id: sermon.id,
        title: sermon.name,
        passage: sermon.passage,
        seriesTitle: sermon.series.name,
        seriesSubtitle: sermon.series.subtitle || null,
        preachedAt: sermon.preachedAt,
        duration: sermon.duration,
        link: sermon.url,
        imageUrl: sermon.series.image3x2Url || null,
        author: sermon.speakers[0].name,
        event: sermon.event.name,
    }
}

export function parseSermonFromSanityResponse(sanitySermon: any): Sermon {
    return {
        id: sanitySermon.id,
        title: sanitySermon.title,
        seriesTitle: sanitySermon.series.name,
        seriesSubtitle: sanitySermon.series.subtitle,
        preachedAt: sanitySermon.preachedAt,
        duration: sanitySermon.durationInSeconds,
        link: sanitySermon.url,
        author: sanitySermon.speakers[0].name,
        event: sanitySermon.event.name
    }
}

export function convertSermonToEpisode(sermon: Sermon): Episode {

    var longSeriesTitle = sermon.seriesTitle
    if (sermon.seriesSubtitle) {
        longSeriesTitle = longSeriesTitle + ": " + sermon.seriesSubtitle
    }

    var description = longSeriesTitle
    if (sermon.passage) {
        description = sermon.passage + " – " + description
    }

    let customElements: { [key: string]: string; } = {
        "ccm:author": sermon.author,
        "ccm:seriesname": sermon.seriesTitle,
    }

    if (sermon.seriesSubtitle) {
        customElements['ccm:seriessubtitle'] = sermon.seriesSubtitle
    }

    if (sermon.passage) {
        customElements["ccm:biblepassage"] = sermon.passage
    }
    customElements['ccm:event'] = sermon.event

    return {
        title: sermon.title,
        mediaUrl: sermon.link,
        description: description,
        imageUrl: sermon.imageUrl,
        author: sermon.author,
        durationInSeconds: sermon.duration,
        releaseDate: sermon.preachedAt,
        keywords: ["Sermon", sermon.author, sermon.event, longSeriesTitle],
        customElements: customElements
    }
}