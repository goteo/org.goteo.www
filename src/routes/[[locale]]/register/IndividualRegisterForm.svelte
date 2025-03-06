<script lang="ts">
    import { _ } from "svelte-i18n";
    import type { SuperForm } from "sveltekit-superforms";
    import * as Form from "$lib/components/ui/form";
    import { Input } from "$lib/components/ui/input";
    import { Checkbox } from "$lib/components/ui/checkbox";
    import type { FormSchema } from "./schema";

    export let form: SuperForm<FormSchema>;

    const { form: formData } = form;
</script>

<Form.Fieldset {form} name="type" class="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
    <Form.Field {form} name="firstName" class="mt-2">
        <Form.Control let:attrs>
            <Input
                {...attrs}
                bind:value={$formData.firstName}
                placeholder={$_("register.individual.firstName")}
            />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="lastName">
        <Form.Control let:attrs>
            <Input
                {...attrs}
                bind:value={$formData.lastName}
                placeholder={$_("register.individual.lastName")}
            />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
</Form.Fieldset>

<Form.Field {form} name="email">
    <Form.Control let:attrs>
        <Input
            {...attrs}
            bind:value={$formData.email}
            placeholder={$_("register.individual.email")}
        />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>
<Form.Field {form} name="password">
    <Form.Control let:attrs>
        <Input
            {...attrs}
            bind:value={$formData.password}
            placeholder={$_("register.individual.password")}
        />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>
<Form.Field {form} name="hasTaxId" class="flex items-center space-x-2">
    <Form.Control let:attrs>
        <Checkbox {...attrs} bind:checked={$formData.hasTaxId} />
        <Form.Label class="font-normal">
            {$_("register.individual.taxIdCheckbox")}
        </Form.Label>
        <input name={attrs.name} value={$formData.hasTaxId} hidden />
    </Form.Control>
    <Form.FieldErrors />
</Form.Field>

{#if $formData.hasTaxId}
    <Form.Field {form} name="taxId">
        <Form.Control let:attrs>
            <Input
                {...attrs}
                bind:value={$formData.taxId}
                placeholder={$_("register.individual.taxId")}
            />
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
{/if}
