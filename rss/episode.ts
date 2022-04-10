export type Episode = {
    title: string;
    mediaUrl: string;
    description: string;
    releaseDate: string;
    durationInSeconds: number;
    imageUrl?: string;
    author: string;
    customElements?: { [key: string]: string };
    keywords: string[];
    season?: number;
    embargoed?: boolean;
};
