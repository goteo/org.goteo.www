<script lang="ts">
    import type { ApiGatewaysNameGetResponse } from "../../openapi/client/index";

    export let paymentGateways: ApiGatewaysNameGetResponse[] = [];

    let selectedPaymentMethod = ""; // 👈 variable normal
</script>

<section>
    <h1>Indícanos tus datos de pago</h1>
    <p>Ahora necesitamos que nos digas cómo quieres pagar.</p>
    <p>Selecciona método de pago:</p>

    <div>
        {#each paymentGateways as gateway}
            <label>
                <input
                    type="radio"
                    name="paymentMethod"
                    value={gateway.name}
                    bind:group={selectedPaymentMethod}
                />
                <span
                    >{(gateway.name ?? "").charAt(0).toUpperCase() +
                        (gateway.name ?? "").slice(1)}</span
                >
            </label>
        {/each}
    </div>
</section>
