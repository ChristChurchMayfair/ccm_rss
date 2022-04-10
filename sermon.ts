import { Episode } from "./rss/episode"

type SanityRef = {
    _ref: string,
    _type: string
}

type SanitySermon = {
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

type BasicSermon = {
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

    const title = (() => {
        if (sermon.passage != null) {
            return `${sermon.passage} – ${sermon.title}`
        }
        return sermon.title
    })()
    return {
        title,
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
