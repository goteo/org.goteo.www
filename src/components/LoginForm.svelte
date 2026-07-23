<script lang="ts">
    import { onMount } from "svelte";

    import { t } from "../i18n/store";
    import App from "../layouts/App.svelte";
    import Steps from "./checkout/Steps.svelte";
    import Summary from "./checkout/Summary.svelte";
    import BackButton from "./library/buttons/BackButton.svelte";
    import Button from "./library/buttons/Button.svelte";
    import Card from "./library/cards/Card.svelte";
    import Checkbox from "./library/inputs/Checkbox.svelte";
    import TextInput from "./library/inputs/TextInput.svelte";
    import Thtml from "./library/typography/Thtml.svelte";
    import Oauth from "./Oauth.svelte";

    import type { Locale } from "../i18n/locales";

    interface Props {
        lang: Locale;
        currentStep?: number;
        session?: any;
    }

    let { lang, currentStep = 2, session }: Props = $props();

    let email = $state("");
    let password = $state("");
    let acceptTerms = $state(false);
    let isSubmitting = $state(false);
    let errorMessage = $state("");

    onMount(() => {});

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        isSubmitting = true;
    };
</script>

<App locale={lang} {session}>
    <div class="min-h-screen bg-white py-4">
        <div class="mx-auto max-w-353 px-6 lg:px-2">
            <div class="flex flex-col gap-10 lg:flex-row lg:items-start">
                <div class="flex flex-[0_0_1] flex-col items-start gap-10">
                    <BackButton />

                    <div class="flex flex-col items-start gap-10 self-stretch">
                        <h1 class="self-stretch text-[40px] leading-12 font-bold text-black">
                            {$t("register.page.title")}
                        </h1>
                        <p class="text-content self-stretch text-base leading-6 font-normal">
                            {$t("register.page.description")}
                        </p>
                    </div>

                    <div class="flex items-center gap-4">
                        <h2 class="text-secondary text-2xl leading-8 font-bold">
                            {$t("register.page.registerOr")}
                        </h2>
                        <a
                            href="/register?checkout=true"
                            class="bg-variant1 text-secondary line-clamp-1 flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2 text-base leading-6 font-bold text-ellipsis"
                        >
                            {$t("register.page.loginBtnLabel")}
                        </a>
                    </div>

                    <div>
                        <p class="text-content w-109 text-base leading-6 font-normal">
                            {$t("register.page.goteoUserInfo")}
                        </p>
                    </div>

                    <form id="login" onsubmit={handleSubmit} class="flex w-full flex-col gap-8">
                        <div
                            class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch"
                        >
                            <div class="grid w-full grid-cols-1 gap-4">
                                <TextInput
                                    type="text"
                                    placeholder={$t("login.form.email")}
                                    bind:value={email}
                                    required
                                />

                                <div class="flex flex-col gap-2">
                                    <TextInput
                                        type="password"
                                        placeholder={$t("register.individual.password")}
                                        bind:value={password}
                                        required
                                    />

                                    <div class="pt-1 text-left">
                                        <a
                                            href="/password/recover"
                                            class="text-secondary text-sm font-bold underline hover:opacity-80"
                                        >
                                            {$t("login.page.forgotPassword")}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch"
                        >
                            <Checkbox id="policies" bind:checked={acceptTerms}>
                                <Thtml
                                    key="register.form.termsCheckbox"
                                    vars={{
                                        legal: `<a href="condiciones/legales" class="text-secondary underline font-bold hover:opacity-80">`,
                                        _legal: "</a>",
                                    }}
                                />
                            </Checkbox>
                        </div>
                    </form>

                    <div class="flex flex-col items-start">
                        <p class="text-content w-109.25 text-base leading-8 font-normal">
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

                        <p class="text-content self-stretch py-3 text-sm font-medium">
                            {$t("checkout.summary.deduct")}
                        </p>

                        <Button
                            type="submit"
                            form="login"
                            class="bg-primary text-secondary flex items-center justify-center gap-2 self-start rounded-3xl px-6 py-4 text-sm leading-4 font-bold"
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
