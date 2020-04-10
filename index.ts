import fetch from 'node-fetch'
import ApolloClient from "apollo-client"
import { createHttpLink } from "apollo-link-http"
import { InMemoryCache } from "apollo-cache-inmemory"
import gql from "graphql-tag"
import { Sermon } from "./sermon"
import { createXml } from "./sermonrss"

import { createXml as createLondonLivingXml } from "./londonlivingrss"
import { Episode } from './episode'

import LondonLivingData from './londonLivingEpisodeData.json'
import { RemoveAndRecreateDirectory, writeToFile } from './fileFunctions'
import { NetlifyRedirect, netlifyRedirectFilename } from './netlifyRedirects'

const GRAPHQL_ENDPOINT = "https://api.graph.cool/simple/v1/cjkqvvoxy2pyy0175cdmdy1mz"

const parseSermon = (sermon: any): Sermon | undefined => {
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
        imageUrl: sermon.series["image3x2Url"] || null,
        author: sermon.speakers[0].name,
        event: sermon.event.name,
    }
}

const graphqlClient = new ApolloClient({
    link: createHttpLink({
        uri: GRAPHQL_ENDPOINT,
        fetch: fetch as any
    }),
    cache: new InMemoryCache(),
})
const graphqlSermonsResult = graphqlClient.query({
    query: gql`
            query {
                allSermons(orderBy: preachedAt_DESC) {
                    id
                    name
                    series {
                        name
                        subtitle
                        image3x2Url
                    }
                    preachedAt
                    speakers {
                        name
                    }
                    passage
                    duration
                    url
                    event {
                        name
                    }
                }
            }
        `,
})



function generateXml(): string {
    const episodes: Episode[] = LondonLivingData
    return createLondonLivingXml(episodes, new Date())
}

const publishDirectory = "./public"

RemoveAndRecreateDirectory(publishDirectory)

var netlifyRedirects: NetlifyRedirect[] = [
    { from: '/', to: '/sermons.xml', status: 200 },
    { from: '/londonLiving', to: '/londonLiving.xml', status: 200 }
]

writeToFile(netlifyRedirects.map(toString).join("\n"), publishDirectory, netlifyRedirectFilename)

const londonLivingXml = generateXml();
writeToFile(londonLivingXml, publishDirectory, londonLivingXml);

graphqlSermonsResult.then((result) => {
    const sermons = result.data.allSermons.map((s: any) => parseSermon(s))
    const xml = createXml(sermons, new Date())
    writeToFile(xml, publishDirectory, "sermons.xml")
}).catch((error) => {
    console.log("There was an error fetching the sermon data from graphcool")
    process.exit(1) //Exit with non zero error code to indicate this should not be published.
})






