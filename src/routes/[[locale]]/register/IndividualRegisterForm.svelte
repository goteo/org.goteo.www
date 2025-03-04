<script lang="ts">
  import type { SuperForm } from "sveltekit-superforms";
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import type { FormSchema } from "./schema";

  export let form: SuperForm<FormSchema>;

  const { form: formData } = form;
</script>

<Form.Fieldset {form} name="type" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
<Form.Field {form} name="hasTaxId" class="flex items-center space-x-2">
  <Form.Control let:attrs>
    <Checkbox {...attrs} bind:checked={$formData.hasTaxId} />
    <Form.Label class="font-normal">
      Deseo desgravar esta donación. Es necesario indicar el número de DNI para comunicárselo a Hacienda.
    </Form.Label>
    <input name={attrs.name} value={$formData.hasTaxId} hidden />
  </Form.Control>
  <Form.FieldErrors />
</Form.Field>

{#if $formData.hasTaxId}
  <Form.Field {form} name="taxId">
    <Form.Control let:attrs>
      <Input {...attrs} bind:value={$formData.taxId} placeholder="DNI*" />
    </Form.Control>
    <Form.FieldErrors />
  </Form.Field>
{/if}
