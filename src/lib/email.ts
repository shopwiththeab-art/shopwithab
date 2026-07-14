import nodemailer from 'nodemailer';
import path from 'path';

// Lazy-init SMTP transport — only created when first email is sent
let _transporter: nodemailer.Transporter | null = null;

const getLogoAttachment = () => {
  try {
    return [{
      filename: 'logo.jpg',
      path: path.join(process.cwd(), 'public/logo.jpg'),
      cid: 'shopwithab-logo@cid',
    }];
  } catch {
    return [];
  }
};

function getTransporter() {
  if (!_transporter && process.env.SMTP_SERVER) {
    const portNum = Number(process.env.SMTP_PORT) || 465;
    const isSecure = portNum === 465 || (process.env.SMTP_SECURE === 'true' && portNum !== 587);

    _transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: portNum,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return _transporter;
}

const fromAddress = () => process.env.FROM_EMAIL || process.env.SMTP_USERNAME || 'support@winningedgeinvestment.com';
const fromName = () => process.env.SMTP_FROM_NAME || 'SHOPWITH.AB';
const senderHeader = () => `"${fromName()}" <${fromAddress()}>`;

type OrderItem = { name: string; qty: number; size: string; price?: number; image?: string };

type OrderEmailData = {
  to: string;
  orderNum: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  currency: string;
  address: string;
};

export async function sendOrderConfirmation(data: OrderEmailData) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[Email] SMTP not configured — skipping email');
    return;
  }

  const itemsHtml = data.items
    .map(i => `<tr>
      ${i.image ? `<td width="56" style="padding:10px 12px 10px 0;border-bottom:1px solid #f0f0f0"><img src="${i.image}" width="48" height="48" alt="${i.name}" style="border-radius:3px;object-fit:cover;border:1px solid #e5e5e5;display:block;background:#f9f9f9" /></td>` : ''}
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#050505;font-weight:800">${i.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:12px;color:#666666;text-align:right;font-weight:600">${i.size} × ${i.qty}</td>
    </tr>`)
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e2e2;border-top:4px solid #ff2a85;box-shadow:0 10px 30px rgba(0,0,0,0.04)">
          <!-- Header -->
          <tr><td style="padding:36px 40px 24px;border-bottom:1px solid #f0f0f0;background:#ffffff;text-align:center">
            <img src="cid:shopwithab-logo@cid" alt="SHOPWITH.AB Logo" width="56" height="56" style="border-radius:50%;border:2px solid #ff2a85;margin-bottom:12px;display:inline-block;object-fit:cover" />
            <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#050505">SHOPWITH<span style="color:#ff2a85">.AB</span></p>
            <p style="margin:6px 0 0;font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:#777777 font-weight:700">ENGINEERED WEAR IDENTITY</p>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:36px 40px">
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff2a85;font-weight:800">Hi ${data.customerName},</p>
            <h1 style="margin:0 0 24px;font-size:22px;font-weight:900;color:#050505;text-transform:uppercase;letter-spacing:0.02em">Order Confirmed</h1>

            <!-- Order Number -->
            <div style="background:#fff5f7;border:1px solid #ffd1e4;border-left:4px solid #ff2a85;padding:16px 20px;margin-bottom:28px">
              <p style="margin:0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#ff2a85;font-weight:800">Order Number</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:900;font-family:monospace;color:#050505;letter-spacing:0.05em">${data.orderNum}</p>
            </div>

            <!-- Items -->
            <p style="margin:0 0 12px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#050505;font-weight:800">Items Ordered</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
              ${itemsHtml}
            </table>

            <!-- Total -->
            <div style="border-top:2px solid #050505;padding-top:16px;display:flex;justify-content:space-between">
              <p style="margin:0;font-size:13px;color:#555555;font-weight:700 uppercase tracking-wider">Total Paid (excl. shipping)</p>
              <p style="margin:0;font-size:18px;font-weight:900;color:#ff2a85">${data.currency} ${data.total.toFixed(2)}</p>
            </div>

            <!-- Shipping pending notice -->
            <div style="margin-top:24px;padding:18px 20px;background:#fff5f7;border:1px solid #ffd1e4;border-left:3px solid #ff2a85">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#ff2a85;font-weight:800">📦 Delivery Fee — To Be Confirmed</p>
              <p style="margin:0;font-size:12px;color:#444444;line-height:1.7">
                Your payment has been received. We will send you a separate email confirming your delivery / shipping fee once your order is packaged and a courier is arranged. 
                If you have any questions about delivery, please contact us at <a href="mailto:${fromAddress()}" style="color:#ff2a85;font-weight:700">${fromAddress()}</a>.
              </p>
            </div>

            <!-- Address -->
            ${data.address.trim() ? `
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f0f0f0">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#777777;font-weight:700">Shipping To</p>
              <p style="margin:0;font-size:13px;color:#050505;font-weight:600;line-height:1.6">${data.address}</p>
            </div>` : ''}
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding:24px 40px;border-top:1px solid #f0f0f0;background:#fafafa;text-align:center">
            <p style="margin:0;font-size:11px;color:#666666">
              Questions? Reply to this email or contact us at <a href="mailto:${fromAddress()}" style="color:#ff2a85;text-decoration:none;font-weight:700">${fromAddress()}</a>
            </p>
            <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#050505;font-weight:900">SHOPWITH.AB © 2026</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await transport.sendMail({
      from: senderHeader(),
      to: data.to,
      subject: `Order Confirmed — ${data.orderNum}`,
      html,
      attachments: getLogoAttachment(),
    });
  } catch (err) {
    console.error('[Email] Failed to send:', err);
  }
}

