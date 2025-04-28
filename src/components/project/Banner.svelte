<script lang="ts">
    import DonatorIcon from "../../svgs/DonatorIcon.svelte";
    import CertificateIcon from "../../svgs/CertificateIcon.svelte";
    import { t } from "../../i18n/store";

    export let ownerName: string;
</script>

<section class="flex flex-row gap-6">
    <div class="flex flex-row gap-4">
        <div><DonatorIcon /></div>
        <div class="text-[#575757]">
            {@html $t(
                "project.banner.donator.description",
                { owner: `<a href="#" class="font-bold  text-tertiary">${ownerName}</a>` },
                { allowHTML: true },
            )}
            <a href="#" class="text-tertiary font-bold"
                >{$t("project.banner.donator.learnMore")}
            </a>
        </div>
    </div>
    <div class="flex flex-row gap-4">
        <div><CertificateIcon /></div>
        <div>
            <div class="text-[#575757]">
                {$t("project.banner.certificate.description")}
                <a href="#" class="text-tertiary font-bold"
                    >{$t("project.banner.certificate.learnMore")}
                </a>
            </div>
        </div>
    </div>
</section>
