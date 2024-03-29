import {
    parseSermonFromSanityResponse,
    convertSermonToEpisode,
} from "./sermon";
import { createXml, writeEpisodesToFile } from "./rss/rss";

import { ccmSanityClient, sanitySermonQuery } from "./ccm_sanity_client";

import { RemoveAndRecreateDirectory, writeToFile } from "./fileFunctions";
import {
    NetlifyRedirect,
    netlifyRedirectFilename,
    NetlifyRedirectToString,
} from "./netlifyRedirects";

import londonLivingRssConfig from "./config/londonliving.rssConfig.json";
import LondonLivingData from "./config/londonLiving.episodes.json";
import ccmSermonsRssConfig from "./config/sermons.rssConfig.json";

// Setup publish directory
const publishDirectory = "./public";
RemoveAndRecreateDirectory(publishDirectory);

// Set up and write netlify redirects
const netlifyRedirects: NetlifyRedirect[] = [
    { from: "/", to: "/sermons.xml", status: 200 },
    { from: "/londonliving", to: "/londonliving.xml", status: 200 },
];
writeToFile(
    netlifyRedirects.map(NetlifyRedirectToString).join("\n"),
    publishDirectory,
    netlifyRedirectFilename
);

// Create London Living RSS
const londonLivingXml = createXml(
    LondonLivingData,
    new Date(),
    londonLivingRssConfig
);
writeToFile(londonLivingXml, publishDirectory, "londonliving.xml");

// Create sermons RSS from Sanity
ccmSanityClient
    .fetch(sanitySermonQuery)
    .then((result) => result.filter((obj:any) => obj.url !== undefined).map(parseSermonFromSanityResponse))
    .then((sermons) => sermons.map(convertSermonToEpisode))
    .then((episodes) =>
        writeEpisodesToFile(
            ccmSermonsRssConfig,
            episodes,
            publishDirectory,
            "sermons.xml"
        )
    )
    .catch((error) => {
        console.log("There was an error fetching the sermon data from sanity");
        console.log(error)
        process.exit(1); // Exit with non zero error code to indicate this should not be published.
    });
