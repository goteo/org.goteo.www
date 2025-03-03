<script lang="ts">
  import { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardHeader, CardTitle } from "$lib/components/ui/card";

  import CheckoutSummary from "$lib/components/CheckoutSummary";
  import { schema } from "./schema";

  let { data } = $props();

  const form = superForm(data.form, {
    validators: zodClient(schema),
  });

  const { form: formData, enhance } = form;
</script>

<div class="container mx-auto p-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl font-bold">Register</CardTitle>
          <div class="flex justify-end">
            <Button variant="outline" href={`/login`}>Already have an account? Log in</Button>
          </div>
        </CardHeader>
        <CardContent>
          <form method="POST" class="space-y-6" use:enhance>
            <Form.Field {form} name="first_name">
              <Form.Control let:attrs>
                <Form.Label>First Name</Form.Label>
                <Input {...attrs} bind:value={$formData.first_name} />
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
            <Form.Field {form} name="last_name">
              <Form.Control let:attrs>
                <Form.Label>Last Name</Form.Label>
                <Input {...attrs} bind:value={$formData.last_name} />
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
            <Form.Field {form} name="email">
              <Form.Control let:attrs>
                <Form.Label>email</Form.Label>
                <Input {...attrs} bind:value={$formData.email} />
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>
            <Form.Field {form} name="password">
              <Form.Control let:attrs>
                <Form.Label>Password</Form.Label>
                <Input {...attrs} bind:value={$formData.password} />
              </Form.Control>
              <Form.FieldErrors />
            </Form.Field>

            <Form.Button>Submit</Form.Button>
          </form>
        </CardContent>
      </Card>
    </div>

    <div>
      <CheckoutSummary />
    </div>
  </div>
</div>
