<script lang="ts">
  import { _ } from "svelte-i18n";
  import SuperDebug, { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import * as RadioGroup from "$lib/components/ui/radio-group";

  import CheckoutSummary from "$lib/components/CheckoutSummary";
  import { schema } from "./schema";
  import IndividualRegisterForm from "./IndividualRegisterForm.svelte";
  import OrganizationRegisterForm from "./OrganizationRegisterForm.svelte";

  let { data } = $props();

  const form = superForm(data.form, {
    resetForm: false,
    clearOnSubmit: "none",
    validators: zodClient(schema),
    // Optional: Handle form submission outcomes
    onResult: ({ result }) => {
      console.debug({ result });
      // Handle result as needed (e.g., show a notification)
      if (result.type === "success") {
        // Handle success
        goto("/payment");
      }
    },
  });

  // Destructure needed form properties
  const { form: formData, enhance, submit } = form;

  // Create a form submission function using SuperForms' built-in submit method
  function submitForm() {
    // Use the superForm submit method directly
    submit();
  }
</script>

<div class="container mx-auto p-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="space-y-4">
      <h2 class="text-3xl font-bold">{$_("register.page.title")}</h2>
      <p>{$_("register.page.description")}</p>
      <div class="flex items-center gap-4">
        <h3 class="text-xl font-bold">{$_("register.page.registerOr")}</h3>
        <Button variant="secondary" href={`/login`}>{$_("register.page.loginButton")}</Button>
      </div>
      <form method="POST" class="max-w-md space-y-4" use:enhance>
        <p>{$_("register.page.goteoUserInfo")}</p>
        <Form.Fieldset {form} name="type">
          <RadioGroup.Root bind:value={$formData.type} class="flex flex-row space-x-4">
            <div class="flex items-center space-x-3 space-y-0">
              <Form.Control let:attrs>
                <RadioGroup.Item value="individual" {...attrs} />
                <Form.Label class="font-normal">{$_("register.form.userType.individual")}</Form.Label>
              </Form.Control>
            </div>
            <div class="flex items-center space-x-3 space-y-0">
              <Form.Control let:attrs>
                <RadioGroup.Item value="organization" {...attrs} />
                <Form.Label class="font-normal">{$_("register.form.userType.organization")}</Form.Label>
              </Form.Control>
            </div>
            <RadioGroup.Input name="type" />
          </RadioGroup.Root>
          <Form.FieldErrors />
        </Form.Fieldset>

        {#if $formData.type === "individual"}
          <IndividualRegisterForm {form} />
        {/if}

        {#if $formData.type === "organization"}
          <OrganizationRegisterForm {form} />
        {/if}

        <Form.Field {form} name="terms" class="flex items-center space-x-2">
          <Form.Control let:attrs>
            <Checkbox {...attrs} bind:checked={$formData.terms} />
            <Form.Label class="font-normal">{$_("register.form.termsCheckbox")}</Form.Label>
            <input name={attrs.name} value={$formData.terms} hidden />
          </Form.Control>
        </Form.Field>
        <Form.Field {form} name="policies" class="flex items-center space-x-2">
          <Form.Control let:attrs>
            <Checkbox {...attrs} bind:checked={$formData.policies} />
            <Form.Label class="font-normal">
              {$_("register.form.policiesCheckbox")}
            </Form.Label>
            <input name={attrs.name} value={$formData.policies} hidden />
          </Form.Control>
        </Form.Field>
      </form>
      <p>{$_("register.page.otherAccessMethods")}</p>
    </div>

    <div>
      <CheckoutSummary confirmAction={submitForm} />
      {#if browser}
        <SuperDebug data={$formData} />
      {/if}
    </div>
  </div>
</div>
