<script lang="ts">
    import { t } from "../../i18n/store";
    import Thtml from "../library/typography/Thtml.svelte";

    let { ownerName }: { ownerName: string } = $props();
</script>

<section class="flex flex-col gap-6 py-10 lg:flex-row">
    <div class="flex flex-row items-center justify-center gap-4">
        <div><img src="/images/project/donator.svg" alt="" width="69" height="64" /></div>
        <div class="text-content">
            <Thtml
                key="pages.project.view.banner.donator.description"
                vars={{ owner: `<a href="#" class="font-bold  text-secondary">${ownerName}</a>` }}
            />
            <a href="#" class="text-secondary font-bold"
                >{$t("pages.project.view.banner.donator.learnMore")}
            </a>
        </div>
    </div>
    <div class="flex flex-row items-center justify-center gap-4">
        <div><img src="/images/project/certificate.svg" alt="" width="65" height="67" /></div>
        <div>
            <div class="text-content">
                {$t("pages.project.view.banner.certificate.description")}
                <a href="#" class="text-secondary font-bold"
                    >{$t("pages.project.view.banner.certificate.learnMore")}
                </a>
            </div>
        </div>
    </div>
</section>
