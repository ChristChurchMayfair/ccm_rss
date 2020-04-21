import { format, parse } from "date-fns"
import { Episode } from "./episode"
import { writeToFile } from "../fileFunctions"
// can't use import here because of circular dep issue in xmlbuilder. Weird.
const builder = require("xmlbuilder")

const inputDateFormat: string = "yyyy-MM-dd'T'HH:mm:ss.SSSX"

const formatDate = (date: Date): string => {
    return format(date, "EEE',' dd MMM yyyy HH:mm:ss xx")
}

export type RssChannelConfig = {
    title: string,
    description: string,
    author: string,
    email: string,
    mainSiteUrl: string
    imageUrl: string,
    copyright: string,
    defaultEpisodeImageUrl: string
    category: {
        major: string,
        sub?: string
    }
    explicit: boolean
    rating: string
    generator: string
    language: string
    keywords?: string[],
    customNamespace?: {
        name: string,
        url: string
    }
}

export function writeEpisodesToFile(config: RssChannelConfig, episodes: Episode[], targetDirectory: string, filename: string) {
    const xml = createXml(episodes, new Date(), config);
    writeToFile(xml, targetDirectory, filename)
}

export const createXml = (episodes: Episode[], now: Date, config: RssChannelConfig): string => {

    const rss = builder.create("rss")
    const rssAttributes: any = {
        version: "2.0",
        "xmlns:media": "http://search.yahoo.com/mrss/",
        "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
    }
    if (config.customNamespace) {
        rssAttributes[config.customNamespace.name] = config.customNamespace.url
    }
    rss.att(rssAttributes)

    const channel = rss.ele("channel")
    channel.ele("title", config.title)
    channel.ele("link", config.mainSiteUrl)
    channel.ele("description", config.description)
    channel.ele("itunes:summary", config.description)
    channel.ele("itunes:author", config.author)

    const owner = channel.ele("itunes:owner")
    owner.ele("itunes:name", config.author)
    owner.ele("itunes:email", config.email)

    channel.ele("language", config.language)

    const image = channel.ele("image")
    image.ele("url", config.imageUrl)
    image.ele("title", config.title)
    image.ele("link", config.mainSiteUrl)

    channel.ele("itunes:image", { href: config.imageUrl })
    channel.ele("copyright", config.copyright)
    channel.ele("pubDate", formatDate(now))

    const category = channel.ele("itunes:category", { text: config.category.major })
    if (config.category.sub) {
        category.ele("itunes:category", { text: config.category.sub })
    }

    if (config.keywords) {
        const keywordsString = config.keywords.join(", ")
        channel.ele("itunes:keywords", keywordsString)
        channel.ele("media:keywords", keywordsString)
    } else {
        channel.ele("itunes:keywords")
        channel.ele("media:keywords")
    }
    channel.ele("itunes:explicit", config.explicit ? "yes" : "no")
    channel.ele("media:rating", { scheme: "urn:simple" }, config.rating)
    channel.ele("generator", config.generator)

    episodes.forEach(episode => {
        createItem(channel, episode, config)
    })

    const xml = rss.end({ pretty: true })
    return xml
}

const formatDuration = (durationInSeconds: number) => {
    const mins = Math.floor(durationInSeconds / 60)
    const secs = durationInSeconds % 60

    const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`

    return `${mins}:${formattedSecs}`
}

const createItem = (parent: any, episode: Episode, config: RssChannelConfig) => {
    const item = parent.ele("item")
    item.ele("title", episode.title)

    item.ele("description", episode.description)
    item.ele("itunes:subtitle", episode.description)
    item.ele("itunes:summary", episode.description)
    item.ele("itunes:keywords", episode.keywords.join(", "))
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
    item.ele("itunes:author", episode.author)
    item.ele("itunes:image", {
        href: episode.imageUrl != null ? episode.imageUrl : config.defaultEpisodeImageUrl,
    })

    for (let key in episode.customElements) {
        const value = episode.customElements[key];
        item.ele(key, value)
    }
}