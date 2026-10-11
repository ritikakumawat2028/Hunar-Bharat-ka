const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Official WhatsApp Business Platform Service
 *
 * Behavior:
 * 1. Sends job alert to ALL registered workers (verified or not) who have a phone number.
 * 2. Skips duplicate notifications (same job + same worker already notified).
 * 3. Uses Meta Cloud API (Graph API v19.0) when credentials are configured.
 * 4. Falls back to SANDBOX_MOCK mode (console log) when credentials are missing.
 * 5. Message is bilingual: Hindi + English.
 */

function getWhatsAppConfig() {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  const isConfigured = Boolean(token && phoneNumberId);

  return {
    isConfigured,
    phoneNumberId,
    wabaId,
    hasToken: Boolean(token),
    status: isConfigured ? 'LIVE_CONFIGURED' : 'SANDBOX_MODE'
  };
}

/**
 * Build the bilingual (Hindi + English) job alert message.
 */
function buildJobMessage({ workerName, jobTitleHi, jobTitleEn, location, skills, payment, jobUrl }) {
  const name = workerName || 'साथी / Friend';
  const skillsText = skills ? `${skills}` : 'सामान्य / General';
  const payText = payment ? `\n💰 वेतन / Pay: ${payment}` : '';

  return (
    `🔔 *नई नौकरी उपलब्ध! / New Job Available!*\n\n` +
    `नमस्ते ${name},\n` +
    `Hello ${name},\n\n` +
    `📌 *${jobTitleHi}*\n` +
    `📌 *${jobTitleEn}*\n\n` +
    `📍 स्थान / Location: ${location}\n` +
    `🔧 कौशल / Skills: ${skillsText}${payText}\n\n` +
    `👉 विवरण देखें / View Details:\n${jobUrl}\n\n` +
    `— *HUNAR BHARAT KA (हुनर भारत का)*`
  );
}

/**
 * Send WhatsApp job alert to ALL registered workers who have a phone number.
 * Queued asynchronously so job creation is never blocked.
 *
 * @param {object} params
 * @param {string} params.jobId
 * @param {string} params.jobTitleHi
 * @param {string} params.jobTitleEn
 * @param {string} params.location
 * @param {string} [params.skills]
 * @param {string} [params.payment]
 * @param {string} params.jobUrl
 */
async function sendWhatsAppJobAlert({ jobId, jobTitleHi, jobTitleEn, location, skills, payment, jobUrl }) {
  const config = getWhatsAppConfig();
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Fetch ALL workers who have a phone number (verified or not, opt-in or not)
  const allWorkers = await prisma.user.findMany({
    where: {
      role: 'WORKER',
      OR: [
        { whatsappNumber: { not: null } },
        { phone: { not: null } }
      ]
    },
    select: {
      id: true,
      name: true,
      phone: true,
      whatsappNumber: true
    }
  });

  const results = [];

  for (const worker of allWorkers) {
    // Skip if notification for this job + worker already sent (deduplication)
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: worker.id,
        jobId: jobId,
        status: { in: ['SENT', 'SANDBOX_MOCK'] }
      }
    });

    if (existingNotification) {
      continue;
    }

    // Prefer whatsappNumber, fallback to phone
    const rawNumber = (worker.whatsappNumber || worker.phone || '').trim().replace(/\D/g, '');
    if (!rawNumber || rawNumber.length < 7) {
      continue; // No valid number at all — skip
    }

    const cleanRecipientPhone = rawNumber.slice(-10);
    const formattedPhone = `91${cleanRecipientPhone}`;

    const message = buildJobMessage({
      workerName: worker.name,
      jobTitleHi,
      jobTitleEn,
      location,
      skills,
      payment,
      jobUrl
    });

    let status = 'SANDBOX_MOCK';
    let providerMessageId = `sandbox_wa_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    let failureReason = null;

    if (config.isConfigured) {
      try {
        const metaApiUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;

        const response = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: formattedPhone,
            type: 'text',
            text: {
              preview_url: true,
              body: message
            }
          })
        });

        const data = await response.json();

        if (response.ok && data.messages && data.messages[0]) {
          status = 'SENT';
          providerMessageId = data.messages[0].id;
        } else {
          status = 'FAILED';
          failureReason = data.error?.message || 'Meta Cloud API error';
          console.error(`[WhatsApp FAILED for +${formattedPhone}]:`, failureReason);
        }
      } catch (err) {
        status = 'FAILED';
        failureReason = err.message;
        console.error(`[WhatsApp API Error for +${formattedPhone}]:`, failureReason);
      }
    } else {
      // Sandbox / dev mode — log clearly, never pretend it was sent
      status = 'SANDBOX_MOCK';
      failureReason =
        'Sandbox Mode: Live Meta WhatsApp API credentials not configured in .env. Message recorded for testing.';
      console.log(`\n--- [WHATSAPP SANDBOX DISPATCH] ---`);
      console.log(`To: +${formattedPhone} (${worker.name || 'Unknown'})`);
      console.log(`Message:\n${message}`);
      console.log(`------------------------------------\n`);
    }

    const log = await prisma.notification.create({
      data: {
        userId: worker.id,
        jobId: jobId,
        type: 'WHATSAPP',
        recipientPhone: cleanRecipientPhone,
        templateName: 'job_alert_bilingual_v2',
        message: message,
        status: status,
        providerMessageId: providerMessageId,
        failureReason: failureReason,
        retryCount: 0,
        sentAt: new Date()
      }
    });

    results.push(log);
  }

  console.log(
    `[WhatsApp Job Alert] Job: "${jobTitleHi}" | Total Workers: ${allWorkers.length} | Dispatched: ${results.length} | Mode: ${config.status}`
  );

  return {
    totalWorkers: allWorkers.length,
    dispatchedCount: results.length,
    configStatus: config.status,
    logs: results
  };
}

/**
 * Retry a failed or sandbox notification safely.
 */
async function retryWhatsAppNotification(notificationId) {
  const notif = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: { job: true, user: true }
  });

  if (!notif) throw new Error('Notification record not found');
  if (notif.status === 'SENT') throw new Error('Notification was already successfully delivered');

  const config = getWhatsAppConfig();
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const rawNumber = (notif.recipientPhone || '').trim().replace(/\D/g, '');
  const cleanRecipientPhone = rawNumber.slice(-10);
  const formattedPhone = `91${cleanRecipientPhone}`;

  let status = notif.status;
  let providerMessageId = notif.providerMessageId;
  let failureReason = null;

  if (config.isConfigured) {
    try {
      const metaApiUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
      const response = await fetch(metaApiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: {
            preview_url: true,
            body: notif.message
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.messages && data.messages[0]) {
        status = 'SENT';
        providerMessageId = data.messages[0].id;
        failureReason = null;
      } else {
        status = 'FAILED';
        failureReason = data.error?.message || 'Meta Cloud API error on retry';
      }
    } catch (err) {
      status = 'FAILED';
      failureReason = err.message;
    }
  } else {
    status = 'SANDBOX_MOCK';
    failureReason = 'Sandbox Mode: Credentials missing. Retried in test mode.';
    console.log(`[WHATSAPP RETRY SANDBOX] To: +${formattedPhone}`);
    console.log(`Message:\n${notif.message}\n`);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status,
      providerMessageId,
      failureReason,
      retryCount: { increment: 1 },
      sentAt: new Date()
    }
  });

  return updated;
}

module.exports = {
  sendWhatsAppJobAlert,
  retryWhatsAppNotification,
  getWhatsAppConfig
};
