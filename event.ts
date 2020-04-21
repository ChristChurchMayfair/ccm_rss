export type Event = {
    id: string,
    name: string,
}

export function parseEventFromGraphqlReponse(event: any): Event {
    return {
        id: event.id,
        name: event.name,
    }
}

export function convertEventToRawSanityObject(event: Event): any {
    return {
        _id: event.id,
        _type: "sermonEvent",
        name: event.name,
    }
}