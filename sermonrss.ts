import { format, parse } from "date-fns"
// can't use import here because of circular dep issue in xmlbuilder. Weird.
const builder = require("xmlbuilder")

import { Sermon } from "./sermon"

const TITLE = "Christ Church Mayfair – Podcast"
const DESCRIPTION = "Listen to recent sermons"
const AUTHOR = "Christ Church Mayfair"
const EMAIL = "info@christchurchmayfair.org"
const MAIN_SITE = "http://christchurchmayfair.org/"
const IMAGE =
    "https://s3-eu-west-1.amazonaws.com/media.christchurchmayfair.org/series-images/ccm-logo-square-large.png"
const COPYRIGHT = "(C) Christ Church Mayfair 2018"
const DEFAULT_IMAGE =
    "https://s3-eu-west-1.amazonaws.com/media.christchurchmayfair.org/series-images/series_default_new-620x400.png"


const inputDateFormat: string = "yyyy-MM-dd'T'HH:mm:ss.SSSX"

const formatDate = (date: Date): string => {
    return format(date, "ddd',' dd MMM yyyy HH:mm:ss xx")
}

export const createXml = (sermons: Array<Sermon>, now: Date): string => {
    const rss = builder.create("rss")
    rss.att({
        version: "2.0",
        "xmlns:media": "http://search.yahoo.com/mrss/",
        "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
        "xmlns:ccm": MAIN_SITE,
    })

    const channel = rss.ele("channel")
    channel.ele("title", TITLE)
    channel.ele("link", MAIN_SITE)
    channel.ele("description", DESCRIPTION)
    channel.ele("itunes:summary", DESCRIPTION)
    channel.ele("itunes:author", AUTHOR)
    const owner = channel.ele("itunes:owner")
    owner.ele("itunes:name", AUTHOR)
    owner.ele("itunes:email", EMAIL)
    channel.ele("language", "en-US")
    const image = channel.ele("image")
    image.ele("url", IMAGE)
    image.ele("title", TITLE)
    image.ele("link", MAIN_SITE)
    channel.ele("itunes:image", { href: IMAGE })
    channel.ele("copyright", COPYRIGHT)
    channel.ele("pubDate", formatDate(now))
    channel
        .ele("itunes:category", { text: "Religion & Spirituality" })
        .ele("itunes:category", { text: "Christianity" })
    channel.ele("itunes:keywords")
    channel.ele("media:keywords")
    channel.ele("itunes:explicit", "no")
    channel.ele("media:rating", { scheme: "urn:simple" }, "nonadult")
    channel.ele("generator", "AWS Lambda")

    sermons.forEach(sermon => {
        createItem(channel, sermon)
    })

    const xml = rss.end({ pretty: true })
    return xml
}

const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60

    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`

    return `${mins}:${formattedSecs}`
}

const createItem = (parent: any, sermon: Sermon) => {
    const item = parent.ele("item")
    const seriesSynopsis =
        sermon.seriesSubtitle != null
            ? `${sermon.seriesTitle}: ${sermon.seriesSubtitle}`
            : sermon.seriesTitle
    item.ele("title", sermon.title)
    const description =
        sermon.passage != null
            ? `${sermon.passage} – ${seriesSynopsis}`
            : seriesSynopsis
    item.ele("description", description)
    item.ele("itunes:subtitle", description)
    item.ele("itunes:summary", description)
    item.ele(
        "itunes:keywords",
        `Sermon, ${sermon.author}, ${sermon.event}, ${seriesSynopsis}`,
    )
    item.ele("pubDate", formatDate(parse(sermon.preachedAt, inputDateFormat, new Date())))
    item.ele("itunes:duration", formatDuration(sermon.duration))
    item.ele("enclosure", {
        url: sermon.link,
        length: 0,
        type: "audio/mpeg",
    })
    item.ele("guid", sermon.link)
    item.ele("link", sermon.link)
    item.ele("media:content", {
        url: sermon.link,
        medium: "audio",
        expression: "full",
        duration: sermon.duration,
    })
    item.ele("itunes:author", sermon.author)
    item.ele("itunes:image", {
        href: sermon.imageUrl != null ? sermon.imageUrl : DEFAULT_IMAGE,
    })
    item.ele("ccm:author", sermon.author)
    item.ele("ccm:seriesname", sermon.seriesTitle)
    item.ele("ccm:seriessubtitle", sermon.seriesSubtitle)
    item.ele("ccm:biblepassage", sermon.passage)
    item.ele("ccm:event", sermon.event)
}