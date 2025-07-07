// Supabase Edge Function for handling Xendit payment webhooks

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Callback-Token",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the request body
    const body = await req.json();
    console.log("Received webhook:", body);

    // Verify the webhook signature
    // In a production environment, you should verify the X-Callback-Token header
    // const callbackToken = req.headers.get("X-Callback-Token");
    // if (!callbackToken || callbackToken !== Deno.env.get("XENDIT_CALLBACK_TOKEN")) {
    //   return new Response(JSON.stringify({ error: "Invalid callback token" }), {
    //     status: 401,
    //     headers: { ...corsHeaders, "Content-Type": "application/json" },
    //   });
    // }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Process the webhook based on the event type
    if (body.status === "PAID" || body.status === "SETTLED") {
      // Extract the external ID (order ID) from the webhook
      const externalId = body.external_id;
      if (!externalId) {
        throw new Error("Missing external_id in webhook payload");
      }

      // Find the payment record in the database
      const { data: payment, error: paymentError } = await supabase
        .from("ad_payments")
        .select("*")
        .eq("transaction_id", body.id)
        .maybeSingle();

      if (paymentError) {
        throw paymentError;
      }

      if (!payment) {
        // Try to find by order ID (external_id)
        const { data: paymentByOrderId, error: orderIdError } = await supabase
          .from("ad_payments")
          .select("*")
          .ilike("transaction_id", `%${externalId}%`)
          .maybeSingle();

        if (orderIdError) {
          throw orderIdError;
        }

        if (!paymentByOrderId) {
          throw new Error(`Payment record not found for external_id: ${externalId}`);
        }

        // Update the payment record
        const { error: updateError } = await supabase
          .from("ad_payments")
          .update({
            status: "paid",
            payment_date: new Date().toISOString(),
            transaction_id: body.id,
            payment_method: body.payment_method || body.payment_channel || "xendit",
            updated_at: new Date().toISOString(),
          })
          .eq("id", paymentByOrderId.id);

        if (updateError) {
          throw updateError;
        }

        // Check if this is a premium listing payment
        if (externalId.startsWith("premium-")) {
          // Extract the property ID from the external ID
          const propertyId = externalId.split("-")[1];
          
          // Find the premium listing
          const { data: premiumListing, error: premiumError } = await supabase
            .from("premium_listings")
            .select("*")
            .eq("property_id", propertyId)
            .eq("payment_id", paymentByOrderId.id)
            .maybeSingle();

          if (premiumError) {
            throw premiumError;
          }

          if (premiumListing) {
            // Update the premium listing status
            const { error: updatePremiumError } = await supabase
              .from("premium_listings")
              .update({
                status: "active",
                updated_at: new Date().toISOString(),
              })
              .eq("id", premiumListing.id);

            if (updatePremiumError) {
              throw updatePremiumError;
            }

            // Update the property to mark it as promoted
            const { error: updatePropertyError } = await supabase
              .from("listings")
              .update({ is_promoted: true })
              .eq("id", propertyId);

            if (updatePropertyError) {
              throw updatePropertyError;
            }
          }
        }
      } else {
        // Update the existing payment record
        const { error: updateError } = await supabase
          .from("ad_payments")
          .update({
            status: "paid",
            payment_date: new Date().toISOString(),
            payment_method: body.payment_method || body.payment_channel || payment.payment_method,
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Log the webhook event
      await supabase.from("activity_logs").insert({
        action: "PAYMENT_RECEIVED",
        resource: "ad_payments",
        resource_id: body.id,
        details: `Payment received for order ${externalId}`,
        created_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (body.status === "EXPIRED" || body.status === "FAILED") {
      // Handle expired or failed payments
      const externalId = body.external_id;
      
      // Find the payment record
      const { data: payment, error: paymentError } = await supabase
        .from("ad_payments")
        .select("*")
        .eq("transaction_id", body.id)
        .maybeSingle();

      if (paymentError) {
        throw paymentError;
      }

      if (!payment) {
        // Try to find by order ID
        const { data: paymentByOrderId, error: orderIdError } = await supabase
          .from("ad_payments")
          .select("*")
          .ilike("transaction_id", `%${externalId}%`)
          .maybeSingle();

        if (orderIdError) {
          throw orderIdError;
        }

        if (paymentByOrderId) {
          // Update the payment status
          const { error: updateError } = await supabase
            .from("ad_payments")
            .update({
              status: body.status === "EXPIRED" ? "failed" : "failed",
              updated_at: new Date().toISOString(),
            })
            .eq("id", paymentByOrderId.id);

          if (updateError) {
            throw updateError;
          }
        }
      } else {
        // Update the payment status
        const { error: updateError } = await supabase
          .from("ad_payments")
          .update({
            status: body.status === "EXPIRED" ? "failed" : "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Log the webhook event
      await supabase.from("activity_logs").insert({
        action: body.status === "EXPIRED" ? "PAYMENT_EXPIRED" : "PAYMENT_FAILED",
        resource: "ad_payments",
        resource_id: body.id,
        details: `Payment ${body.status.toLowerCase()} for order ${externalId}`,
        created_at: new Date().toISOString(),
      });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For other event types, just acknowledge receipt
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});