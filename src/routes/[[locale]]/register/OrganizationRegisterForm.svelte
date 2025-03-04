<script lang="ts">
  import type { SuperForm } from "sveltekit-superforms";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import type { FormSchema } from "./schema";

  export let form: SuperForm<FormSchema>;

  const { form: formData } = form;
</script>

<Form.Field {form} name="legalName">
  <Form.Control let:attrs>
    <Input {...attrs} bind:value={$formData.legalName} placeholder="Razón social" />
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
<Form.Field {form} name="email">
  <Form.Control let:attrs>
    <Input {...attrs} bind:value={$formData.email} placeholder="Correo electrónico" />
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>
<Form.Field {form} name="password">
  <Form.Control let:attrs>
    <Input {...attrs} bind:value={$formData.password} placeholder="Contraseña" />
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>

<Form.Field {form} name="taxId">
  <Form.Control let:attrs>
    <Input {...attrs} bind:value={$formData.taxId} placeholder="CIF*" />
  </Form.Control>
  <Form.Description>*Con el CIF avisaremos a la agencia tributaria para la tu declaración de la renta.</Form.Description
  >
  <Form.FieldErrors />
</Form.Field>

<Form.Fieldset {form} name="type" class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Form.Legend>Datos del representante de la empresa.</Form.Legend>
  <Form.Field {form} name="first_name">
    <Form.Control let:attrs>
      <Input {...attrs} bind:value={$formData.first_name} placeholder="Nombre" />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Field {form} name="last_name">
    <Form.Control let:attrs>
      <Input {...attrs} bind:value={$formData.last_name} placeholder="Apellidos" />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
</Form.Fieldset>
