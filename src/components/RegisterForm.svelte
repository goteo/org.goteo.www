<script lang="ts">
    import { onMount } from "svelte";

    import App from "../layouts/App.svelte";
    import { t, locale as localeStore } from "./../i18n/store";
    import Steps from "./checkout/Steps.svelte";
    import Summary from "./checkout/Summary.svelte";
    import BackButton from "./library/buttons/BackButton.svelte";
    import Button from "./library/buttons/Button.svelte";
    import Card from "./library/cards/Card.svelte";
    import Checkbox from "./library/inputs/Checkbox.svelte";
    import RadioButton from "./library/inputs/RadioButton.svelte";
    import Thtml from "./library/typography/Thtml.svelte";
    import Oauth from "./Oauth.svelte";

    import type { Locale } from "../i18n/locales";

    interface Props {
        lang: Locale;
        currentStep?: number;
        session?: any;
    }

    let { lang, currentStep = 2, session }: Props = $props();

    let userType = $state("individual");
    let showDniField = $state(false);
    let acceptTerms = $state(false);
    let isSubmitting = $state(false);
    let errorMessage = $state("");

    onMount(() => {
        localeStore.set(lang);
    });

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        isSubmitting = true;
    };

    const inputClass =
        "w-full rounded-xl border border-secondary bg-white px-4 py-4 text-base text-content placeholder:text-secondary/30 focus:ring-1 focus:ring-primary focus:outline-none transition-all shadow-sm";
</script>

<App locale={lang} {session}>
    <div class="font-body min-h-screen bg-white py-4">
        <div class="mx-auto max-w-353 px-6 lg:px-2">
            <div class="flex flex-col gap-10 lg:flex-row lg:items-start">
                <div class="flex flex-[0_0_1] flex-col items-start gap-10">
                    <BackButton />

                    <div class="flex flex-col items-start gap-10 self-stretch">
                        <h1 class="text-secondary font-body text-[40px] leading-5 font-bold">
                            {$t("register.page.title")}
                        </h1>
                        <p
                            class="text-content font-body self-stretch text-base leading-6 font-normal"
                        >
                            {$t("register.page.description")}
                        </p>
                    </div>

                    <div class="flex items-center gap-4">
                        <h2 class="text-secondary font-body text-2xl leading-8 font-bold">
                            {$t("register.page.registerOr")}
                        </h2>
                        <a
                            href="/login?checkout=true"
                            class="bg-variant1 text-secondary font-body line-clamp-1 flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2 text-base leading-6 font-bold text-ellipsis"
                        >
                            {$t("register.page.loginBtnLabel")}
                        </a>
                    </div>

                    <div>
                        <p class="text-content font-body w-109 text-base leading-6 font-normal">
                            {$t("register.page.goteoUserInfo")}
                        </p>
                    </div>
                    <form id="register" onsubmit={handleSubmit} class="flex w-full flex-col gap-8">
                        <div class="flex items-center gap-8">
                            <RadioButton
                                name="uType"
                                value="individual"
                                bind:group={userType}
                                label={$t("register.form.userType.individual")}
                                class="text-content font-body h-6 w-6 text-base leading-6 font-normal tabular-nums"
                            />
                            <RadioButton
                                name="uType"
                                value="organization"
                                bind:group={userType}
                                label={$t("register.form.userType.organization")}
                                class="text-content font-body h-6 w-6 text-base leading-6 font-normal tabular-nums"
                            />
                        </div>

                        <div
                            class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch"
                        >
                            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {#if userType === "individual"}
                                    <input
                                        type="text"
                                        placeholder={$t("register.individual.firstName")}
                                        class={inputClass}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder={$t("register.individual.lastName")}
                                        class={inputClass}
                                        required
                                    />
                                {:else}
                                    <input
                                        type="text"
                                        placeholder={$t("register.organization.legalName")}
                                        class="md:col-span-2 {inputClass}"
                                        required
                                    />
                                {/if}

                                <input
                                    type="email"
                                    placeholder={$t("register.individual.email")}
                                    class="md:col-span-2 {inputClass}"
                                    required
                                />

                                <div class="flex flex-col gap-2 md:col-span-2">
                                    <input
                                        type="password"
                                        placeholder={$t("register.individual.password")}
                                        class={inputClass}
                                        required
                                    />

                                    <span
                                        class="text-content font-body w-109 text-[12px] leading-4 font-medium italic opacity-80"
                                    >
                                        {$t("register.form.validation.password.minLength")}
                                    </span>
                                </div>
                            </div>
                            <div
                                class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch"
                            >
                                <Checkbox
                                    id="tax-deduction"
                                    bind:checked={showDniField}
                                    label={$t("register.individual.taxId.msgDeduction")}
                                />
                                <input
                                    type="text"
                                    placeholder={$t("register.individual.taxId.label")}
                                    class="{inputClass} {showDniField
                                        ? 'opacity-100'
                                        : 'opacity-40'}"
                                    disabled={!showDniField}
                                    required={showDniField}
                                />
                            </div>
                        </div>
                        <div
                            class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch"
                        >
                            <Checkbox id="policies" bind:checked={acceptTerms}>
                                <span class="text-content inline text-base leading-6 font-normal">
                                    <Thtml key="register.form.policiesCheckbox"
                                        vars={{
                                            terms: `<a href="/legal/terms" class="inline text-secondary underline font-bold hover:opacity-80">`,
                                            _terms: "</a>",
                                            privacy: `<a href="/legal/privacy" class="inline text-secondary underline font-bold hover:opacity-80">`,
                                            _privacy: "</a>",
                                            cookies: `<a href="/legal/cookies" class="inline text-secondary underline font-bold hover:opacity-80">`,
                                            _cookies: "</a>",
                                        }}
                                    />
                                </span>
                            </Checkbox>
                        </div>
                    </form>
                    <div class="flex flex-col items-start">
                        <p class="text-content font-body w-109.25 text-base leading-8 font-normal">
                            {$t("register.page.otherAccessMethods")}
                        </p>

                        <Oauth />
                    </div>
                </div>

                <aside
                    class="flex w-full items-start gap-10 self-start pt-10 lg:sticky lg:top-(--sticky-top) lg:ml-auto lg:w-[50%] lg:max-w-[45%]"
                >
                    <Card
                        class="border-secondary flex h-fit w-full flex-col gap-4 rounded-[40px] border bg-white p-8 shadow-sm lg:p-6"
                    >
                        <Summary hasError={errorMessage.length > 0} />

                        <Steps step={currentStep} hasError={errorMessage !== ""} />
                        <p
                            class="text-content font-body text-body-small self-stretch py-3 leading-4 font-medium"
                        >
                            {$t("checkout.summary.deduct")}
                        </p>

                        <Button
                            type="submit"
                            form="register"
                            class="flex bg-primary text-secondary font-karla text-body-small items-center justify-center gap-2 self-start rounded-3xl px-6 py-4 leading-4 font-bold"
                        >
                            {#if isSubmitting}
                                <span class="italic">{$t("system.loading")}</span>
                            {:else}
                                {$t("checkout.btnContinue.label")}
                            {/if}
                        </Button>
                    </Card>
                </aside>
            </div>
        </div>
    </div>
</App>
