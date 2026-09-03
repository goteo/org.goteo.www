<script lang="ts">
    import { actions, isInputError } from "astro:actions";
    import { navigate } from "astro:transitions/client";

    import { t } from "../../i18n/store";
    import Toast from "../library/feedback/Toast.svelte";
    import Checkbox from "../library/inputs/Checkbox.svelte";
    import PasswordInput from "../library/inputs/PasswordInput.svelte";
    import RadioButton from "../library/inputs/RadioButton.svelte";
    import TextInput from "../library/inputs/TextInput.svelte";
    import Thtml from "../library/typography/Thtml.svelte";
    import Title from "../library/typography/Title.svelte";

    type FieldName =
        | "type"
        | "identifier"
        | "password"
        | "firstname"
        | "lastname"
        | "dni"
        | "razonSocial"
        | "cif";

    interface Props {
        callback?: string;
    }

    let { callback }: Props = $props();

    let loginLink = $derived(
        callback ? `/checkout/login?callback=${encodeURIComponent(callback)}` : "/checkout/login",
    );

    let userType = $state("individual");
    let showDniField = $state(false);
    let acceptTerms = $state(false);
    let isSubmitting = $state(false);

    let subtitle = $derived(
        userType === "individual"
            ? $t("pages.checkout.register.description")
            : $t("pages.checkout.register.organization.description"),
    );

    let loginBtnLabel = $derived(
        userType === "individual"
            ? $t("pages.checkout.register.loginBtnLabel")
            : $t("pages.checkout.register.organization.loginBtnLabel"),
    );

    let firstname = $state("");
    let lastname = $state("");
    let identifier = $state("");
    let password = $state("");
    let dni = $state("");
    let razonSocial = $state("");
    let cif = $state("");

    let fieldErrors = $state<Partial<Record<FieldName | "_checks" | "_form", string>>>({});
    let showFormToast = $state(false);
    let showChecksToast = $state(false);

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        const errors: Partial<Record<FieldName, string>> = {};
        const requiredText = $t("pages.checkout.register.form.validation.required");

        if (!firstname.trim()) errors.firstname = requiredText;
        if (!lastname.trim()) errors.lastname = requiredText;
        if (!identifier.trim()) errors.identifier = requiredText;
        if (!password) errors.password = requiredText;
        else if (password.length < 8) {
            errors.password = $t("pages.checkout.register.form.validation.password.minLength");
        }

        if (userType === "organization") {
            if (!razonSocial.trim()) errors.razonSocial = requiredText;
            if (!cif.trim()) errors.cif = requiredText;
        }

        if (userType === "individual" && showDniField && !dni.trim()) {
            errors.dni = requiredText;
        }

        if (Object.keys(errors).length > 0) {
            fieldErrors = errors;
            return;
        }

        if (!acceptTerms) {
            fieldErrors = { _checks: $t("pages.checkout.register.error.requireTerms") };
            showChecksToast = true;
            return;
        }

        isSubmitting = true;
        fieldErrors = {};
        showFormToast = false;
        showChecksToast = false;

        const form = e.currentTarget as HTMLFormElement;
        const { error } = await actions.register(new FormData(form));

        isSubmitting = false;

        if (error) {
            if (isInputError(error)) {
                const issues: Partial<Record<FieldName, string>> = {};
                for (const issue of error.issues) {
                    const field = String(issue.path?.[0] ?? "") as FieldName;
                    if (field && !issues[field]) {
                        issues[field] = issue.message;
                    }
                }
                fieldErrors = issues;
                return;
            }

            fieldErrors = { _form: error.message };
            showFormToast = true;
            return;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const callbackUrl = urlParams.get("callback");
        const targetUrl = callbackUrl || callback || "/";
        navigate(targetUrl);
    };
</script>

