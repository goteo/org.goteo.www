export type DropdownVariant = "basic" | "multiselect";

export type DropdownItemPosition = "start" | "middle" | "end";

export type DropdownBasicItem = {
    id: string;
    label: string;
};

export type DropdownMultiSelectItem = {
    id: string;
    label: string;
};

export type DropdownItemModel =
    | { id: string; type: "search" }
    | ({ type: "basic" } & DropdownBasicItem)
    | ({ type: "multiselect" } & DropdownMultiSelectItem);
