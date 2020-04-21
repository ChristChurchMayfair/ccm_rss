import fetch from 'node-fetch'
import ApolloClient from "apollo-client"
import { createHttpLink } from "apollo-link-http"
import { InMemoryCache } from "apollo-cache-inmemory"
import gql from 'graphql-tag'

export const GRAPHQL_ENDPOINT = "https://api.graph.cool/simple/v1/cjkqvvoxy2pyy0175cdmdy1mz"

export const graphqlClient = new ApolloClient({
    link: createHttpLink({
        uri: GRAPHQL_ENDPOINT,
        fetch: fetch as any
    }),
    cache: new InMemoryCache(),
})

export const speakersQuery = gql`
    query {
        allSpeakers {
          id,
          name
        }
      }
`

export const eventsQuery = gql`

    query {
        allEvents {
          id,
          name
        }
    }
`

export const seriesQuery = gql`

    query {
        allSeries {
          id,
          name,
          subtitle,
          image3x2Url
        }
      }
`

export const sermonsQuery = gql`
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
`

export const basicSermonsQuery = gql`
query {
    allSermons(orderBy: preachedAt_DESC) {
        id
        name
        series {id}
        preachedAt
        speakers {id}
        passage
        duration
        url
        event {id}
    }
}
`