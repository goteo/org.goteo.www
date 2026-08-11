<script lang="ts">
    import { actions } from "astro:actions";

    import { t } from "../../../../i18n/store";
    import ActionableButton from "../../../library/buttons/ActionableButton.svelte";
    import DateInput from "../../../library/inputs/DateInput.svelte";
    import TextArea from "../../../library/inputs/TextArea.svelte";
    import TextInput from "../../../library/inputs/TextInput.svelte";

    interface Props {
        onSubmit?: (event: SubmitEvent) => void;
    }

    let { onSubmit }: Props = $props();

    let formElement: HTMLFormElement;

    type FieldName = "title" | "description" | "ctaText" | "ctaLink" | "startsAt" | "endsAt";

    type FieldErrors = Partial<Record<FieldName, string>>;

    let fieldErrors: FieldErrors = $state({});

    async function submit() {
        fieldErrors = {};

        const { data, error } = await actions.createBanner(new FormData(formElement));

        if (error) {
            // @ts-expect-error fields does exist but astro typing sucks
            const errors: Record<string, string[]> = error.fields;

            fieldErrors = Object.fromEntries(
                Object.entries(errors ?? {}).map(([field, issues]) => [field, issues?.[0]]),
            ) as FieldErrors;

            console.log(fieldErrors);

            return;
        }
    }

    async function handleSubmit(event: SubmitEvent) {
        if (onSubmit) {
            onSubmit(event);
            return;
        }

        event.preventDefault();
        await submit();
    }
</script>

<form bind:this={formElement} onsubmit={handleSubmit} class="max-w-167 space-y-10">
    <div class="flex flex-col gap-6">
        <h3 class="text-2xl leading-8 font-bold text-black">
            {$t("pages.admin.comm.banners.fields.dataTitle")}
        </h3>

        <div class="space-y-4">
            <TextInput
                class="flex-1"
                name="title"
                required={true}
                placeholder={$t("pages.admin.comm.banners.fields.titlePlaceholder")}
                error={fieldErrors.title && $t(fieldErrors.title)}
            />

            <TextArea
                class="flex-1"
                name="description"
                placeholder={$t("pages.admin.comm.banners.fields.descriptionPlaceholder")}
                error={fieldErrors.description}
            />

            <div class="flex gap-6">
                <div class="flex-1">
                    <TextInput
                        name="ctaText"
                        placeholder={$t("pages.admin.comm.banners.fields.ctaPlaceholder")}
                        error={fieldErrors.ctaText}
                    />
                </div>

                <div class="flex-1">
                    <TextInput
                        name="ctaLink"
                        placeholder={$t("pages.admin.comm.banners.fields.urlPlaceholder")}
                        error={fieldErrors.ctaLink}
                    />
                </div>
            </div>
        </div>
    </div>

    <div class="space-y-6">
        <h3 class="text-2xl leading-8 font-bold text-black">
            {$t("pages.admin.comm.banners.fields.scheduleTitle")}
        </h3>

        <div class="flex gap-6">
            <DateInput
                class="flex-1"
                name="startsAt"
                placeholder={$t("pages.admin.comm.banners.fields.startDatePlaceholder")}
                error={fieldErrors.startsAt}
            />

            <DateInput
                class="flex-1"
                name="endsAt"
                placeholder={$t("pages.admin.comm.banners.fields.endDatePlaceholder")}
                error={fieldErrors.endsAt}
            />
        </div>
    </div>

    <ActionableButton action={submit} autoreset={2000}>
        {$t("common.save")}
    </ActionableButton>
</form>
