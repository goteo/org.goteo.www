<script lang="ts">
    import { navigate } from "astro:transitions/client";

    import { t } from "../../i18n/store";
    import Toast from "../library/feedback/Toast.svelte";
    import Checkbox from "../library/inputs/Checkbox.svelte";
    import TextInput from "../library/inputs/TextInput.svelte";
    import Thtml from "../library/typography/Thtml.svelte";
    import Title from "../library/typography/Title.svelte";
    import PasswordInput from "../library/inputs/PasswordInput.svelte";

    let email = $state("");
    let password = $state("");
    let acceptTerms = $state(false);
    let isSubmitting = $state(false);
    let errorMessage = $state("");
    let showToast = $state(false);

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        if (!acceptTerms) {
            errorMessage = $t("system.validation.missingRequiredFields");
            showToast = true;
            return;
        }

        isSubmitting = true;
        showToast = false;
        errorMessage = "";

        try {
            const response = await fetch("/api/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: email, password }),
            });

            const data = (await response.json()) as { error_description?: string };

            if (!response.ok) {
                throw new Error(
                    data.error_description || $t("pages.checkout.login.error.invalidCredentials"),
                );
            }

            const urlParams = new URLSearchParams(window.location.search);
            const callbackUrl = urlParams.get("callback");

            const targetUrl = callbackUrl || "/";
            navigate(targetUrl);
        } catch (err: any) {
            errorMessage = err.message || $t("pages.checkout.login.error.unexpectedLogin");
            showToast = true;
        } finally {
            isSubmitting = false;
        }
    };
</script>

<div class="flex w-full flex-col items-start gap-10 self-stretch">
    <div class="flex flex-col items-start gap-10 self-stretch">
        <Title level={1} variant="headline" class="self-stretch">
            {$t("pages.checkout.login.sheet.headerLogin")}
        </Title>
        <p class="text-content self-stretch text-base leading-6 font-normal">
            {$t("pages.checkout.login.sheet.description")}
        </p>
    </div>

    <div class="flex items-center gap-4">
        <h2 class="text-secondary text-2xl leading-8 font-bold">
            {$t("pages.checkout.login.sheet.registerOr")}
        </h2>
        <a
            href="/checkout/register?callback=/checkout/payment"
            class="bg-variant1 text-secondary line-clamp-1 flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2 text-base leading-6 font-bold text-ellipsis"
        >
            {$t("pages.checkout.login.sheet.registerBtnLabel")}
        </a>
    </div>

    <form onsubmit={handleSubmit} class="flex w-full flex-col gap-8">
        <Toast variant="error" bind:showToast class="w-full max-w-121">
            {errorMessage}
        </Toast>

        <div class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch">
            <div class="grid w-full grid-cols-1 gap-4">
                <TextInput
                    type="text"
                    placeholder={$t("pages.checkout.login.form.emailOrUsername")}
                    bind:value={email}
                    disabled={isSubmitting}
                    required
                />

                <PasswordInput
                    placeholder={$t("pages.checkout.login.form.password")}
                    bind:value={password}
                    disabled={isSubmitting}
                    required
                />

                <a
                    href="/password/recover"
                    class="text-secondary text-sm font-bold underline hover:opacity-80"
                >
                    {$t("pages.checkout.login.sheet.forgotPassword")}
                </a>

                <div class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch">
                    <Checkbox id="policies" bind:checked={acceptTerms} disabled={isSubmitting}>
                        <span>
                            <Thtml
                                key="pages.checkout.login.form.termsCheckbox"
                                vars={{
                                    link: '<a href="/terms" class="text-secondary underline font-bold hover:opacity-80">',
                                    _link: "</a>",
                                }}
                            />
                        </span>
                    </Checkbox>
                </div>
            </div>
        </div>

        <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>
</div>
