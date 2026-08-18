<script lang="ts">
    import { t } from "../../../i18n/store";
    import DetailsRow, { type DetailsField } from "../DetailsRow.svelte";

    import type { UserRow } from "./UsersTable.svelte";

    let { user }: { user: UserRow } = $props();

    const fields: DetailsField[] = $derived([
        {
            label: $t("pages.admin.users.table.rows.details.id"),
            value: user.id,
        },
        {
            label: $t("pages.admin.users.table.rows.details.handle"),
            value: user.handle,
        },
        {
            label: $t("pages.admin.users.table.rows.details.email"),
            value: user.email,
        },
        {
            label: $t("pages.admin.users.table.rows.details.type"),
            value: $t(`pages.admin.users.table.rows.type.${user.type}`, {
                default: user.type,
            }),
        },
        {
            label: $t("pages.admin.users.table.rows.details.territory"),
            value: user.territory,
        },
        {
            label: $t("pages.admin.users.table.rows.details.active"),
            value: user.active
                ? $t("pages.admin.users.table.rows.active")
                : $t("pages.admin.users.table.rows.inactive"),
        },
    ]);
</script>

<DetailsRow {fields} columns={2} />
