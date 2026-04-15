<script lang="ts">
    import { t } from "../../i18n/store";
    import CertificateIcon from "../../svgs/CertificateIcon.svelte";
    import DonatorIcon from "../../svgs/DonatorIcon.svelte";
    import Thtml from "../Thtml.svelte";

    export let ownerName: string;
</script>

<section class="flex flex-col gap-6 py-10 lg:flex-row">
    <div class="flex flex-row items-center justify-center gap-4">
        <div><DonatorIcon /></div>
        <div class="text-content">
            <Thtml
                key="project.banner.donator.description"
                vars={{ owner: `<a href="#" class="font-bold  text-secondary">${ownerName}</a>` }}
            />
            <a href="#" class="text-secondary font-bold"
                >{$t("project.banner.donator.learnMore")}
            </a>
        </div>
    </div>
    <div class="flex flex-row items-center justify-center gap-4">
        <div><CertificateIcon /></div>
        <div>
            <div class="text-content">
                {$t("project.banner.certificate.description")}
                <a href="#" class="text-secondary font-bold"
                    >{$t("project.banner.certificate.learnMore")}
                </a>
            </div>
        </div>
    </div>
</section>
