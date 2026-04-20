<script lang="ts">
    import Clock from "../../components/icons/Clock.svelte";
    import { t } from "../../i18n/store";
    import Flames from "../icons/Flames.svelte";
    import Flash from "../icons/Flash.svelte";
    import Tabs from "../Tabs.svelte";

    interface Props {
        activeTab?: string;
        onTabChange?: (tabId: string) => void;
    }

    let { activeTab = "most-successful", onTabChange }: Props = $props();
</script>

{#snippet flashIconSnippet()}
    <Flash />
{/snippet}

{#snippet clockIconSnippet()}
    <Clock />
{/snippet}

{#snippet matchFundingIconSnippet()}
    <Flames />
{/snippet}

<Tabs
    tabs={[
        {
            id: "most-successful",
            label: $t("home.campaigns.tabs.mostSuccessful"),
            icon: flashIconSnippet,
        },
        // Uncomment when ready to enable
        // {
        //     id: "ending-soon",
        //     label: $t("home.campaigns.tabs.endingSoon"),
        //     icon: clockIconSnippet,
        // },
        // {
        //     id: "matchfunding",
        //     label: $t("home.campaigns.tabs.withMatchfunding"),
        //     icon: matchFundingIconSnippet,
        // },
    ]}
    {activeTab}
    alignment="left"
    useDataAttributes={false}
    {onTabChange}
/>
