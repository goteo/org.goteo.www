<script lang="ts">
  import SuperDebug, { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";

  import CheckoutSummary from "$lib/components/CheckoutSummary";
  import { schema } from "./schema";

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
      <h2 class="text-3xl font-bold">Indícanos tus datos personales</h2>
      <p>Necesitamos saber quién eres antes de pagar.</p>
      <div class="flex items-center gap-4">
        <h3 class="text-xl font-bold">Regístrate o</h3>
        <Button variant="secondary" href={`/login`}>Entra con tu cuenta</Button>
      </div>
      <form method="POST" class="max-w-md space-y-4" use:enhance>
        <p>Si ya eres usuario de Goteo identificate. Podrás hacer uso de tu monedero para realizar estas donaciones.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
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
            <Form.Label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Deseo desgravar esta donación. Es necesario indicar el número de DNI para comunicárselo a Hacienda.
            </Form.Label>
            <input name={attrs.name} value={$formData.hasTaxId} hidden />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="taxId">
          <Form.Control let:attrs>
            <Input {...attrs} bind:value={$formData.taxId} placeholder="DNI*" />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="terms" class="flex items-center space-x-2">
          <Form.Control let:attrs>
            <Checkbox {...attrs} bind:checked={$formData.terms} />
            <Form.Label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >Acepto las condiciones legales</Form.Label
            >
            <input name={attrs.name} value={$formData.terms} hidden />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="policies" class="flex items-center space-x-2">
          <Form.Control let:attrs>
            <Checkbox {...attrs} bind:checked={$formData.policies} />
            <Form.Label
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Al registrarme confirmo mi aceptación de vuestros términos de uso, política de privacidad y política de
              cookies.
            </Form.Label>
            <input name={attrs.name} value={$formData.policies} hidden />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
      </form>
      <p>También puedes acceder a través de:</p>
    </div>

    <div>
      <CheckoutSummary confirmAction={submitForm} />
      {#if browser}
        <SuperDebug data={$formData} />
      {/if}
    </div>
  </div>
</div>
