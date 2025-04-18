import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json();

    console.log("Webhook recibido de PayPal:", body);

    if (body.event_type === "PAYMENT.CAPTURE.DENIED") {
        console.error("❌ Pago denegado:", body);
    }

    if (body.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        console.log("✅ Pago exitoso:", body);
    }

    return new Response(null, { status: 200 });
};
