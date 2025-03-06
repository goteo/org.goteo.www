<script lang="ts">
  import { _ } from "svelte-i18n";
  import { toast } from "svelte-sonner";
  import SuperDebug, { superForm } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { browser } from "$app/environment";

  import * as Form from "$lib/components/ui/form";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import CheckoutSummary from "$lib/components/CheckoutSummary";
  import LoginCard from "$lib/components/LoginCard";

  import { schema } from "./schema";

  let { data } = $props();

  const form = superForm(data.form, {
    validators: zodClient(schema),
    onResult: ({ result }) => {
      // console.log(result);
      switch (result.type) {
        case "success":
          toast.success(result.data?.form.message);
          break;
        case "failure":
          toast.error(result.data?.message);
          break;
      }
    },
  });

  const { form: formData, enhance, submit } = form;
</script>

<div class="container mx-auto p-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div class="space-y-4">
      <h2 class="text-3xl font-bold">{$_("login.page.title")}</h2>
      <p>{$_("login.page.description")}</p>
      <div class="flex items-center gap-4">
        <h3 class="text-xl font-bold">{$_("login.page.registerOr")}</h3>
        <Button variant="secondary" href={`/register`}>{$_("login.page.loginButton")}</Button>
      </div>
      <form method="POST" class="max-w-md space-y-4" use:enhance>
        <p>{$_("login.page.goteoUserInfo")}</p>
        <Form.Field {form} name="email">
          <Form.Control let:attrs>
            <Input {...attrs} bind:value={$formData.email} placeholder={$_("login.form.email")} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <Form.Field {form} name="password">
          <Form.Control let:attrs>
            <Input {...attrs} bind:value={$formData.password} placeholder={$_("login.form.password")} />
          </Form.Control>
          <Form.FieldErrors />
        </Form.Field>
        <a href="#" class="font-bold">{$_("login.page.forgotPassword")}</a>
        <LoginCard />
      </form>
    </div>

    <div>
      <CheckoutSummary confirmAction={submit} />
      {#if browser}
        <SuperDebug data={$formData} />
      {/if}
    </div>
  </div>
</div>
