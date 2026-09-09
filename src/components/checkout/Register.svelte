<script lang="ts">
    import { actions, isInputError } from "astro:actions";
    import { navigate } from "astro:transitions/client";


    import { t } from "../../i18n/store";
    import { getValidationParams } from "../../utils/validation";
    import { zRegisterForm } from "../../validation/registerValidation";
    import Toast from "../library/feedback/Toast.svelte";
    import Checkbox from "../library/inputs/Checkbox.svelte";
    import PasswordInput from "../library/inputs/PasswordInput.svelte";
    import RadioButton from "../library/inputs/RadioButton.svelte";
    import TextInput from "../library/inputs/TextInput.svelte";
    import Thtml from "../library/typography/Thtml.svelte";
    import Title from "../library/typography/Title.svelte";

    import type z from "zod";

    type FieldName = keyof typeof zRegisterForm.shape;

    interface RegisterForm {
        type: "individual" | "organization";
        identifier: string;
        password: string;
        firstname: string;
        lastname: string;
        taxId: string;
        legalName: string;
    }

    interface Props {
        callback?: string;
    }

    let { callback }: Props = $props();

    let loginLink = $derived(
        callback ? `/checkout/login?callback=${encodeURIComponent(callback)}` : "/checkout/login",
    );

    let form: RegisterForm = $state({
        type: "individual",
        identifier: "",
        password: "",
        firstname: "",
        lastname: "",
        taxId: "",
        legalName: "",
    });

    let showTaxIdField = $state(false);
    let acceptTerms = $state(false);
    let isSubmitting = $state(false);

    let subtitle = $derived(
        form.type === "individual"
            ? $t("pages.checkout.register.description")
            : $t("pages.checkout.register.organization.description"),
    );

    let loginBtnLabel = $derived(
        form.type === "individual"
            ? $t("pages.checkout.register.loginBtnLabel")
            : $t("pages.checkout.register.organization.loginBtnLabel"),
    );

    let validation = $state<Partial<Record<FieldName, z.core.$ZodIssue[]>>>({});
    let checksError = $state("");
    let formError = $state("");
    let showFormToast = $state(false);
    let showChecksToast = $state(false);

    function validate(field: FieldName) {
        const result = zRegisterForm.shape[field].safeParse(form[field]);

        validation[field] = result.error?.issues;
    }

    function getValidationMessage(field: FieldName) {
        const issue = validation[field]?.[0];

        if (!issue) {
            return "";
        }

        if (issue.code === "custom") {
            return $t(issue.message, issue.params);
        }

        if (issue.code === "too_small" && field === "password") {
            return $t("pages.checkout.register.form.validation.password.minLength");
        }

        if (issue.code === "invalid_format" && field === "identifier") {
            return $t("pages.checkout.register.form.validation.emailInvalid");
        }

        return $t(`system.validation.${issue.code}`, {
            value: String(form[field]),
            ...getValidationParams(issue),
        });
    }

    const handleSubmit = async (e: SubmitEvent) => {
        e.preventDefault();

        validation = {};
        showFormToast = false;
        showChecksToast = false;

        const result = zRegisterForm.safeParse({
            type: form.type,
            identifier: form.identifier,
            password: form.password,
            firstname: form.firstname,
            lastname: form.lastname,
            taxId: form.type === "organization" || showTaxIdField ? form.taxId : undefined,
            legalName: form.type === "organization" ? form.legalName : undefined,
        });

        if (!result.success) {
            for (const issue of result.error.issues) {
                const field = issue.path[0] as FieldName;

                validation[field] = [...(validation[field] ?? []), issue];
            }
        }

        if (form.type === "individual" && showTaxIdField && !form.taxId.trim()) {
            validation.taxId = [
                {
                    code: "custom",
                    path: ["taxId"],
                    message: "pages.checkout.register.form.validation.required",
                } as z.core.$ZodIssue,
            ];
        }

        if (Object.values(validation).some((issues) => issues?.length)) {
            return;
        }

        if (!acceptTerms) {
            checksError = $t("pages.checkout.register.error.requireTerms");
            showChecksToast = true;
            return;
        }

        isSubmitting = true;
        formError = "";

        const formElement = e.currentTarget as HTMLFormElement;
        const { error } = await actions.register(new FormData(formElement));

        isSubmitting = false;

        if (error) {
            if (isInputError(error)) {
                for (const issue of error.issues) {
                    const field = String(issue.path?.[0] ?? "") as FieldName;

                    validation[field] = [...(validation[field] ?? []), issue];
                }
                return;
            }

            formError = error.message;
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
                bind:group={form.type}
                label={$t("pages.checkout.register.form.userType.individual")}
                class="h-6 w-6 tabular-nums"
            />
            <RadioButton
                name="type"
                value="organization"
                bind:group={form.type}
                label={$t("pages.checkout.register.form.userType.organization")}
                class="h-6 w-6 tabular-nums"
            />
        </div>

        <div class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch">
            <div class="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
                {#if form.type === "individual"}
                    <TextInput
                        type="text"
                        name="firstname"
                        placeholder={$t("pages.checkout.register.individual.firstName")}
                        helperText={$t("pages.checkout.register.individual.firstNameHelper")}
                        error={getValidationMessage("firstname")}
                        bind:value={form.firstname}
                        onInput={() => validate("firstname")}
                        disabled={isSubmitting}
                        required
                    />
                    <TextInput
                        type="text"
                        name="lastname"
                        placeholder={$t("pages.checkout.register.individual.lastName")}
                        helperText={$t("pages.checkout.register.individual.lastNameHelper")}
                        error={getValidationMessage("lastname")}
                        bind:value={form.lastname}
                        onInput={() => validate("lastname")}
                        disabled={isSubmitting}
                        required
                    />
                    <div class="md:col-span-2">
                        <TextInput
                            type="email"
                            name="identifier"
                            placeholder={$t("pages.checkout.register.individual.email")}
                            helperText={$t("pages.checkout.register.form.emailHelper")}
                            error={getValidationMessage("identifier")}
                            class="h-14"
                            bind:value={form.identifier}
                            onInput={() => validate("identifier")}
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
                        error={getValidationMessage("password")}
                        class="md:col-span-2"
                        bind:value={form.password}
                        onInput={() => validate("password")}
                        disabled={isSubmitting}
                        required
                    />
                {:else}
                    <div class="md:col-span-2">
                        <TextInput
                            type="text"
                            name="legalName"
                            placeholder={$t("pages.checkout.register.organization.legalName")}
                            helperText={$t("pages.checkout.register.organization.legalNameHelper")}
                            error={getValidationMessage("legalName")}
                            class="h-14"
                            bind:value={form.legalName}
                            onInput={() => validate("legalName")}
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
                            error={getValidationMessage("identifier")}
                            class="h-14"
                            bind:value={form.identifier}
                            onInput={() => validate("identifier")}
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
                        error={getValidationMessage("password")}
                        class="md:col-span-2"
                        bind:value={form.password}
                        onInput={() => validate("password")}
                        disabled={isSubmitting}
                        required
                    />
                    <div class="md:col-span-2">
                        <TextInput
                            type="text"
                            name="taxId"
                            placeholder={$t("pages.checkout.register.organization.taxId")}
                            helperText={$t("pages.checkout.register.organization.taxIdHelper")}
                            error={getValidationMessage("taxId")}
                            class="h-14"
                            bind:value={form.taxId}
                            onInput={() => validate("taxId")}
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
                        error={getValidationMessage("firstname")}
                        bind:value={form.firstname}
                        onInput={() => validate("firstname")}
                        disabled={isSubmitting}
                        required
                    />
                    <TextInput
                        type="text"
                        name="lastname"
                        placeholder={$t("pages.checkout.register.individual.lastName")}
                        helperText={$t("pages.checkout.register.individual.lastNameHelper")}
                        error={getValidationMessage("lastname")}
                        bind:value={form.lastname}
                        onInput={() => validate("lastname")}
                        disabled={isSubmitting}
                        required
                    />
                {/if}
            </div>

            {#if form.type === "individual"}
                <div class="flex max-w-121 flex-initial flex-col items-start gap-5 self-stretch">
                    <Checkbox
                        id="tax-deduction"
                        bind:checked={showTaxIdField}
                        label={$t("pages.checkout.register.individual.taxId.msgDeduction")}
                        disabled={isSubmitting}
                    />
                    {#if showTaxIdField}
                        <div class="w-full">
                            <TextInput
                                type="text"
                                name="taxId"
                                placeholder={$t("pages.checkout.register.individual.taxId.label")}
                                helperText={$t("pages.checkout.register.individual.taxIdHelper")}
                                error={getValidationMessage("taxId")}
                                disabled={isSubmitting}
                                required
                                bind:value={form.taxId}
                                onInput={() => validate("taxId")}
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
                    {checksError}
                </Toast>
            {/if}
            {#if showFormToast}
                <Toast variant="error" bind:showToast={showFormToast} class="w-full">
                    {formError}
                </Toast>
            {/if}
        </div>

        <button type="submit" class="hidden" aria-hidden="true"></button>
    </form>
</div>
