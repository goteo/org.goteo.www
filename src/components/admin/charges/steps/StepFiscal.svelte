<script lang="ts">
    import { t } from "../../../../i18n/store";
    import { apiUsersIdpersonGet, apiUsersIdorganizationGet } from "../../../../openapi/client";
    import TextInput from "../../../library/inputs/TextInput.svelte";
    import { initialFiscal } from "../../../../types/admin-charge";

    import type { CreateChargeForm, DonorType } from "../../../../types/admin-charge";

    let { form = $bindable(), userId }: { form: CreateChargeForm; userId: string | null } =
        $props();

    let loading = $state(false);
    let loadError = $state<string | null>(null);

    async function loadFiscal(donorType: DonorType, id: string) {
        loading = true;
        loadError = null;
        try {
            const { data: person, error: personErr } = await apiUsersIdpersonGet({
                baseUrl: "/api/relay",
                path: { id },
            });

            if (personErr) {
                console.error("Failed to load person:", personErr);
            }

            if (donorType === "organization") {
                const { data: org, error: orgErr } = await apiUsersIdorganizationGet({
                    baseUrl: "/api/relay",
                    path: { id },
                });
                if (orgErr) {
                    console.error("Failed to load organization:", orgErr);
                }
                form.fiscal = {
                    kind: "organization",
                    legalName: org?.legalName ?? "",
                    taxId: org?.taxId ?? "",
                    repFirstName: person?.firstName ?? "",
                    repLastName: person?.lastName ?? "",
                    repTaxId: person?.taxId ?? "",
                };
            } else {
                form.fiscal = {
                    kind: "individual",
                    firstName: person?.firstName ?? "",
                    lastName: person?.lastName ?? "",
                    taxId: person?.taxId ?? "",
                };
            }
        } catch (err) {
            console.error("Failed to load fiscal data:", err);
            loadError = String(err);
            form.fiscal = initialFiscal(donorType);
        } finally {
            loading = false;
        }
    }

    $effect(() => {
        if (userId) {
            loadFiscal(form.user.type, userId);
        }
    });

    export function validate(): boolean {
        return true;
    }

    export function snapshot(): {
        kind: "individual" | "organization";
        firstName?: string;
        lastName?: string;
        taxId?: string;
        legalName?: string;
        repFirstName?: string;
        repLastName?: string;
        repTaxId?: string;
    } {
        if (form.fiscal.kind === "individual") {
            return {
                kind: "individual",
                firstName: form.fiscal.firstName,
                lastName: form.fiscal.lastName,
                taxId: form.fiscal.taxId,
            };
        }
        return {
            kind: "organization",
            legalName: form.fiscal.legalName,
            taxId: form.fiscal.taxId,
            repFirstName: form.fiscal.repFirstName,
            repLastName: form.fiscal.repLastName,
            repTaxId: form.fiscal.repTaxId,
        };
    }
</script>

<div class="flex flex-col gap-6">
    {#if loading}
        <p class="text-content text-sm">
            {$t("system.loading")}
        </p>
    {:else if loadError}
        <p class="text-tertiary text-sm">
            {$t("pages.admin.charges.create.fiscal.loadError")}
        </p>
    {/if}

    {#if form.fiscal.kind === "individual"}
        <div class="grid grid-cols-2 gap-4">
            <TextInput
                bind:value={form.fiscal.firstName}
                labelText={$t("domain.users.attributes.firstName")}
            />
            <TextInput
                bind:value={form.fiscal.lastName}
                labelText={$t("domain.users.attributes.lastName")}
            />
        </div>
        <TextInput
            bind:value={form.fiscal.taxId}
            labelText={$t("domain.users.attributes.taxId")}
            disabled={true}
            helperText={$t("pages.admin.charges.create.fields.taxIdHint")}
        />
    {:else}
        <TextInput
            bind:value={form.fiscal.legalName}
            labelText={$t("domain.users.attributes.legalName")}
        />
        <TextInput
            bind:value={form.fiscal.taxId}
            labelText={$t("domain.users.attributes.orgTaxId")}
            disabled={true}
            helperText={$t("pages.admin.charges.create.fields.taxIdHint")}
        />
        <div class="grid grid-cols-2 gap-4">
            <TextInput
                bind:value={form.fiscal.repFirstName}
                labelText={$t("domain.users.attributes.firstName")}
            />
            <TextInput
                bind:value={form.fiscal.repLastName}
                labelText={$t("domain.users.attributes.lastName")}
            />
        </div>
        <TextInput
            bind:value={form.fiscal.repTaxId}
            labelText={$t("domain.users.attributes.taxId")}
            disabled={true}
            helperText={$t("pages.admin.charges.create.fields.taxIdHint")}
        />
    {/if}
</div>
