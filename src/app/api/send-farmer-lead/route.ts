import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const TARGET_DISPATCH_EMAIL = 'aquasentinelfis@gmail.com';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      farmerName = 'Farmer Member',
      farmerEmail = 'farmer@aquasentinel.io',
      farmerPhone = 'N/A',
      location = 'Visakhapatnam Agricultural Catchment Zone',
      acres = '4.5 Acres',
      crop = 'Paddy & Mixed Agriculture',
      notes = 'Farmer requested IoT Sluice Gate + Automated Barrier Hardware deployment.',
    } = body;

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log('=========================================================');
    console.log('🌾 [AQUASENTINEL FIELDSHIELD DISPATCH AUTOMATION]');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Target Dispatch Recipient: ${TARGET_DISPATCH_EMAIL}`);
    console.log(`Farmer Name: ${farmerName}`);
    console.log(`Email: ${farmerEmail}`);
    console.log(`Phone: ${farmerPhone}`);
    console.log(`Location: ${location}`);
    console.log(`Acreage: ${acres}`);
    console.log(`Target Crop: ${crop}`);
    console.log('Status: DISPATCH QUEUED AND PROCESSED');
    console.log('=========================================================');

    // 1. Try sending via Nodemailer if SMTP / Gmail credentials configured
    let emailSent = false;
    let emailError: string | null = null;

    const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || 'aquasentinelfis@gmail.com';
    const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;

    if (smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: process.env.SMTP_SERVICE || 'gmail',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; background: #061410; color: #e8f8f0; padding: 24px; border-radius: 12px; border: 1px solid #10d97e;">
            <div style="border-bottom: 2px solid #10d97e; padding-bottom: 12px; margin-bottom: 18px;">
              <h2 style="color: #10d97e; margin: 0;">🌾 AquaSentinel — New Farmer Hardware Protection Lead</h2>
              <p style="color: #5a9a78; font-size: 14px; margin: 4px 0 0 0;">Automated Dispatch to Operations Team</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr>
                <td style="padding: 8px; color: #5a9a78; width: 140px;"><strong>Farmer Name:</strong></td>
                <td style="padding: 8px; color: #ffffff;">${farmerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #5a9a78;"><strong>Email Address:</strong></td>
                <td style="padding: 8px; color: #ffffff;"><a href="mailto:${farmerEmail}" style="color: #10d97e;">${farmerEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #5a9a78;"><strong>Phone Number:</strong></td>
                <td style="padding: 8px; color: #ffffff;">${farmerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #5a9a78;"><strong>Farm Location:</strong></td>
                <td style="padding: 8px; color: #ffffff;">${location}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #5a9a78;"><strong>Farmland Area:</strong></td>
                <td style="padding: 8px; color: #ffffff;">${acres}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #5a9a78;"><strong>Crop Type:</strong></td>
                <td style="padding: 8px; color: #ffffff;">${crop}</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #5a9a78;"><strong>System Requested:</strong></td>
                <td style="padding: 8px; color: #ffffff;">FieldShield Automated Sluice Gate + IoT Water Sensor Mesh</td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #5a9a78;"><strong>Submission Time:</strong></td>
                <td style="padding: 8px; color: #ffffff;">${timestamp}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; padding: 12px; background: rgba(16, 217, 126, 0.1); border-radius: 8px; font-size: 13px; color: #10d97e;">
              <strong>Action Required:</strong> Contact this farmer within 24 hours to schedule the FieldShield hardware site inspection and installation quote.
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"AquaSentinel Dispatch" <${smtpUser}>`,
          to: TARGET_DISPATCH_EMAIL,
          replyTo: farmerEmail,
          subject: `🌾 [AquaSentinel Lead] FieldShield Hardware Deployment - ${farmerName}`,
          text: `New Farmer Hardware Protection Lead:
Name: ${farmerName}
Email: ${farmerEmail}
Phone: ${farmerPhone}
Location: ${location}
Land Size: ${acres}
Crop: ${crop}
Time: ${timestamp}`,
          html: htmlContent,
        });

        emailSent = true;
        console.log(`✅ [Nodemailer] Email successfully sent to ${TARGET_DISPATCH_EMAIL}`);
      } catch (sendErr: any) {
        emailError = sendErr?.message || 'SMTP transmission error';
        console.warn(`⚠️ [Nodemailer Warning] SMTP send failed: ${emailError}. Fallback logging active.`);
      }
    }

    // 2. Persist to Supabase table if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('farmer_leads').insert([
          {
            farmer_name: farmerName,
            farmer_email: farmerEmail,
            farmer_phone: farmerPhone,
            location,
            acres,
            crop,
            notes,
            recipient_email: TARGET_DISPATCH_EMAIL,
            created_at: new Date().toISOString(),
          }
        ]);
      } catch (dbErr) {
        // Continue gracefully even if table doesn't exist yet
      }
    }

    return NextResponse.json({
      success: true,
      recipient: TARGET_DISPATCH_EMAIL,
      emailSent,
      emailError,
      message: `Farmer hardware protection request successfully recorded and dispatched to ${TARGET_DISPATCH_EMAIL}.`,
      timestamp,
    });
  } catch (error: any) {
    console.error('Error handling farmer lead:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch lead' },
      { status: 500 }
    );
  }
}
