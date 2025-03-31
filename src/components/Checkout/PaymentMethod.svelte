<script>
    import { writable } from "svelte/store";

    // Declare selectedPaymentMethod as a writable store
    export let selectedPaymentMethod = writable("");
</script>

<section>
    <h1>Indícanos tus datos de pago</h1>
    <p>Ahora necesitamos que nos digas cómo quieres pagar.</p>
    <p>Selecciona método de pago:</p>
    <div>
        <label>
            <input
                type="radio"
                name="paymentMethod"
                value="creditCard"
                bind:group={selectedPaymentMethod}
            />
            Monedero Goteo
        </label>
        <label>
            <input
                type="radio"
                name="paymentMethod"
                value="creditCard"
                bind:group={selectedPaymentMethod}
            />
            Tarjeta
        </label>
        <label>
            <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                bind:group={selectedPaymentMethod}
            />
            PayPal
        </label>
        <label>
            <input
                type="radio"
                name="paymentMethod"
                value="bankTransfer"
                bind:group={selectedPaymentMethod}
            />
            Stripe
        </label>
    </div>
</section>
