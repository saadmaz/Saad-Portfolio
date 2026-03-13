import sgMail from '@sendgrid/mail';

const sendgridApiKey = process.env.SENDGRID_API_KEY;

if (sendgridApiKey && sendgridApiKey.startsWith('SG.')) {
  sgMail.setApiKey(sendgridApiKey);
} else if (sendgridApiKey) {
  console.warn('⚠️  SendGrid API key does not start with "SG.". Email functionality disabled.');
} else {
  console.warn('⚠️  SendGrid API key not set. Email functionality disabled.');
}

interface ContactEmailData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export const sendContactEmail = async (data: ContactEmailData) => {
  if (!sendgridApiKey || !sendgridApiKey.startsWith('SG.')) {
    console.warn('⚠️  Email not sent: SendGrid not configured');
    return;
  }

  const { name, email, subject, message } = data;

  const msg = {
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL!,
    subject: `Portfolio Contact: ${subject || 'New Message'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Submission</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
          <p><strong>Message:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007acc;">
            ${message.replace(/\n/g, '<br>')}
          </div>
        </div>
        <p style="color: #666; font-size: 12px;">
          This message was sent from your portfolio contact form.
        </p>
      </div>
    `,
  };

  await sgMail.send(msg);
};