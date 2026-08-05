<script lang="ts">
    import { t } from "../../../../i18n/store";
    import DateInput from "../../../library/inputs/DateInput.svelte";
    import TextArea from "../../../library/inputs/TextArea.svelte";
    import TextInput from "../../../library/inputs/TextInput.svelte";
</script>

<div class="max-w-167 space-y-10">
    <div class="flex flex-col gap-6">
        <h3 class="text-2xl leading-8 font-bold text-black">
            {$t("pages.admin.comm.banners.fields.dataTitle")}
        </h3>
        <div class="space-y-4">
            <TextInput
                class="flex-1"
                name="title"
                placeholder={$t("pages.admin.comm.banners.fields.titlePlaceholder")}
            />
            <TextArea
                class="flex-1"
                placeholder={$t("pages.admin.comm.banners.fields.descriptionPlaceholder")}
            />
            <div class="flex gap-6">
                <div class="flex-1">
                    <TextInput
                        name="callToAction"
                        placeholder={$t("pages.admin.comm.banners.fields.ctaPlaceholder")}
                    />
                </div>
                <div class="flex-1">
                    <TextInput
                        name="link"
                        placeholder={$t("pages.admin.comm.banners.fields.urlPlaceholder")}
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
                name="startDate"
                placeholder={$t("pages.admin.comm.banners.fields.startDatePlaceholder")}
            />
            <DateInput
                class="flex-1"
                name="endDate"
                placeholder={$t("pages.admin.comm.banners.fields.endDatePlaceholder")}
            />
        </div>
    </div>
</div>
