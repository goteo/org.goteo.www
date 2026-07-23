export interface FilterRow {
    id: string;
    subject: FilterSubject;
    operator: FilterOperator;
    referent: string | number | Date | string[];
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

export type FilterResource = "project" | "gateway_charge";

export interface FilterSubject {
    key: string;
    param?: string;
    type: "string" | "date" | "number";
    compatibleOperators: FilterOperator[];
    resources: FilterResource[];
}

const filterSubjects: Record<string, FilterSubject> = {
    title: {
        key: "title",
        type: "string",
        compatibleOperators: ["equals"],
        resources: ["project"],
    },
    subtitle: {
        key: "subtitle",
        type: "string",
        compatibleOperators: ["equals"],
        resources: ["project"],
    },
    description: {
        key: "description",
        type: "string",
        compatibleOperators: ["equals"],
        resources: ["project"],
    },
    status: {
        key: "status",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["project", "gateway_charge"],
    },
    categories: {
        key: "categories",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["project"],
    },
    owner: {
        key: "owner",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["project"],
    },
    slug: {
        key: "slug",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["project"],
    },
    accounting: {
        key: "accounting",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["project"],
    },
    territoryCountry: {
        key: "territoryCountry",
        param: "territory.country",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["project"],
    },
    territorySubLvl1: {
        key: "territorySubLvl1",
        param: "territory.subLvl1",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["project"],
    },
    territorySubLvl2: {
        key: "territorySubLvl2",
        param: "territory.subLvl2",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["project"],
    },
    dateUpdated: {
        key: "dateUpdated",
        type: "date",
        compatibleOperators: ["before", "after", "strictly_before", "strictly_after"],
        resources: ["project", "gateway_charge"],
    },
    budgetAmount: {
        key: "budgetAmount",
        type: "number",
        compatibleOperators: ["gte", "gt", "lte", "lt"],
        resources: ["project"],
    },
    gateway: {
        key: "gateway",
        param: "checkout.gateway",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charge"],
    },
    type: {
        key: "type",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charge"],
    },
    target: {
        key: "target",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charge"],
    },
    currency: {
        key: "currency",
        param: "money.currency",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charge"],
    },
    amount: {
        key: "amount",
        param: "money.amount",
        type: "number",
        compatibleOperators: ["gte", "gt", "lte", "lt"],
        resources: ["gateway_charge"],
    },
    dateCreated: {
        key: "dateCreated",
        type: "date",
        compatibleOperators: ["before", "after", "strictly_before", "strictly_after"],
        resources: ["gateway_charge"],
    },
};

export function createFilterRow(
    subject: FilterSubject,
    operator: FilterOperator,
    referent: string | number | Date | string[],
): FilterRow {
    const id = crypto.randomUUID();

    return {
        id,
        subject,
        operator,
        referent,
        serialize: () => {
            const key = subject.param ?? subject.key;

            switch (operator) {
                case "equals":
                    return { [key]: String(referent) };
                case "is_any_of":
                    return { [`${key}[]`]: referent as string[] };
                case "before":
                case "after":
                case "strictly_before":
                case "strictly_after": {
                    const date = referent instanceof Date ? referent : new Date(referent as string);
                    return { [`${key}[${operator}]`]: date.toISOString() };
                }
                case "gte":
                case "gt":
                case "lte":
                case "lt":
                    return { [`${key}[${operator}]`]: String(referent) };
                default:
                    return { [key]: String(referent) };
            }
        },
    };
}

export function getFilterSubject(key: string): FilterSubject | undefined {
    return filterSubjects[key];
}

export function getAllFilterSubjects(resource?: FilterResource): FilterSubject[] {
    const all = Object.values(filterSubjects);
    return resource ? all.filter((s) => s.resources.includes(resource)) : all;
}
