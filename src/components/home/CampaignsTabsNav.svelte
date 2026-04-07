<script lang="ts">
    import ClockIcon from "../../components/icons/Clock.svelte";
    import { t } from "../../i18n/store";
    import FlashIcon from "../../svgs/FlashIcon.svelte";
    import MatchFundingIcon from "../../svgs/MatchFundingIcon.svelte";
    import Tabs from "../Tabs.svelte";

    interface Props {
        activeTab?: string;
        onTabChange?: (tabId: string) => void;
    }

    let { activeTab = "most-successful", onTabChange }: Props = $props();
</script>

{#snippet flashIconSnippet()}
    <FlashIcon width="17" height="16" />
{/snippet}

{#snippet clockIconSnippet()}
    <ClockIcon width="20" height="20" />
{/snippet}

{#snippet matchFundingIconSnippet()}
    <MatchFundingIcon width="32" height="32" />
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
