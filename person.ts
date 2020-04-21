export type Person = {
    id: string,
    name: string,
}

export type SanityPerson = {
    _id: string,
    name: string,
    _type: string
}

export function parsePersonFromGraphqlReponse(person: any): Person {
    return {
        id: person.id,
        name: person.name,
    }
}

export function parsePersonFromSanityResponse(sanityPerson: SanityPerson): Person {
    return {
        id: sanityPerson._id,
        name: sanityPerson.name,
    }
}


export function convertPersonToRawSanityObject(person: Person): SanityPerson {
    return {
        _id: person.id,
        _type: "person",
        name: person.name,
    }
}