<div class="flex w-full flex-col items-start gap-10 self-stretch">
    <div class="flex flex-col items-start gap-10 self-stretch">
        <Title level={1} variant="headline" class="self-stretch">
            {$t("pages.checkout.register.title")}
        </Title>
        <p class="text-content self-stretch text-base leading-6 font-normal">
            {subtitle}
        </p>
    </div>

    <div class="text-content flex flex-col gap-4">
        <div class="flex items-center gap-4">
            <h2 class="text-secondary text-2xl leading-8 font-bold">
                {$t("pages.checkout.register.registerOr")}
            </h2>
            <a
                href={loginLink}
                class="bg-variant1 text-secondary line-clamp-1 flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 py-2 text-base leading-6 font-bold text-ellipsis"
            >
                {loginBtnLabel}
            </a>
        </div>

        <p class="text-content text-base leading-6 font-normal">
            {$t("pages.checkout.register.existUserInfo")}
        </p>
    </div>

    <form onsubmit={handleSubmit} class="flex w-full flex-col gap-10" id="register" novalidate>
        <div class="flex items-center gap-8">
            <RadioButton
                name="type"
                value="individual"
                bind:group={userType}
                label={$t("pages.checkout.register.form.userType.individual")}
                class="h-6 w-6 tabular-nums"
            />
            <RadioButton
                name="type"
                value="organization"
                bind:group={userType}
                label={$t("pages.checkout.register.form.userType.organization")}
                class="h-6 w-6 tabular-nums"
            />
        </div>

        <div class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch">
            <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {#if userType === "individual"}
                    <TextInput
                        type="text"
                        name="firstname"
                        placeholder={$t("pages.checkout.register.individual.firstName")}
                        helperText={$t("pages.checkout.register.individual.firstNameHelper")}
                        error={fieldErrors.firstname}
                        bind:value={firstname}
                        disabled={isSubmitting}
                        required
                    />
                    <TextInput
                        type="text"
                        name="lastname"
                        placeholder={$t("pages.checkout.register.individual.lastName")}
                        helperText={$t("pages.checkout.register.individual.lastNameHelper")}
                        error={fieldErrors.lastname}
                        bind:value={lastname}
                        disabled={isSubmitting}
                        required
                    />
                    <div class="md:col-span-2">
                        <TextInput
                            type="email"
                            name="identifier"
                            placeholder={$t("pages.checkout.register.individual.email")}
                            helperText={$t("pages.checkout.register.form.emailHelper")}
                            error={fieldErrors.identifier}
                            class="h-14"
                            bind:value={identifier}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <PasswordInput
                        name="password"
                        placeholder={$t("pages.checkout.register.individual.password")}
                        helperText={$t(
                            "pages.checkout.register.form.validation.password.minLength",
                        )}
                        error={fieldErrors.password}
                        class="md:col-span-2"
                        bind:value={password}
                        disabled={isSubmitting}
                        required
                    />
                {:else}
                    <div class="md:col-span-2">
                        <TextInput
                            type="text"
                            name="razonSocial"
                            placeholder={$t("pages.checkout.register.organization.legalName")}
                            helperText={$t("pages.checkout.register.organization.legalNameHelper")}
                            error={fieldErrors.razonSocial}
                            class="h-14"
                            bind:value={razonSocial}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div class="md:col-span-2">
                        <TextInput
                            type="email"
                            name="identifier"
                            placeholder={$t("pages.checkout.register.individual.email")}
                            helperText={$t("pages.checkout.register.form.emailHelper")}
                            error={fieldErrors.identifier}
                            class="h-14"
                            bind:value={identifier}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <PasswordInput
                        name="password"
                        placeholder={$t("pages.checkout.register.individual.password")}
                        helperText={$t(
                            "pages.checkout.register.form.validation.password.minLength",
                        )}
                        error={fieldErrors.password}
                        class="md:col-span-2"
                        bind:value={password}
                        disabled={isSubmitting}
                        required
                    />
                    <div class="md:col-span-2">
                        <TextInput
                            type="text"
                            name="cif"
                            placeholder={$t("pages.checkout.register.organization.taxId")}
                            helperText={$t("pages.checkout.register.organization.cifHelper")}
                            error={fieldErrors.cif}
                            class="h-14"
                            bind:value={cif}
                            disabled={isSubmitting}
                            required
                        />
                    </div>
                    <div class="md:col-span-2">
                        <h3 class="text-secondary text-lg leading-6 font-bold">
                            {$t("pages.checkout.register.organization.representative.title")}
                        </h3>
                    </div>
                    <TextInput
                        type="text"
                        name="firstname"
                        placeholder={$t("pages.checkout.register.individual.firstName")}
                        helperText={$t("pages.checkout.register.individual.firstNameHelper")}
                        error={fieldErrors.firstname}
                        bind:value={firstname}
                        disabled={isSubmitting}
                        required
                    />
                    <TextInput
                        type="text"
                        name="lastname"
                        placeholder={$t("pages.checkout.register.individual.lastName")}
                        helperText={$t("pages.checkout.register.individual.lastNameHelper")}
                        error={fieldErrors.lastname}
                        bind:value={lastname}
                        disabled={isSubmitting}
                        required
                    />
                {/if}
            </div>

            {#if userType === "individual"}
                <div class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch">
                    <Checkbox
                        id="tax-deduction"
                        bind:checked={showDniField}
                        label={$t("pages.checkout.register.individual.taxId.msgDeduction")}
                        disabled={isSubmitting}
                    />
                    {#if showDniField}
                        <div class="w-full">
                            <TextInput
                                type="text"
                                name="dni"
                                placeholder={$t("pages.checkout.register.individual.taxId.label")}
                                helperText={$t("pages.checkout.register.individual.dniHelper")}
                                error={fieldErrors.dni}
                                disabled={isSubmitting}
                                required
                                bind:value={dni}
                            />
                        </div>
                    {/if}
                </div>
            {/if}
        </div>

        <div class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch">
            <Checkbox id="policies" bind:checked={acceptTerms} disabled={isSubmitting} required>
                <span class="text-content inline text-base leading-6 font-normal">
                    <Thtml
                        key="pages.checkout.register.form.policiesCheckbox"
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

            {#if showChecksToast}
                <Toast variant="error" bind:showToast={showChecksToast} class="w-full">
                    {fieldErrors._checks}
                </Toast>
            {/if}
            {#if showFormToast}
                <Toast variant="error" bind:showToast={showFormToast} class="w-full">
                    {fieldErrors._form}
                </Toast>
            {/if}
        </div>

        <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>
</div>