type StatusEmailData = {
  to: string;
  orderNum: string;
  customerName: string;
  status: string;
  trackingNumber?: string;
  shippingFee?: number;
};

export async function sendStatusUpdate(data: StatusEmailData) {
  const transport = getTransporter();
  if (!transport) return;

  const statusMessages: Record<string, string> = {
    Processing: 'Your order is being prepared by our technical engineering team.',
    Shipped:    'Great news! Your order has left the warehouse and is on its way.',
    'In Transit': 'Your package is in transit and will arrive soon.',
    Delivered:  'Your order has been delivered. Enjoy your new wear identity!',
    Cancelled:  'Your order has been cancelled. Contact support if this was an error.',
  };

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e2e2;border-top:4px solid #ff2a85;box-shadow:0 10px 30px rgba(0,0,0,0.04)">
          <!-- Header -->
          <tr><td style="padding:36px 40px 24px;border-bottom:1px solid #f0f0f0;background:#ffffff;text-align:center">
            <img src="cid:shopwithab-logo@cid" alt="SHOPWITH.AB Logo" width="56" height="56" style="border-radius:50%;border:2px solid #ff2a85;margin-bottom:12px;display:inline-block;object-fit:cover" />
            <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#050505">SHOPWITH<span style="color:#ff2a85">.AB</span></p>
            <p style="margin:6px 0 0;font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:#777777;font-weight:700">ENGINEERED WEAR IDENTITY</p>
          </td></tr>

          <tr><td style="padding:36px 40px">
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff2a85;font-weight:800">Hi ${data.customerName},</p>
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:900;color:#050505;text-transform:uppercase;letter-spacing:0.02em">Order Update — <span style="color:#ff2a85">${data.status}</span></h1>
            <p style="margin:0 0 24px;font-size:13px;color:#444444;line-height:1.6;font-weight:500">${statusMessages[data.status] || 'Your order status has been updated.'}</p>
            <div style="background:#fff5f7;border:1px solid #ffd1e4;border-left:4px solid #ff2a85;padding:16px 20px">
              <p style="margin:0;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#ff2a85;font-weight:800">Order Number</p>
              <p style="margin:6px 0 0;font-size:20px;font-weight:900;font-family:monospace;color:#050505">${data.orderNum}</p>
            </div>
            ${data.trackingNumber ? `
            <div style="margin-top:16px;padding:18px 20px;background:#f8faff;border:1px solid #d8e5ff;border-left:4px solid #0055ff">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#0055ff;font-weight:800">📦 Tracking Number</p>
              <p style="margin:0;font-size:18px;font-weight:900;font-family:monospace;color:#050505">${data.trackingNumber}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#555555">Use this number on your courier's website to track your shipment.</p>
            </div>` : ''}
            ${data.shippingFee !== undefined && data.shippingFee !== null ? `
            <div style="margin-top:16px;padding:18px 20px;background:#fff5f7;border:1px solid #ffd1e4;border-left:4px solid #ff2a85">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#ff2a85;font-weight:800">🚚 Shipping Fee Confirmed</p>
              <p style="margin:0;font-size:18px;font-weight:900;color:#050505">GHS ${data.shippingFee.toFixed(2)}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#444444;line-height:1.7">Please ensure you have this amount ready to pay the courier upon delivery.</p>
            </div>` : ''}
            <p style="margin:28px 0 0;font-size:12px;color:#444444;font-weight:600">Track your order live at <a href="https://shopwith.ab/track-order" style="color:#ff2a85;font-weight:800 text-decoration:none">shopwith.ab/track-order</a></p>
          </td></tr>

          <tr><td style="padding:24px 40px;border-top:1px solid #f0f0f0;background:#fafafa;text-align:center">
            <p style="margin:0;font-size:11px;color:#666666">Need assistance? Contact <a href="mailto:${fromAddress()}" style="color:#ff2a85;text-decoration:none;font-weight:700">${fromAddress()}</a></p>
            <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#050505;font-weight:900">SHOPWITH.AB © 2026</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    await transport.sendMail({
      from: senderHeader(),
      to: data.to,
      subject: `Order ${data.orderNum} Status: ${data.status} — SHOPWITH.AB`,
      html,
      attachments: getLogoAttachment(),
    });
  } catch (err) {
    console.error('[Email] Status update failed:', err);
  }
}

