<script>
    import DonatorIcon from "../../svgs/DonatorIcon.svelte";
    import CertificateIcon from "../../svgs/CertificateIcon.svelte";
    import { t } from "../../i18n/store";
</script>

<section class="flex flex-row gap-6">
    <div class="flex flex-row gap-4">
        <div><DonatorIcon /></div>
        <div>{$t("project.banner.donator.description")}</div>
    </div>
    <div class="flex flex-row gap-4">
        <div><CertificateIcon /></div>
        <div><div>{$t("project.banner.certificate.description")}</div></div>
    </div>
</section>
