import { graphqlClient, speakersQuery, eventsQuery, seriesQuery, basicSermonsQuery } from "./ccm_graphql_client"
import { parseBasicSermonFromGraphqlReponse, convertBasicSermonToRawSanityObject, BasicSermon, parseSermonFromSanityResponse, SanitySermon } from "./sermon"
import { parsePersonFromGraphqlReponse, convertPersonToRawSanityObject, Person, parsePersonFromSanityResponse, SanityPerson } from "./person"
import { writeToFile, RemoveAndRecreateDirectory } from "./fileFunctions"
import { parseEventFromGraphqlReponse, convertEventToRawSanityObject } from "./event"
import { parseSeriesFromGraphqlReponse, convertSeriesToRawSanityObject, Series } from "./series"
import { ccmSanityClient, sanitySermonQuery, sanityPeopleQuery } from "./ccm_sanity_client"

console.log("Exporting CCM Sermon data from Graphcool for import to sanity.io")
console.log()

const exportDirectory = "./export"
console.log(`Removing and recreating directory: ${exportDirectory}`)
RemoveAndRecreateDirectory(exportDirectory)
console.log()

function convertObjectsToNdjson(objects: object[]): string {
    return objects.map((o) => JSON.stringify(o)).join("\n")
}

let items: any[] = []
let people: SanityPerson[] = []
let events: Event[] = []
let series: Series[] = []
let sermons: SanitySermon[] = []

let sanityPeople: Person[] = []

const sanityPeopleFetch = ccmSanityClient.fetch(sanityPeopleQuery)
    .then(result => {
        sanityPeople = result.map(parsePersonFromSanityResponse)
    })
    .catch((error) => {
        console.log("There was an error fetching the sermon data from sanity")
        process.exit(1) // Exit with non zero error code to indicate this should not be published.
    })

console.log("Fetching speakers")
const speakersFetch = graphqlClient.query({ query: speakersQuery })
    .then((result) => result.data.allSpeakers.map(parsePersonFromGraphqlReponse).map(convertPersonToRawSanityObject))
    .then((rawSanityObjects) => {
        people = rawSanityObjects
    })
    .catch((error) => {
        console.log("There was an error fetching the sermon data from graphcool")
        process.exit(1) // Exit with non zero error code to indicate this should not be published.
    })

console.log("Fetching events")
const eventsFetch = graphqlClient.query({ query: eventsQuery })
    .then((result) => result.data.allEvents.map(parseEventFromGraphqlReponse).map(convertEventToRawSanityObject))
    .then((rawSanityObjects) => {
        events = rawSanityObjects
    })
    .catch((error) => {
        console.log("There was an error fetching the sermon data from graphcool")
        process.exit(1) // Exit with non zero error code to indicate this should not be published.
    })

console.log("Fetching series")
const seriesFetch = graphqlClient.query({ query: seriesQuery })
    .then((result) => result.data.allSeries.map(parseSeriesFromGraphqlReponse).map(convertSeriesToRawSanityObject))
    .then((rawSanityObjects) => {
        series = rawSanityObjects
    })
    .catch((error) => {
        console.log("There was an error fetching the sermon data from graphcool")
        process.exit(1) // Exit with non zero error code to indicate this should not be published.
    })

console.log("Fetching sermons")
const sermonFetch = graphqlClient.query({ query: basicSermonsQuery })
    .then((result) => result.data.allSermons
        .map(parseBasicSermonFromGraphqlReponse)
        .map(convertBasicSermonToRawSanityObject)
    )
    .then((rawSanityObjects) => {
        sermons = rawSanityObjects
    })
    .catch((error) => {
        console.log("There was an error fetching the sermon data from graphcool")
        console.log(error)
        process.exit(1) // Exit with non zero error code to indicate this should not be published.
    })

const importInstructions = `To import this data into sanity.io do the following:

1. Ensure you have an account in the CCM sanity project. Ask tom@christchurchmayfair.org for one.

2. Checkout the CCM Content repo: git clone git@github.com:ChristChurchMayfair/ccm_content_sanity_studio.git

3. From the root of the CCM Content repo: sanity dataset import [path to ndjson file] [dataset name]

    - You will need to run this command for the following export files: speakers, events, series, sermons

    - You will need to choose the right dataset: test or production`

Promise.all([sermonFetch, seriesFetch, eventsFetch, speakersFetch, sanityPeopleFetch]).then(() => {
    console.log()
    console.log("All exports completed.")

    type mapping = {
        from: string,
        to: string,
        name: string
    }

    const peopleMapping = people.map((person) => {
        const matchingPeople = sanityPeople.filter((sanityPerson) => sanityPerson.name === person.name)
        if (matchingPeople.length === 1) {
            return {name: person.name, from: person._id, to: matchingPeople[0].id}
        } else {
            return {name: person.name, from: person._id, to: person._id}
        }
    }).filter((pm) => pm.from !== pm.to)
    .reduce((map:{[from: string]: mapping}, obj:any) => {
        map[obj.from] = obj;
        return map;
    }, {});

    console.log(peopleMapping)

    sermons = sermons.map((sermon) => {
        console.log(sermon)
        sermon.speakers = sermon.speakers.map((speaker) => {
            if (peopleMapping[speaker._ref]) {
                return {_ref: peopleMapping[speaker._ref].to, _type: "reference"}
            } else {
                return speaker
            }
        })
        return sermon
    })

    console.log(sermons.map((sermon) => sermon.speakers))

    items = items.concat(sermons)
    items = items.concat(events)
    items = items.concat(people)
    items = items.concat(series)

    writeToFile(convertObjectsToNdjson(items), exportDirectory, "export.ndjson")

    console.log()
    console.log(importInstructions)
    console.log()
})