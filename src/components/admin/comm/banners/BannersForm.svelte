<script lang="ts">
    import { actions } from "astro:actions";

    import { locale, t } from "../../../../i18n/store";
    import { formatDate } from "../../../../utils/dates";
    import ActionableButton from "../../../library/buttons/ActionableButton.svelte";
    import DateInput from "../../../library/inputs/DateInput.svelte";
    import TextArea from "../../../library/inputs/TextArea.svelte";
    import TextInput from "../../../library/inputs/TextInput.svelte";
    import Title from "../../../library/typography/Title.svelte";

    interface Props {
        onSubmit?: (event: SubmitEvent) => void;
    }

    let { onSubmit }: Props = $props();

    let formElement: HTMLFormElement;

    type FieldName = "title" | "content" | "ctaText" | "ctaLink" | "startsAt" | "endsAt";

    type FieldErrors = Partial<Record<FieldName, string>>;

    let fieldErrors: FieldErrors = $state({});

    function handleDateSelect(date: Date) {
        const now = new Date();
        date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
    }

    async function submit() {
        fieldErrors = {};

        const { error } = await actions.createBanner(new FormData(formElement));

        if (error) {
            // @ts-expect-error fields does exist but astro typing sucks
            const errors: Record<string, string[]> = error.fields;

            fieldErrors = Object.fromEntries(
                Object.entries(errors ?? {}).map(([field, issues]) => [field, issues?.[0]]),
            ) as FieldErrors;

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
        <Title level={3} variant="subsection">
            {$t("pages.admin.comm.banners.fields.dataTitle")}
        </Title>

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
                name="content"
                placeholder={$t("pages.admin.comm.banners.fields.contentPlaceholder")}
                error={fieldErrors.content && $t(fieldErrors.content)}
            />

            <div class="flex gap-6">
                <div class="flex-1">
                    <TextInput
                        name="ctaText"
                        placeholder={$t("pages.admin.comm.banners.fields.ctaPlaceholder")}
                        error={fieldErrors.ctaText && $t(fieldErrors.ctaText)}
                    />
                </div>

                <div class="flex-1">
                    <TextInput
                        name="ctaLink"
                        placeholder={$t("pages.admin.comm.banners.fields.urlPlaceholder")}
                        error={fieldErrors.ctaLink && $t(fieldErrors.ctaLink)}
                    />
                </div>
            </div>
        </div>
    </div>

    <div class="space-y-6">
        <Title level={3} variant="subsection">
            {$t("pages.admin.comm.banners.fields.scheduleTitle")}
        </Title>

        <div class="flex gap-6">
            <DateInput
                class="flex-1"
                name="startsAt"
                placeholder={$t("pages.admin.comm.banners.fields.startDatePlaceholder")}
                error={fieldErrors.startsAt &&
                    $t(fieldErrors.startsAt, { date: formatDate(new Date(), $locale) })}
                    onInput={handleDateSelect}
            />

            <DateInput
                class="flex-1"
                name="endsAt"
                placeholder={$t("pages.admin.comm.banners.fields.endDatePlaceholder")}
                error={fieldErrors.endsAt &&
                    $t(fieldErrors.endsAt, { date: formatDate(new Date(), $locale) })}
                onInput={handleDateSelect}
            />
        </div>
    </div>

    <ActionableButton action={submit} autoreset={2000}>
        {$t("common.save")}
    </ActionableButton>
</form>
