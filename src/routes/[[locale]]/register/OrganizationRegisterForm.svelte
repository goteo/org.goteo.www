<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { SuperForm } from "sveltekit-superforms";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import type { FormSchema } from "./schema";

  export let form: SuperForm<FormSchema>;

  const { form: formData } = form;
</script>

<Form.Field {form} name="legalName">
  <Form.Control let:attrs>
    <Input {...attrs} bind:value={$formData.legalName} placeholder={$_("register.organization.legalName")} />
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
<Form.Field {form} name="email">
  <Form.Control let:attrs>
    <Input {...attrs} bind:value={$formData.email} placeholder={$_("register.organization.email")} />
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
<Form.Field {form} name="password">
  <Form.Control let:attrs>
    <Input {...attrs} bind:value={$formData.password} placeholder={$_("register.organization.password")} />
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="taxId">
  <Form.Control let:attrs>
    <Input {...attrs} bind:value={$formData.taxId} placeholder={$_("register.organization.taxId")} />
  </Form.Control>
  <Form.Description>{$_("register.organization.taxIdDescription")}</Form.Description>
  <Form.FieldErrors />
</Form.Field>

<Form.Fieldset {form} name="type" class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Form.Legend>{$_("register.organization.representativeTitle")}</Form.Legend>
  <Form.Field {form} name="first_name">
    <Form.Control let:attrs>
      <Input {...attrs} bind:value={$formData.first_name} placeholder={$_("register.organization.firstName")} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="last_name">
    <Form.Control let:attrs>
      <Input {...attrs} bind:value={$formData.last_name} placeholder={$_("register.organization.lastName")} />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
</Form.Fieldset>
