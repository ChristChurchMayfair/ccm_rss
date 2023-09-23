import sanityClient from "@sanity/client";

export const ccmSanityClient = sanityClient({
    projectId: "ip162aeb",
    dataset: "production",
    useCdn: false,
});

export const sanitySermonQuery =
    '*[_type == "sermon" && url != null] | order(preachedAt desc) {..., series->, speakers[]->, event->}';
export const sanityBasicSermonQuery = '*[_type == "sermon"]';
export const sanityPeopleQuery = '*[_type == "person"]';
export const sanitySermonEventQuery = '*[_type == "sermonEvent"]';
export const sanitySermonSeriesQuery = '*[_type == "sermonSeries"]';
