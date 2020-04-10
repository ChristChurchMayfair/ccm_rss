import { format, parse } from "date-fns"
import { Episode } from "./episode"
// can't use import here because of circular dep issue in xmlbuilder. Weird.
const builder = require("xmlbuilder")

const TITLE = "Christ Church Mayfair – London:Living?"
const DESCRIPTION =
    "Hear from different London voices on their experience of uncertainty and where they find a solid hope."
const AUTHOR = "Christ Church Mayfair"
const EMAIL = "info@christchurchmayfair.org"
const MAIN_SITE = "http://christchurchmayfair.org"
const IMAGE =
    "https://s3-eu-west-1.amazonaws.com/media.christchurchmayfair.org/londonliving/LLpodcastartwork_small.jpg"
const COPYRIGHT = "Christ Church Mayfair 2019"
const DEFAULT_IMAGE =
    "https://s3-eu-west-1.amazonaws.com/media.christchurchmayfair.org/londonliving/LLpodcastartwork_small.jpg"

    const inputDateFormat: string = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"

    const formatDate = (date: Date): string => {
        return format(date, "ddd',' dd MMM yyyy HH:mm:ss xx")
    }

export const createXml = (episodes: Episode[], now: Date): string => {
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
    image.ele("link", MAIN_SITE + "/londonliving")
    channel.ele("itunes:image", { href: IMAGE })
    channel.ele("copyright", COPYRIGHT)
    channel.ele("pubDate", formatDate(now))
    channel
        .ele("itunes:category", { text: "Religion & Spirituality" })
        .ele("itunes:category", { text: "Christianity" })
    channel.ele(
        "itunes:keywords",
        "Christ Church Mayfair, CCM, London, Living, London:Living",
    )
    channel.ele("media:keywords")
    channel.ele("itunes:explicit", "no")
    channel.ele("media:rating", { scheme: "urn:simple" }, "nonadult")
    channel.ele("generator", "AWS Lambda")

    episodes.forEach(episode => {
        createItem(channel, episode)
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

const createItem = (parent: any, episode: Episode) => {
    const item = parent.ele("item")
    const seriesSynopsis = "Series Synopsis"
    item.ele("title", episode.title)
    const description = episode.description

    item.ele("description", description)
    item.ele("itunes:subtitle", description)
    item.ele("itunes:summary", description)
    item.ele("itunes:keywords", `${seriesSynopsis}`)
    item.ele("pubDate", formatDate(parse(episode.releaseDate, inputDateFormat, new Date())))
    item.ele("itunes:duration", formatDuration(episode.durationInSeconds))
    item.ele("enclosure", {
        url: episode.mediaUrl,
        length: 0,
        type: "audio/mpeg",
    })
    item.ele("guid", episode.mediaUrl)
    item.ele("link", episode.mediaUrl)
    item.ele("media:content", {
        url: episode.mediaUrl,
        medium: "audio",
        expression: "full",
        duration: episode.durationInSeconds,
    })
    item.ele("itunes:author", "Christ Church Mayfair")
    item.ele("itunes:image", {
        href: DEFAULT_IMAGE,
    })
    return item
}