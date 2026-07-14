export interface FilterRow {
    id: string;
    subject: FilterSubject;
    operator: FilterOperator;
    referent: string | string[];
    serialize: () => Record<string, string | string[]>;
}

export type FilterOperator =
    | "equals"
    | "is_any_of"
    | "before"
    | "after"
    | "strictly_before"
    | "strictly_after"
    | "gte"
    | "gt"
    | "lte"
    | "lt";

export interface FilterSubject {
    key: string;
    type: "string" | "date" | "number";
    compatibleOperators: FilterOperator[];
}

const filterSubjects: Record<string, FilterSubject> = {
    title: {
        key: "title",
        type: "string",
        compatibleOperators: ["equals"],
    },
    subtitle: {
        key: "subtitle",
        type: "string",
        compatibleOperators: ["equals"],
    },
    description: {
        key: "description",
        type: "string",
        compatibleOperators: ["equals"],
    },
    status: {
        key: "status",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
    },
    categories: {
        key: "categories",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
    },
    owner: {
        key: "owner",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
    },
    slug: {
        key: "slug",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
    },
    accounting: {
        key: "accounting",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
    },
    territoryCountry: {
        key: "territory.country",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
    },
    territorySubLvl1: {
        key: "territory.subLvl1",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
    },
    territorySubLvl2: {
        key: "territory.subLvl2",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
    },
    releaseDate: {
        key: "releaseDate",
        type: "date",
        compatibleOperators: ["before", "after", "strictly_before", "strictly_after"],
    },
    dateUpdated: {
        key: "dateUpdated",
        type: "date",
        compatibleOperators: ["before", "after", "strictly_before", "strictly_after"],
    },
    budgetAmount: {
        key: "budgetAmount",
        type: "number",
        compatibleOperators: ["gte", "gt", "lte", "lt"],
    },
};

export function createFilterRow(
    subject: FilterSubject,
    operator: FilterOperator,
    referent: string | string[],
): FilterRow {
    const id = crypto.randomUUID();

    return {
        id,
        subject,
        operator,
        referent,
        serialize: () => {
            const key = subject.key;

            switch (operator) {
                case "equals":
                    return { [key]: referent as string };
                case "is_any_of":
                    return { [`${key}[]`]: referent as string[] };
                case "before":
                case "after":
                case "strictly_before":
                case "strictly_after": {
                    const apiKey = key === "releaseDate" ? "dateCreated" : key;
                    const dateStr = new Date(referent as string).toISOString();
                    return { [`${apiKey}[${operator}]`]: dateStr };
                }
                case "gte":
                case "gt":
                case "lte":
                case "lt":
                    return { [`${key}[${operator}]`]: referent as string };
                default:
                    return { [key]: referent as string };
            }
        },
    };
}

export function getFilterSubject(key: string): FilterSubject | undefined {
    return filterSubjects[key];
}

export function getAllFilterSubjects(): FilterSubject[] {
    return Object.values(filterSubjects);
}
