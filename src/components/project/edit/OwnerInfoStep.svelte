<script lang="ts">
    import Facebook from "../../../components/icons/social/Facebook.svelte";
    import Gmail from "../../../components/icons/social/Gmail.svelte";
    import Instagram from "../../../components/icons/social/Instagram.svelte";
    import Linkedin from "../../../components/icons/social/Linkedin.svelte";
    import X from "../../../components/icons/social/X.svelte";
    import { t } from "../../../i18n/store";
    import { isReadyToPublish } from "../../../stores/wizard-state";
    import Web from "../../icons/social/Web.svelte";
    import Button from "../../library/Button.svelte";
    import RadioButton from "../../library/RadioButton.svelte";
    import Select from "../../library/Select.svelte";
    import TextArea from "../../library/TextArea.svelte";
    import TextInput from "../../library/TextInput.svelte";
    import Toggle from "../../library/ToggleSwitch.svelte";

    import type { Project } from "../../../openapi/client";

    let { project: _project, onPublish }: { project: Project; onPublish?: () => void } = $props();

    type ContactEntry = { type: "email" | "phone"; value: string; preferred: boolean };

    let legalEntityType = $state<"individual" | "organization">("individual");
    let prefill = $state("");
    let name = $state("");
    let taxId = $state("");
    let territory = $state("");
    let country = $state("");
    let teamDescription = $state("");
    let privateContacts = $state<ContactEntry[]>([
        { type: "email", value: "", preferred: false },
        { type: "phone", value: "", preferred: false },
    ]);
    let preferredIndex = $state(0);
    let publicLinks = $state({
        website: "",
        email: "",
        instagram: "",
        facebook: "",
        twitter: "",
        linkedin: "",
    });

    function setPreferred(i: number) {
        privateContacts = privateContacts.map((c, idx) => ({ ...c, preferred: idx === i }));
    }
</script>

<div class="w-1/2">
    <div class="flex flex-col gap-10">
        <!-- Header -->
        <div class="space-y-4">
            <h1 class="text-[40px] leading-12 font-bold text-black lg:text-[40px]">
                {$t("pages.project.edit.aboutYou.title")}
            </h1>
            <p class="text-content text-base">{$t("pages.project.edit.aboutYou.subtitle")}</p>
        </div>

        <!-- Pre-fill from profile -->
        <div class="flex flex-col gap-2">
            <Select bind:value={prefill} name="prefill">
                <option value="">{$t("pages.project.edit.aboutYou.prefill")}</option>
            </Select>
        </div>

        <!-- Forma jurídica -->
        <div class="flex flex-col gap-3">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.aboutYou.legalEntity")}
            </h2>
            <p class="text-content text-base">
                {$t("pages.project.edit.aboutYou.legalEntityHelper")}
            </p>
            <Toggle
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
            <TextInput
                bind:value={name}
                placeholder={$t("pages.project.edit.aboutYou.namePlaceholder")}
                name="name"
            />
        </div>

        <!-- NIF del impulsor -->
        <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.aboutYou.taxId")}
            </h2>
            <p class="text-content text-base">{$t("pages.project.edit.aboutYou.taxIdHelper")}</p>
            <TextInput
                bind:value={taxId}
                placeholder={$t("pages.project.edit.aboutYou.taxIdPlaceholder")}
                name="taxId"
            />
        </div>

        <!-- Lugar de actividad -->
        <div class="flex flex-col gap-2">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.aboutYou.location")}
            </h2>
            <p class="text-content text-base">{$t("pages.project.edit.aboutYou.locationHelper")}</p>
            <div class="flex flex-col gap-3">
                <Select
                    bind:value={territory}
                    labelText={$t("pages.project.edit.aboutYou.territory")}
                    name="territory"
                >
                    <option value=""></option>
                </Select>
                <TextInput
                    bind:value={country}
                    placeholder={$t("pages.project.edit.aboutYou.country")}
                    name="country"
                />
            </div>
        </div>

        <!-- Descripción del equipo impulsor -->
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
                {#each privateContacts as contact, i}
                    <div class="flex items-center gap-3">
                        <div class="flex-1">
                            <TextInput
                                bind:value={contact.value}
                                type={contact.type === "email" ? "email" : "tel"}
                                placeholder={contact.type === "email"
                                    ? "*" + $t("pages.project.edit.aboutYou.email")
                                    : $t("pages.project.edit.aboutYou.phone")}
                                name={`contact-${i}`}
                            />
                        </div>
                        <RadioButton
                            bind:group={preferredIndex}
                            value={i}
                            label={$t("pages.project.edit.aboutYou.preferred")}
                            onchange={() => setPreferred(i)}
                        />
                    </div>
                {/each}
            </div>
        </div>

        <!-- Datos de contacto públicos -->
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

        <div class="mt-10 flex">
            <Button
                kind="primary"
                size="md"
                class="min-w-50 disabled:pointer-events-none disabled:opacity-24"
                onclick={onPublish}
                disabled={$isReadyToPublish ? false : true}
            >
                {$t("pages.project.edit.aboutYou.continue")}
            </Button>
        </div>
    </div>
</div>
