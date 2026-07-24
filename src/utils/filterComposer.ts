import {
    suggestGateways,
    suggestTarget,
    suggestOwner,
    suggestCategories,
    suggestProjects,
    suggestProjectsBySubtitle,
    suggestProjectsByDescription,
    suggestProjectsBySlug,
} from "./filterSuggestions";
import { currencySymbols } from "./currencyData";
import { getDefaultLanguage } from "./consts";
import { get } from "svelte/store";
import { locale } from "../i18n/store";

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

export type FilterResource = "projects" | "gateway_charges" | "users";

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterSubject {
    key: string;
    param?: string;
    type: "string" | "date" | "number";
    compatibleOperators: FilterOperator[];
    resources: FilterResource[];
    options?: FilterOption[];
    suggest?: (q: string) => Promise<FilterOption[]>;
}

const gatewayChargeStatuses: FilterOption[] = [
    { value: "to_charge", label: "To charge" },
    { value: "in_charge", label: "In charge" },
    { value: "to_refund", label: "To refund" },
    { value: "refunded", label: "Refunded" },
    { value: "to_wallet", label: "To wallet" },
    { value: "walleted", label: "Wallet" },
];

const chargeTypes: FilterOption[] = [
    { value: "single", label: "Single" },
    { value: "recurring", label: "Recurring" },
];

const projectStatuses: FilterOption[] = [
    { value: "in_draft", label: "In draft" },
    { value: "to_campaign_review", label: "To campaign review" },
    { value: "in_campaign_review", label: "In campaign review" },
    { value: "in_campaign_review.request_change", label: "Request change (campaign)" },
    { value: "campaign_review.rejected", label: "Rejected (campaign)" },
    { value: "to_campaign", label: "To campaign" },
    { value: "in_campaign", label: "In campaign" },
    { value: "campaign.failed", label: "Failed (campaign)" },
    { value: "to_funding_review", label: "To funding review" },
    { value: "in_funding_review", label: "In funding review" },
    { value: "in_funding_review.request_change", label: "Request change (funding)" },
    { value: "funding_review.rejected", label: "Rejected (funding)" },
    { value: "to_funding", label: "To funding" },
    { value: "in_funding", label: "In funding" },
    { value: "funding.paid", label: "Funding paid" },
];

const currentLocale = get(locale) || getDefaultLanguage();
const currencyName = new Intl.DisplayNames([currentLocale], { type: "currency" });

const currencies: FilterOption[] = Object.keys(currencySymbols).map((code) => ({
    value: code,
    label: `${currencyName.of(code)} (${code})`,
}));

const filterSubjects: Record<string, FilterSubject> = {
    title: {
        key: "title",
        type: "string",
        compatibleOperators: ["equals"],
        resources: ["projects"],
        suggest: suggestProjects,
    },
    subtitle: {
        key: "subtitle",
        type: "string",
        compatibleOperators: ["equals"],
        resources: ["projects"],
        suggest: suggestProjectsBySubtitle,
    },
    description: {
        key: "description",
        type: "string",
        compatibleOperators: ["equals"],
        resources: ["projects"],
        suggest: suggestProjectsByDescription,
    },
    projectStatus: {
        key: "projectStatus",
        param: "status",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["projects"],
        options: projectStatuses,
    },
    chargeStatus: {
        key: "chargeStatus",
        param: "status",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charges"],
        options: gatewayChargeStatuses,
    },
    categories: {
        key: "categories",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["projects"],
        suggest: suggestCategories,
    },
    owner: {
        key: "owner",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["projects"],
        suggest: suggestOwner,
    },
    slug: {
        key: "slug",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["projects"],
        suggest: suggestProjectsBySlug,
    },
    territoryCountry: {
        key: "territoryCountry",
        param: "territory.country",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["projects"],
    },
    budgetAmount: {
        key: "budgetAmount",
        type: "number",
        compatibleOperators: ["gte", "gt", "lte", "lt"],
        resources: ["projects"],
    },
    gateway: {
        key: "gateway",
        param: "checkout.gateway",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charges"],
        suggest: suggestGateways,
    },
    type: {
        key: "type",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charges"],
        options: chargeTypes,
    },
    target: {
        key: "target",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charges"],
        suggest: suggestTarget,
    },
    currency: {
        key: "currency",
        param: "money.currency",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["gateway_charges"],
        options: currencies,
    },
    amount: {
        key: "amount",
        param: "money.amount",
        type: "number",
        compatibleOperators: ["gte", "gt", "lte", "lt"],
        resources: ["gateway_charges"],
    },
    dateCreated: {
        key: "dateCreated",
        type: "date",
        compatibleOperators: ["before", "after", "strictly_before", "strictly_after"],
        resources: ["projects", "gateway_charges", "users"],
    },
    dateUpdated: {
        key: "dateUpdated",
        type: "date",
        compatibleOperators: ["before", "after", "strictly_before", "strictly_after"],
        resources: ["projects", "gateway_charges", "users"],
    },
    handle: {
        key: "handle",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["users"],
    },
    email: {
        key: "email",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["users"],
    },
    displayName: {
        key: "displayName",
        param: "displayName",
        type: "string",
        compatibleOperators: ["equals"],
        resources: ["users"],
    },
    userType: {
        key: "userType",
        param: "type",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["users"],
        options: [
            { value: "individual", label: "Individual" },
            { value: "organization", label: "Organization" },
        ],
    },
    active: {
        key: "active",
        type: "string",
        compatibleOperators: ["equals"],
        resources: ["users"],
        options: [
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
        ],
    },
    userRoles: {
        key: "userRoles",
        param: "roles",
        type: "string",
        compatibleOperators: ["is_any_of"],
        resources: ["users"],
    },
    userTerritoryCountry: {
        key: "userTerritoryCountry",
        param: "territory.country",
        type: "string",
        compatibleOperators: ["equals", "is_any_of"],
        resources: ["users"],
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
