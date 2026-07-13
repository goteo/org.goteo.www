<script lang="ts">
    import { t } from "../../../i18n/store";
    import AddressAutocomplete from "../../library/inputs/AddressAutocomplete.svelte";
    import Close from "../../icons/navigation/Close.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Checkbox from "../../library/inputs/Checkbox.svelte";
    import FileUpload from "../../library/inputs/FileUpload.svelte";
    import RadioButton from "../../library/inputs/RadioButton.svelte";
    import TextInput from "../../library/inputs/TextInput.svelte";
    import ToggleSwitch from "../../library/inputs/ToggleSwitch.svelte";

    import type { Project, Territory } from "../../../openapi/client";
    import { currentDraft, updateProject } from "../../../stores/drafts/projectDraft";

    let { project: _project, onPublish }: { project: Project; onPublish?: () => void } = $props();

    type ContactEntry = {
        id: string;
        type: "email" | "phone" | "text";
        value: string;
        preferred: boolean;
    };

    let legalEntityType = $state<"individual" | "organization">("individual");
    let name = $state("");
    let taxId = $state("");
    let privateContacts = $state<ContactEntry[]>([
        { id: crypto.randomUUID(), type: "email", value: "", preferred: true },
        { id: crypto.randomUUID(), type: "phone", value: "", preferred: false },
    ]);
    let preferredIndex = $state(0);
    let iban = $state("");
    let bankCertificateFiles = $state<File[]>([]);
    // let publicLinks = $state({
    //     website: "",
    //     email: "",
    //     instagram: "",
    //     facebook: "",
    //     twitter: "",
    //     linkedin: "",
    // });
    let termsAccepted = $state(false);
    let touched = $state<Set<string>>(new Set());

    function touch(field: string) {
        touched = new Set([...touched, field]);
    }

    function setPreferred(i: number) {
        preferredIndex = i;
        privateContacts = privateContacts.map((c, idx) => ({ ...c, preferred: idx === i }));
    }

    function addContact() {
        privateContacts = [
            ...privateContacts,
            { id: crypto.randomUUID(), type: "text", value: "", preferred: false },
        ];
    }

    function deleteContact(i: number) {
        if (privateContacts[i]?.type === "email") return;
        const wasPreferred = i === preferredIndex;
        privateContacts = privateContacts.filter((_, idx) => idx !== i);
        if (wasPreferred) {
            preferredIndex = 0;
            privateContacts = privateContacts.map((c, idx) => ({ ...c, preferred: idx === 0 }));
        } else if (i < preferredIndex) {
            preferredIndex = preferredIndex - 1;
        }
    }

    function ibanValid(value: string): boolean {
        const normalized = value.replace(/\s/g, "").toUpperCase();
        return /^[A-Z]{2}[0-9]{2}[A-Z0-9]{10,30}$/.test(normalized);
    }

    let errors = $derived({
        name: !name.trim() ? $t("system.validation.missingRequiredFields") : undefined,
        taxId: !taxId.trim() ? $t("system.validation.missingRequiredFields") : undefined,
        contacts: !privateContacts[preferredIndex]?.value.trim()
            ? $t("system.validation.missingRequiredFields")
            : undefined,
        iban: !iban.trim()
            ? $t("system.validation.missingRequiredFields")
            : !ibanValid(iban)
              ? $t("pages.project.edit.aboutYou.paymentData.ibanInvalid")
              : undefined,
        bankCertificate:
            bankCertificateFiles.length === 0
                ? $t("system.validation.missingRequiredFields")
                : undefined,
    });

    let isValid = $derived(Object.values(errors).every((e) => e === undefined) && termsAccepted);
</script>

