<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardHeader, CardTitle, CardContent } from "$lib/components/ui/card";
  import CheckoutSummary from "$lib/components/CheckoutSummary/CheckoutSummary.svelte";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
</script>

<div class="container mx-auto p-4">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
    <!-- Left Column: Login Form -->
    <div>
      <Card>
        <CardHeader>
          <CardTitle class="text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="POST" class="space-y-4">
            <!-- Email Field -->
            <div>
              <Label for="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <!-- Password Field -->
            <div>
              <Label for="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <Button type="submit" class="w-full">Sign In</Button>
          </form>
        </CardContent>
      </Card>
    </div>

    <!-- Right Column: Replaced summary with CheckoutSummary component -->
    <div>
      <CheckoutSummary />
    </div>
  </div>
</div>
