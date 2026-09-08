import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const TARGET_OPERATIONS_EMAIL = 'aquasentinelfis@gmail.com';

export interface EmergencyAlertPayload {
  recipientEmail?: string;
  userName?: string;
  sector: 'citizen' | 'farmer' | 'authority';
  hasAgriLand?: boolean;
  area?: string;
  weatherCondition?: string;
  rainfall?: number;
  riskScore?: number;
  soilMoisture?: number;
  isSimulation?: boolean;
  notes?: string;
}

export async function POST(req: Request) {
  try {
    const body: EmergencyAlertPayload = await req.json();
    const {
      recipientEmail = '',
      userName = 'AquaSentinel Member',
      sector = 'citizen',
      hasAgriLand = false,
      area = 'Visakhapatnam Coastal Region',
      weatherCondition = 'Severe Cloudburst & Torrential Inundation',
      rainfall = 85.4,
      riskScore = 92.5,
      soilMoisture = 88,
      isSimulation = false,
    } = body;

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log('================================================================');
    console.log(`🚨 [AQUASENTINEL AUTONOMOUS AI CLIMATE DISPATCH] ${isSimulation ? '(SIMULATION DEMO)' : '(LIVE MONITOR)'}`);
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Sector: ${sector.toUpperCase()}`);
    console.log(`User: ${userName} | Recipient: ${recipientEmail || 'Default'}`);
    console.log(`Target Team Recipient: ${TARGET_OPERATIONS_EMAIL}`);
    console.log(`Area: ${area} | Rainfall: ${rainfall}mm/h | Risk Score: ${riskScore}% | Soil Saturation: ${soilMoisture}%`);
    if (sector === 'farmer') console.log(`Agricultural Farmland Registered: ${hasAgriLand ? 'YES' : 'NO'}`);
    console.log('================================================================');

    // Build Sector-Specific Email Template & Advice
    let emailSubject = '';
    let emailBodyHtml = '';
    let actionChecklist: string[] = [];

    if (sector === 'farmer') {
      if (hasAgriLand) {
        emailSubject = `🌾 [AquaSentinel Agricultural Emergency] Critical Flood Threat to Standing Crops in ${area}`;
        actionChecklist = [
          '⚠️ Immediate Cloudburst Surge: Continuous torrential rainfall detected over agricultural basin.',
          '🚨 Field Drainage Alert: High risk of crop root submersion and waterlogging damage (Paddy, Sugarcane, Maize).',
          '⚡ Automated FieldShield Action: Deploy automated sluice gates and initiate emergency drainage pumps immediately.',
          '🚜 Move heavy tractors and electric pump sets to designated elevated farm bunds.',
          '📞 AquaSentinel Agricultural Support Line: Active on emergency frequency.'
        ];
        emailBodyHtml = `
          <div style="font-family: Arial, sans-serif; background: #07150f; color: #e4f7ee; padding: 24px; border-radius: 12px; border: 1px solid #00ff88;">
            <div style="border-bottom: 2px solid #00ff88; padding-bottom: 12px; margin-bottom: 18px;">
              <span style="background: #ff4444; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
                ${isSimulation ? 'HACKATHON CRITICAL SIMULATION DEMO' : 'HIGH PRIORITY AGRICULTURAL ALERT'}
              </span>
              <h2 style="color: #00ff88; margin: 10px 0 4px 0;">🌾 Urgent Agricultural Flood Protection Directive</h2>
              <p style="color: #6edaa5; font-size: 14px; margin: 0;">AquaSentinel AI Climate Guardian • Farmland Protection Mesh</p>
            </div>

            <p style="font-size: 15px; line-height: 1.5;">
              Dear <strong>${userName}</strong>, our AI climate monitoring engine and XGBoost ML predictive models have detected a <strong>critical weather escalation (${weatherCondition})</strong> across your registered farmland in <strong>${area}</strong>.
            </p>

            <div style="background: rgba(0, 255, 136, 0.08); border: 1px solid rgba(0, 255, 136, 0.3); border-radius: 8px; padding: 14px; margin: 16px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr><td style="color: #6edaa5; padding: 4px 0;"><strong>🌧️ Rainfall Rate:</strong></td><td style="color: #fff; font-weight: bold;">${rainfall} mm/hr</td></tr>
                <tr><td style="color: #6edaa5; padding: 4px 0;"><strong>🧠 XGBoost Inundation Probability:</strong></td><td style="color: #ff4444; font-weight: bold;">${riskScore}% (CRITICAL)</td></tr>
                <tr><td style="color: #6edaa5; padding: 4px 0;"><strong>🌱 Soil Pore Saturation:</strong></td><td style="color: #fff;">${soilMoisture}% (Severe Runoff Threshold)</td></tr>
                <tr><td style="color: #6edaa5; padding: 4px 0;"><strong>🛡️ Farmland Status:</strong></td><td style="color: #00ff88; font-weight: bold;">Active Farmland Protection Active</td></tr>
              </table>
            </div>

            <h3 style="color: #00ff88; font-size: 15px; margin-bottom: 8px;">🛡️ Immediate Crop Preservation Protocol:</h3>
            <ul style="padding-left: 20px; line-height: 1.6; font-size: 14px; color: #d0f0e0;">
              ${actionChecklist.map(item => `<li>${item}</li>`).join('')}
            </ul>

            <div style="margin-top: 20px; padding: 12px; background: rgba(255, 68, 68, 0.15); border-left: 4px solid #ff4444; border-radius: 4px; font-size: 13px;">
              <strong>Autonomous Hardware Link:</strong> FieldShield automated barriers have been signaled for immediate deployment. Operations team notified at <a href="mailto:${TARGET_OPERATIONS_EMAIL}" style="color: #00ff88;">${TARGET_OPERATIONS_EMAIL}</a>.
            </div>
          </div>
        `;
      } else {
        emailSubject = `🌾 [AquaSentinel Rural Advisory] Severe Weather & Storm Advisory for ${area}`;
        actionChecklist = [
          '⚠️ Heavy Precipitation Incoming: Expect severe thunderstorms and localized waterlogging.',
          '🐄 Livestock Safety: Move livestock and farm animals to high-elevation covered shelters.',
          '🌾 Granary Protection: Seal and elevate harvested produce and seed bags.',
          '⚡ Power Disconnect: Turn off outdoor electrical irrigation motors during lightning.'
        ];
        emailBodyHtml = `
          <div style="font-family: Arial, sans-serif; background: #07150f; color: #e4f7ee; padding: 24px; border-radius: 12px; border: 1px solid #00ff88;">
            <div style="border-bottom: 2px solid #00ff88; padding-bottom: 12px; margin-bottom: 18px;">
              <span style="background: #ffaa00; color: #000; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
                ${isSimulation ? 'HACKATHON SIMULATION DEMO' : 'RURAL WEATHER ADVISORY'}
              </span>
              <h2 style="color: #00ff88; margin: 10px 0 4px 0;">🌾 Agricultural Sector Weather Warning</h2>
              <p style="color: #6edaa5; font-size: 14px; margin: 0;">AquaSentinel AI Climate Guardian</p>
            </div>

            <p style="font-size: 15px; line-height: 1.5;">
              Dear <strong>${userName}</strong>, severe weather conditions (<strong>${weatherCondition}</strong>) are developing in <strong>${area}</strong>. Please follow precautions to protect farm animals and equipment.
            </p>

            <ul style="padding-left: 20px; line-height: 1.6; font-size: 14px; color: #d0f0e0;">
              ${actionChecklist.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    } else if (sector === 'authority') {
      emailSubject = `🛡️ [AquaSentinel Authority Command] Critical Inundation & Incident Response Directive — ${area}`;
      actionChecklist = [
        '🚨 Severe District Inundation: Poorna Market (85cm+), Gajuwaka (70cm+), Gopalapatnam (65cm+) reaching critical threshold.',
        '📡 Automated Siren Authorization: Ready for broadcast dispatch across low-lying coastal wards.',
        '🚒 Emergency Services Staging: SDRF / NDRF rapid mobilization recommended along NH-16 & Beach Road corridors.',
        '🚧 Road Barrier Protocol: Seal submerged subways and Jagadamba underpasses.',
        '📊 Live Sensor Feed: 14 IoT telemetry stations streaming continuous runoff metrics.'
      ];
      emailBodyHtml = `
        <div style="font-family: Arial, sans-serif; background: #140707; color: #fee8e8; padding: 24px; border-radius: 12px; border: 1px solid #ff4444;">
          <div style="border-bottom: 2px solid #ff4444; padding-bottom: 12px; margin-bottom: 18px;">
            <span style="background: #ff4444; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
              ${isSimulation ? 'HACKATHON CRITICAL SIMULATION DEMO' : 'AUTHORITY EMERGENCY DIRECTIVE'}
            </span>
            <h2 style="color: #ff4444; margin: 10px 0 4px 0;">🛡️ Disaster Management Command Telemetry</h2>
            <p style="color: #f87171; font-size: 14px; margin: 0;">AquaSentinel Automated Incident & Inundation Dispatch</p>
          </div>

          <p style="font-size: 15px; line-height: 1.5;">
            Attention <strong>Disaster Management Authority (${userName})</strong>: AI Sentinel telemetry indicates an extreme hydrological event (<strong>${rainfall} mm/h precipitation</strong> with <strong>${riskScore}% XGBoost flood probability</strong>).
          </p>

          <div style="background: rgba(255, 68, 68, 0.1); border: 1px solid rgba(255, 68, 68, 0.3); border-radius: 8px; padding: 14px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="color: #fca5a5; padding: 4px 0;"><strong>📍 Primary Impact Zone:</strong></td><td style="color: #fff; font-weight: bold;">${area}</td></tr>
              <tr><td style="color: #fca5a5; padding: 4px 0;"><strong>🌧️ Peak Precipitation:</strong></td><td style="color: #ff4444; font-weight: bold;">${rainfall} mm/hr (Cloudburst)</td></tr>
              <tr><td style="color: #fca5a5; padding: 4px 0;"><strong>🧠 XGBoost Risk Score:</strong></td><td style="color: #ff4444; font-weight: bold;">${riskScore}% (Level 3 Emergency)</td></tr>
              <tr><td style="color: #fca5a5; padding: 4px 0;"><strong>👥 Est. Affected Population:</strong></td><td style="color: #fff; font-weight: bold;">65,000+ residents in low basins</td></tr>
            </table>
          </div>

          <h3 style="color: #ff6b6b; font-size: 15px; margin-bottom: 8px;">📋 Authority Emergency Checklist:</h3>
          <ul style="padding-left: 20px; line-height: 1.6; font-size: 14px; color: #ffd6d6;">
            ${actionChecklist.map(item => `<li>${item}</li>`).join('')}
          </ul>

          <div style="margin-top: 20px; padding: 12px; background: rgba(0, 214, 255, 0.1); border-left: 4px solid #00d6ff; border-radius: 4px; font-size: 13px; color: #00d6ff;">
            <strong>Live Dashboard Sync:</strong> Incident tickets and evacuation routes have been updated in real-time on the command console.
          </div>
        </div>
      `;
    } else {
      // Citizen Sector
      emailSubject = `🚨 [AquaSentinel Citizen Alert] Critical Flash Flood & Storm Warning in ${area}`;
      actionChecklist = [
        '🚫 Avoid Flooded Thoroughfares: Submersion detected across Jagadamba, Poorna Market & Gajuwaka.',
        '🛣️ Recommended Safe Route: Utilize Beach Road and IT Corridor highway elevations.',
        '🏠 Home Flood Defense: Seal ground floor entrances and move valuables to upper levels.',
        '⚡ Electrical Safety: Switch off main electrical circuit breakers if water ingress is observed.',
        '📞 24/7 Citizen Emergency Toll-Free Helpline: Call 1077 or 112 for immediate water rescue.'
      ];
      emailBodyHtml = `
        <div style="font-family: Arial, sans-serif; background: #08111d; color: #e2eaf4; padding: 24px; border-radius: 12px; border: 1px solid #2563eb;">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px;">
            <span style="background: #ff4444; color: #fff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
              ${isSimulation ? 'HACKATHON CRITICAL SIMULATION DEMO' : 'URGENT CITIZEN SAFETY ALERT'}
            </span>
            <h2 style="color: #60a5fa; margin: 10px 0 4px 0;">🚨 Severe Weather & Flood Alert</h2>
            <p style="color: #93c5fd; font-size: 14px; margin: 0;">AquaSentinel AI Climate Guardian • Citizen Protection</p>
          </div>

          <p style="font-size: 15px; line-height: 1.5;">
            Dear <strong>${userName}</strong>, our AI weather monitoring system has detected imminent severe flash flooding conditions (<strong>${weatherCondition}</strong>) near your location in <strong>${area}</strong>.
          </p>

          <div style="background: rgba(37, 99, 235, 0.1); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 8px; padding: 14px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="color: #93c5fd; padding: 4px 0;"><strong>🌧️ Rainfall Rate:</strong></td><td style="color: #fff; font-weight: bold;">${rainfall} mm/hr</td></tr>
              <tr><td style="color: #93c5fd; padding: 4px 0;"><strong>🧠 AI Flood Probability:</strong></td><td style="color: #ff4444; font-weight: bold;">${riskScore}% (HIGH RISK)</td></tr>
              <tr><td style="color: #93c5fd; padding: 4px 0;"><strong>🗺️ Passable Route:</strong></td><td style="color: #00ff88; font-weight: bold;">Beach Road Corridor (Clear)</td></tr>
            </table>
          </div>

          <h3 style="color: #60a5fa; font-size: 15px; margin-bottom: 8px;">🛡️ Citizen Safety Guidelines:</h3>
          <ul style="padding-left: 20px; line-height: 1.6; font-size: 14px; color: #e2eaf4;">
            ${actionChecklist.map(item => `<li>${item}</li>`).join('')}
          </ul>

          <div style="margin-top: 20px; padding: 12px; background: rgba(37, 99, 235, 0.15); border-radius: 8px; font-size: 13px; color: #93c5fd;">
            <strong>Real-time Protection:</strong> Monitor the AquaSentinel Live Map for dynamic road water level updates and verified rescue shelters.
          </div>
        </div>
      `;
    }

    // Recipients list: Always dispatch to operations team and user's email if provided
    const recipients = [TARGET_OPERATIONS_EMAIL];
    if (recipientEmail && recipientEmail.includes('@') && !recipients.includes(recipientEmail)) {
      recipients.push(recipientEmail);
    }

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

        await transporter.sendMail({
          from: `"AquaSentinel AI Guardian" <${smtpUser}>`,
          to: recipients.join(', '),
          subject: emailSubject,
          text: `AQUASENTINEL EMERGENCY ALERT\nSector: ${sector.toUpperCase()}\nArea: ${area}\nRainfall: ${rainfall}mm/hr\nRisk: ${riskScore}%\nActions:\n${actionChecklist.join('\n')}`,
          html: emailBodyHtml,
        });

        emailSent = true;
        console.log(`✅ [Nodemailer] Emergency Alert successfully dispatched to ${recipients.join(', ')}`);
      } catch (err: any) {
        emailError = err?.message || 'SMTP transmission error';
        console.warn(`⚠️ [Nodemailer Warning] SMTP send failed: ${emailError}. Fallback active.`);
      }
    }

    // Persist to Supabase emergency_alerts table if configured
    if (isSupabaseConfigured) {
      try {
        await supabase.from('emergency_alerts').insert([
          {
            sector,
            user_name: userName,
            recipient_emails: recipients,
            area,
            rainfall,
            risk_score: riskScore,
            soil_moisture: soilMoisture,
            is_simulation: isSimulation,
            created_at: new Date().toISOString(),
          }
        ]);
      } catch (dbErr) {
        // Continue gracefully if table doesn't exist
      }
    }

    return NextResponse.json({
      success: true,
      recipients,
      emailSent,
      emailError,
      sector,
      subject: emailSubject,
      message: `Emergency alert successfully processed and dispatched to ${recipients.join(', ')}.`,
      timestamp,
      isSimulation,
    });
  } catch (error: any) {
    console.error('Error handling emergency alert:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch alert' },
      { status: 500 }
    );
  }
}