type PasswordResetEmailData = {
  to: string;
  resetUrl: string;
};

export async function sendPasswordReset(data: PasswordResetEmailData) {
  const transport = getTransporter();
  if (!transport) {
    console.warn('[Email] SMTP not configured — skipping password reset email');
    return false;
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px">
      <tr><td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e2e2e2;border-top:4px solid #ff2a85;box-shadow:0 10px 30px rgba(0,0,0,0.04)">
          <!-- Header -->
          <tr><td style="padding:36px 40px 24px;border-bottom:1px solid #f0f0f0;background:#ffffff;text-align:center">
            <img src="cid:shopwithab-logo@cid" alt="SHOPWITH.AB Logo" width="56" height="56" style="border-radius:50%;border:2px solid #ff2a85;margin-bottom:12px;display:inline-block;object-fit:cover" />
            <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:#050505">SHOPWITH<span style="color:#ff2a85">.AB</span></p>
            <p style="margin:6px 0 0;font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:#777777;font-weight:700">ENGINEERED WEAR IDENTITY</p>
          </td></tr>

          <!-- Body -->
          <tr><td style="padding:36px 40px">
            <div style="width:36px;height:4px;background:#ff2a85;margin-bottom:20px"></div>
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:#ff2a85;font-weight:800">Account Security</p>
            <h1 style="margin:0 0 20px;font-size:22px;font-weight:900;color:#050505;text-transform:uppercase;letter-spacing:0.02em">Password Recovery</h1>
            <p style="margin:0 0 24px;font-size:13px;color:#444444;line-height:1.7;font-weight:500">
              We received a request to reset the password for your <strong style="color:#050505">SHOPWITH.AB</strong> account (<span style="color:#ff2a85;font-weight:700">${data.to}</span>).
            </p>
            <p style="margin:0 0 32px;font-size:13px;color:#444444;line-height:1.7;font-weight:500">
              Click the button below to securely set a new password and restore access to your engineered daily rotation:
            </p>

            <!-- CTA Button -->
            <div style="text-align:center;margin-bottom:36px">
              <a href="${data.resetUrl}" style="display:inline-block;background:#ff2a85;color:#ffffff;font-size:12px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;padding:18px 36px;text-decoration:none;border-radius:2px;box-shadow:0 8px 20px rgba(255,42,133,0.25)">
                Reset Your Password →
              </a>
            </div>

            <div style="background:#fff5f7;border:1px solid #ffd1e4;border-left:4px solid #ff2a85;padding:18px 22px;margin-bottom:24px">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;color:#ff2a85;font-weight:800">🔒 Security Notice</p>
              <p style="margin:0;font-size:12px;color:#444444;line-height:1.6">
                If you did not initiate this password reset, no action is required. Your password will remain unchanged and your account is protected. This link expires in 24 hours.
              </p>
            </div>

            <!-- Fallback URL -->
            <p style="margin:0;font-size:11px;color:#666666;line-height:1.5;word-break:break-all">
              If the button above does not open, copy and paste this link directly into your browser:<br/>
              <a href="${data.resetUrl}" style="color:#ff2a85;font-weight:600">${data.resetUrl}</a>
            </p>
          </td></tr>

          <!-- Footer -->
          <tr><td style="padding:28px 40px;border-top:1px solid #f0f0f0;background:#fafafa;text-align:center">
            <p style="margin:0;font-size:11px;color:#666666;font-weight:600">
              SHOPWITH.AB — SIMPLE. BOLD. YOURS.
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:#666666">
              Need assistance? Contact our support team at <a href="mailto:${fromAddress()}" style="color:#ff2a85;text-decoration:none;font-weight:700">${fromAddress()}</a>
            </p>
            <p style="margin:12px 0 0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#050505;font-weight:900">SHOPWITH.AB © 2026</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;

  try {
    const info = await transport.sendMail({
      from: senderHeader(),
      to: data.to,
      subject: `Reset Your Password — SHOPWITH.AB`,
      html,
      attachments: getLogoAttachment(),
    });
    console.log('[Email] Password reset sent successfully:', info.messageId);
    return true;
  } catch (err) {
    console.error('[Email] Password reset sending failed:', err);
    return false;
  }
}
