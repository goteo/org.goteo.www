<script lang="ts">
  import { enhance } from "$app/forms";
  import type { ActionData } from "./$types";
  import { page } from "$app/stores";

  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";
  import CheckoutSummary from "$lib/components/CheckoutSummary/CheckoutSummary.svelte";

  let { form }: { form: ActionData } = $props();

  // Get returnUrl from query parameters using derived rune
  const returnUrl = $derived($page.url.searchParams.get("returnUrl") || "/");
</script>

<div class="container mx-auto p-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl font-bold">Register</CardTitle>
          <div class="flex justify-end">
            <Button variant="outline" href={`/login?returnUrl=${encodeURIComponent(returnUrl)}`}>Already have an account? Log in</Button>
          </div>
        </CardHeader>
        <CardContent>
          <p style="color: red">{form?.message ?? ""}</p>

          <form method="POST" class="space-y-4" action="?/login" use:enhance>
            <!-- Pass the returnUrl as a hidden field -->
            <input type="hidden" name="returnUrl" value={returnUrl} />

            <div>
              <Label for="email">Email</Label>
              <Input id="username" name="username" type="text" required />
            </div>
            <div>
              <Label for="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" class="w-full">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </div>

    <div>
      <CheckoutSummary />
    </div>
  </div>
</div>