<div class="w-1/2">
    <div class="flex flex-col gap-10">
        <!-- Header -->
        <div class="space-y-4">
            <h1 class="text-[2.5rem] leading-12 font-bold text-black lg:text-[2.5rem]">
                {$t("pages.project.edit.aboutYou.title")}
            </h1>
            <p class="text-content text-base">{$t("pages.project.edit.aboutYou.subtitle")}</p>
        </div>

        <!-- Pre-fill from profile
        <div class="flex flex-col gap-2">
            <Select bind:value={prefill} name="prefill">
                <option value="">{$t("pages.project.edit.aboutYou.prefill")}</option>
            </Select>
        </div>
        -->

        <!-- Forma jurídica -->
        <div class="flex flex-col gap-3">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.aboutYou.legalEntity")}
            </h2>
            <p class="text-content text-base">
                {$t("pages.project.edit.aboutYou.legalEntityHelper")}
            </p>
            <ToggleSwitch
                bind:value={legalEntityType}
                options={[
                    { value: "individual", label: $t("pages.project.edit.aboutYou.individual") },
                    {
                        value: "organization",
                        label: $t("pages.project.edit.aboutYou.organization"),
                    },
                ]}
            />
        </div>

        <!-- Nombre del impulsor -->
        <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.aboutYou.name")}
            </h2>
            <p class="text-content text-base">{$t("pages.project.edit.aboutYou.nameHelper")}</p>
            <div onfocusout={() => touch("name")}>
                <TextInput
                    bind:value={name}
                    placeholder={$t("pages.project.edit.aboutYou.namePlaceholder")}
                    name="name"
                    error={touched.has("name") ? errors.name : undefined}
                />
            </div>
        </div>

        <!-- NIF del impulsor -->
        <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.aboutYou.taxId")}
            </h2>
            <p class="text-content text-base">{$t("pages.project.edit.aboutYou.taxIdHelper")}</p>
            <div onfocusout={() => touch("taxId")}>
                <TextInput
                    bind:value={taxId}
                    placeholder={$t("pages.project.edit.aboutYou.taxIdPlaceholder")}
                    name="taxId"
                    error={touched.has("taxId") ? errors.taxId : undefined}
                />
            </div>
        </div>

        <!-- Lugar de actividad -->
        <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.aboutYou.location")}
            </h2>
            <p class="text-content text-base">{$t("pages.project.edit.aboutYou.locationHelper")}</p>
            <AddressAutocomplete
                name="address"
                placeholder={$t("pages.project.edit.aboutYou.locationPlaceholder")}
                value={$currentDraft?.createProject.address ?? ""}
                onAddressChange={(address, territory) => {
                    updateProject({ address, territory });
                }}
            />
        </div>

        <!-- Descripción del equipo impulsor
        <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.aboutYou.teamDescription")}
            </h2>
            <p class="text-content text-base">
                {$t("pages.project.edit.aboutYou.teamDescriptionHelper")}
            </p>
            <TextArea
                id="team-description"
                bind:value={teamDescription}
                placeholder={$t("pages.project.edit.aboutYou.teamDescriptionPlaceholder")}
                rows={5}
            />
        </div>
        -->

        <!-- Datos de contacto privados -->
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <h2 class="text-2xl font-bold text-black">
                    {$t("pages.project.edit.aboutYou.privateContacts")}
                </h2>
                <p class="text-content text-base">
                    {$t("pages.project.edit.aboutYou.privateContactsHelper")}
                </p>
            </div>
            <div class="flex flex-col gap-3">
                {#each privateContacts as contact, i (contact.id)}
                    <div class="flex items-center gap-3">
                        <div class="flex-1" onfocusout={() => touch(contact.id)}>
                            <TextInput
                                bind:value={contact.value}
                                type={contact.type === "email"
                                    ? "email"
                                    : contact.type === "phone"
                                      ? "tel"
                                      : "text"}
                                placeholder={contact.type === "email"
                                    ? $t("pages.project.edit.aboutYou.email")
                                    : contact.type === "phone"
                                      ? $t("pages.project.edit.aboutYou.phone")
                                      : $t("common.textPlaceholder")}
                                name={`contact-${i}`}
                                error={contact.preferred && touched.has(contact.id)
                                    ? errors.contacts
                                    : undefined}
                            />
                        </div>
                        <RadioButton
                            bind:group={preferredIndex}
                            value={i}
                            label={$t("pages.project.edit.aboutYou.preferred")}
                            onchange={() => setPreferred(i)}
                        />
                        {#if contact.type !== "email"}
                            <button
                                type="button"
                                class="text-tertiary shrink-0 hover:opacity-75"
                                onclick={() => deleteContact(i)}
                                aria-label={$t("common.delete")}
                            >
                                <Close class="size-5" />
                            </button>
                        {/if}
                    </div>
                {/each}
                <button
                    type="button"
                    class="text-secondary w-fit text-sm font-medium underline"
                    onclick={addContact}
                >
                    + {$t("pages.project.edit.aboutYou.addContact")}
                </button>
            </div>
        </div>

        <!-- Datos de contacto públicos
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <h2 class="text-2xl font-bold text-black">
                    {$t("pages.project.edit.aboutYou.publicContacts")}
                </h2>
                <p class="text-content text-base">
                    {$t("pages.project.edit.aboutYou.publicContactsHelper")}
                </p>
            </div>
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-3">
                    <Web class="shrink-0" />
                    <div class="min-w-0 flex-1">
                        <TextInput
                            bind:value={publicLinks.website}
                            placeholder={$t("pages.project.edit.aboutYou.placeholders.website")}
                            name="link-website"
                            type="url"
                        />
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <Gmail class="shrink-0" />
                    <div class="min-w-0 flex-1">
                        <TextInput
                            bind:value={publicLinks.email}
                            placeholder={$t("pages.project.edit.aboutYou.placeholders.email")}
                            name="link-email"
                            type="email"
                        />
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <Instagram class="shrink-0" />
                    <div class="min-w-0 flex-1">
                        <TextInput
                            bind:value={publicLinks.instagram}
                            placeholder={$t("pages.project.edit.aboutYou.placeholders.instagram")}
                            name="link-instagram"
                        />
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <Facebook class="shrink-0" />
                    <div class="min-w-0 flex-1">
                        <TextInput
                            bind:value={publicLinks.facebook}
                            placeholder={$t("pages.project.edit.aboutYou.placeholders.facebook")}
                            name="link-facebook"
                        />
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <X class="shrink-0" />
                    <div class="min-w-0 flex-1">
                        <TextInput
                            bind:value={publicLinks.twitter}
                            placeholder={$t("pages.project.edit.aboutYou.placeholders.twitter")}
                            name="link-twitter"
                        />
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <Linkedin class="shrink-0" />
                    <div class="min-w-0 flex-1">
                        <TextInput
                            bind:value={publicLinks.linkedin}
                            placeholder={$t("pages.project.edit.aboutYou.placeholders.linkedin")}
                            name="link-linkedin"
                        />
                    </div>
                </div>
            </div>
        </div>
        -->

        <!-- Datos de pago -->
        <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1">
                <h2 class="text-2xl font-bold text-black">
                    {$t("pages.project.edit.aboutYou.paymentData.title")}
                </h2>
                <p class="text-content text-base">
                    {$t("pages.project.edit.aboutYou.paymentData.subtitle")}
                </p>
            </div>
            <div class="flex flex-col gap-3">
                <div onfocusout={() => touch("iban")}>
                    <TextInput
                        bind:value={iban}
                        labelText={$t("pages.project.edit.aboutYou.paymentData.iban")}
                        helperText={$t("pages.project.edit.aboutYou.paymentData.ibanHelper")}
                        placeholder={$t("pages.project.edit.aboutYou.paymentData.ibanPlaceholder")}
                        name="iban"
                        error={touched.has("iban") ? errors.iban : undefined}
                    />
                </div>
                <div class="flex flex-col gap-2">
                    <p class="text-base font-bold text-black">
                        {$t("pages.project.edit.aboutYou.paymentData.bankCertificate")}
                    </p>
                    <p class="text-content text-base">
                        {$t("pages.project.edit.aboutYou.paymentData.bankCertificateHelper")}
                    </p>
                    <FileUpload
                        bind:files={bankCertificateFiles}
                        accept={["application/pdf", "image/jpeg", "image/png"]}
                        maxSizeMB={10}
                        ariaLabel={$t(
                            "pages.project.edit.aboutYou.paymentData.bankCertificateAriaLabel",
                        )}
                    />
                </div>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <Checkbox bind:checked={termsAccepted}>
                <span class="text-secondary">
                    <a href="#" class="underline">{$t("pages.project.create.terms.label")}</a>
                </span>
            </Checkbox>
        </div>

        <div class="mt-10 flex">
            <Button
                kind="primary"
                size="md"
                class="min-w-50 disabled:pointer-events-none disabled:opacity-24"
                onclick={onPublish}
                disabled={!isValid}
            >
                {$t("pages.project.edit.aboutYou.continue")}
            </Button>
        </div>
    </div>
</div>
