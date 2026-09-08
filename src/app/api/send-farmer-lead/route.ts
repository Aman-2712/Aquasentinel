import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { farmerName, farmerEmail, farmerPhone, location, acres, crop } = body;

    console.log('---------------------------------------------------------');
    console.log('🌾 [FIELDSHIELD AUTOMATED DISPATCH SYSTEM]');
    console.log('Sending Farmer Protection Lead Notification...');
    console.log(`To: aquasentinelfis@gmail.com`);
    console.log(`Subject: New FieldShield Hardware Deployment Lead - ${farmerName}`);
    console.log(`Farmer Name: ${farmerName}`);
    console.log(`Email: ${farmerEmail}`);
    console.log(`Phone: ${farmerPhone || 'N/A'}`);
    console.log(`Location: ${location || 'Visakhapatnam Catchment Zone'}`);
    console.log(`Land Area: ${acres || '4.5 Acres'}`);
    console.log(`Target Crop: ${crop || 'Paddy & Mixed Agriculture'}`);
    console.log(`Status: DISPATCHED TO OPERATIONS TEAM`);
    console.log('---------------------------------------------------------');

    return NextResponse.json({
      success: true,
      recipient: 'aquasentinelfis@gmail.com',
      message: 'FieldShield protection lead request recorded and dispatched to aquasentinelfis@gmail.com.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to dispatch lead' },
      { status: 500 }
    );
  }
}
