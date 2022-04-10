import { Episode } from "./rss/episode";

type SanityRef = {
    _ref: string;
    _type: string;
};

type SanitySermon = {
    _id: string;
    _type: string;
    durationInSeconds?: number;
    event?: {
        name: string;
    };
    passages?: string[];
    preachedAt: string;
    series?: {
        name: string;
        subtitle?: string;
        imageUrl?: string;
    };
    speakers?: {
        name: string;
        jobTitle?: string;
    }[];
    title: string;
    url: string;
};

export type Sermon = {
    title: string;
    passages: string[];
    series: {
        title: string;
        subtitle: string | null;
    } | null;
    preachedAt: string;
    duration: number | null;
    link: string;
    speakers: { name: string; jobTitle: string | null }[];
    event: string | null;
};

export function parseSermonFromSanityResponse(
    sanitySermon: SanitySermon
): Sermon {
    return {
        title: sanitySermon.title,
        series:
            sanitySermon.series != null
                ? {
                      title: sanitySermon.series.name,
                      subtitle: sanitySermon.series.subtitle ?? null,
                  }
                : null,
        preachedAt: sanitySermon.preachedAt,
        duration: sanitySermon.durationInSeconds ?? null,
        link: sanitySermon.url,
        speakers:
            sanitySermon.speakers?.map((s) => {
                return {
                    name: s.name,
                    jobTitle: s.jobTitle ?? null,
                };
            }) ?? [],
        event: sanitySermon.event?.name ?? null,
        passages: sanitySermon.passages ?? [],
    };
}

export function convertSermonToEpisode(sermon: Sermon): Episode {
    const longSeriesTitle = ((): string | null => {
        if (sermon.series == null) {
            return null;
        }
        if (sermon.series.subtitle != null) {
            return `${sermon.series.title}: ${sermon.series.subtitle}`;
        }
        return sermon.series.title;
    })();
    const passageSummary =
        sermon.passages.length > 0 ? sermon.passages.join(", ") : null;
    const speakerSummary =
        sermon.speakers.length > 0
            ? sermon.speakers
                  .map((s) => {
                      if (s.jobTitle != null) {
                          return `${s.name} (${s.jobTitle})`;
                      }
                      return s.name;
                  })
                  .join(", ")
            : null;

    const description = joinNonNullish(
        [
            joinNonNullish([speakerSummary, sermon.event], " – "),
            longSeriesTitle,
            passageSummary, // already in episode title so doesn't need to be prominent
        ],
        "\n"
    );

    const customElements = (() => {
        const dict: Record<string, string> = {};

        if (speakerSummary != null) {
            dict["ccm:author"] = speakerSummary;
        }

        if (sermon.series != null) {
            dict["ccm:seriesname"] = sermon.series.title;

            if (sermon.series.subtitle != null) {
                dict["ccm:seriessubtitle"] = sermon.series.subtitle;
            }
        }

        if (passageSummary != null) {
            dict["ccm:biblepassage"] = passageSummary;
        }

        if (sermon.event != null) {
            dict["ccm:event"] = sermon.event;
        }
        return dict;
    })();

    const title = (() => {
        if (passageSummary == null) {
            return sermon.title;
        }
        if (
            passageSummary.toLocaleLowerCase() ===
            sermon.title.toLocaleLowerCase()
        ) {
            // Occasionally they are identical. While it'd be better to fix
            // the underlying data, this isn't always practical so this is
            // a reasonable compromise.
            return sermon.title;
        }
        return `${sermon.title} – ${passageSummary}`;
    })();
    return {
        title,
        mediaUrl: sermon.link,
        description,
        author: speakerSummary ?? "Christ Church Mayfair",
        durationInSeconds: sermon.duration ?? 1800, // default to 30 mins if we don't know
        releaseDate: sermon.preachedAt,
        keywords: [
            "Sermon",
            sermon.speakers.map((s) => s.name).join(", "),
            sermon.event,
            longSeriesTitle,
        ].filter((a): a is string => a != null && a !== ""),
        customElements,
    };
}

function joinNonNullish(
    strings: (string | null | undefined)[],
    separator: string
): string {
    return strings.filter(Boolean).join(separator);
}
