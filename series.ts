export type Series = {
    id: string,
    name: string,
    subtitle: string,
    imageUrl: string
}

export function parseSeriesFromGraphqlReponse(series: any): Series {
    return {
        id: series.id,
        name: series.name,
        subtitle: series.subtitle,
        imageUrl: series.image3x2Url
    }
}

export function convertSeriesToRawSanityObject(series: Series): any {
    return {
        _id: series.id,
        _type: "sermonSeries",
        name: series.name,
        subtitle: series.subtitle,
        imageUrl: series.imageUrl
    }
}