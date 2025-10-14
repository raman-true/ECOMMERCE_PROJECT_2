import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRecord {
  id: string;
  supplier_id: string;
  order_id: string;
  notification_type: string;
  notification_method: string;
  recipient_email: string | null;
  recipient_phone: string | null;
  subject: string | null;
  message: string;
  status: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: pendingNotifications, error: fetchError } = await supabase
      .from("supplier_notifications")
      .select("*")
      .eq("status", "pending")
      .limit(50);

    if (fetchError) {
      throw fetchError;
    }

    const results = {
      processed: 0,
      successful: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const notification of pendingNotifications as NotificationRecord[]) {
      results.processed++;

      try {
        if (notification.notification_method === "email" && notification.recipient_email) {
          await sendEmailNotification(notification);

          await supabase
            .from("supplier_notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", notification.id);

          results.successful++;
        } else if (notification.notification_method === "sms" && notification.recipient_phone) {
          await sendSMSNotification(notification);

          await supabase
            .from("supplier_notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", notification.id);

          results.successful++;
        } else {
          await supabase
            .from("supplier_notifications")
            .update({
              status: "failed",
              error_message: "Missing recipient contact information",
            })
            .eq("id", notification.id);

          results.failed++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        await supabase
          .from("supplier_notifications")
          .update({
            status: "failed",
            error_message: errorMessage,
          })
          .eq("id", notification.id);

        results.failed++;
        results.errors.push(`Notification ${notification.id}: ${errorMessage}`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing notifications:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function sendEmailNotification(notification: NotificationRecord): Promise<void> {
  console.log(`Sending email to: ${notification.recipient_email}`);
  console.log(`Subject: ${notification.subject}`);
  console.log(`Message: ${notification.message}`);

  console.log("Note: Email sending requires integration with an email service provider.");
  console.log("To enable actual email sending, integrate with services like:");
  console.log("- Resend (https://resend.com)");
  console.log("- SendGrid (https://sendgrid.com)");
  console.log("- Amazon SES");
  console.log("- Mailgun");
}

async function sendSMSNotification(notification: NotificationRecord): Promise<void> {
  console.log(`Sending SMS to: ${notification.recipient_phone}`);
  console.log(`Message: ${notification.message}`);

  console.log("Note: SMS sending requires integration with an SMS service provider.");
  console.log("To enable actual SMS sending, integrate with services like:");
  console.log("- Twilio (https://www.twilio.com)");
  console.log("- AWS SNS");
  console.log("- MessageBird");
}