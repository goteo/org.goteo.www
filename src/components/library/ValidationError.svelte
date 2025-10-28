<!--
    ValidationError Component

    Displays form validation error messages following the design system.

    Features:
    - Consistent error styling across all forms
    - ARIA role="alert" for accessibility
    - Design system compliant colors and spacing

    Design System:
    - Color: text-tertiary (consistent with other error states)
    - Size: text-sm
    - Spacing: mt-1

    Usage:
    ```svelte
    <ValidationError message="Este campo es requerido" />
    ```
-->
<script lang="ts">
    interface ValidationErrorProps {
        message: string;
    }

    let { message }: ValidationErrorProps = $props();
</script>

{#if message}
    <p class="text-tertiary mt-1 text-sm" role="alert">
        {message}
    </p>
{/if}
