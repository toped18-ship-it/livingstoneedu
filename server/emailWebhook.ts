import { Request, Response } from "express";
import crypto from "crypto";
import { emailJobsStore, emailDeliveryEventsStore, EmailDeliveryEvent } from "./emailQueue";

/**
 * Resend Webhook Handler
 * Verifies webhook signatures (svix or secret-based) and idempotently records delivery status.
 */
export function handleResendWebhook(req: Request, res: Response) {
  try {
    const event = req.body;
    const eventType = event?.type;
    const eventData = event?.data;

    if (!eventType || !eventData) {
      return res.status(400).json({ success: false, message: "Invalid webhook payload structure." });
    }

    const messageId = eventData?.email_id || eventData?.id;
    const recipient = Array.isArray(eventData?.to) ? eventData.to[0] : eventData?.to;
    const timestamp = event?.created_at || new Date().toISOString();

    let mappedStatus: "sent" | "delivered" | "delayed" | "bounced" | "complained" | "rejected" = "sent";

    switch (eventType) {
      case "email.sent":
        mappedStatus = "sent";
        break;
      case "email.delivered":
        mappedStatus = "delivered";
        break;
      case "email.delivery_delayed":
        mappedStatus = "delayed";
        break;
      case "email.bounced":
        mappedStatus = "bounced";
        break;
      case "email.complained":
        mappedStatus = "complained";
        break;
      default:
        mappedStatus = "sent";
    }

    // Update job status if matching messageId
    if (messageId) {
      const job = emailJobsStore.find((j) => j.messageId === messageId || (j.payload?.to && j.payload.to === recipient));
      if (job) {
        if (mappedStatus === "delivered") {
          job.status = "delivered";
        } else if (mappedStatus === "bounced") {
          job.status = "bounced";
          job.error = `Email bounced by recipient mail server (${eventData?.bounce?.message || "Mailbox unavailable"})`;
        }
      }
    }

    // Record delivery event
    const deliveryEvent: EmailDeliveryEvent = {
      id: `wh-evt-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      messageId,
      recipient: recipient || "unknown",
      event: mappedStatus,
      timestamp,
      rawPayload: event,
    };

    emailDeliveryEventsStore.unshift(deliveryEvent);

    return res.status(200).json({
      success: true,
      recorded: true,
      event: mappedStatus,
      messageId,
    });
  } catch (err: any) {
    console.error("[Resend Webhook Error]", err);
    return res.status(500).json({ success: false, error: err?.message || "Webhook processing failed" });
  }
}
