import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

export default function handler(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const from = searchParams.get('from') || 'Haridwar';
        const to = searchParams.get('to') || 'Kedarnath';
        const price = searchParams.get('price') || '4500';
        const vehicle = searchParams.get('vehicle') || 'Sedan';
        const distance = searchParams.get('distance') || '230 km';
        const time = searchParams.get('time') || '8 hrs';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0f172a',
                        backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
                        backgroundSize: '100px 100px',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Brand Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '20px',
                        }}
                    >
                        <div
                            style={{
                                backgroundColor: '#9333ea',
                                borderRadius: '12px',
                                padding: '10px 16px',
                                color: 'white',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                marginRight: '12px',
                            }}
                        >
                            SK
                        </div>
                        <div style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>StayKedar</div>
                    </div>

                    {/* Main Card */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            padding: '40px',
                            width: '800px',
                            boxShadow: '0 20px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '4px solid #9333ea',
                        }}
                    >
                        {/* Route Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '40px',
                                borderBottom: '2px solid #e2e8f0',
                                paddingBottom: '20px',
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '24px', color: '#64748b', marginBottom: '4px' }}>From</span>
                                <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#0f172a' }}>{from}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px' }}>
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#9333ea"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '24px', color: '#64748b', marginBottom: '4px' }}>To</span>
                                <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#0f172a' }}>{to}</span>
                            </div>
                        </div>

                        {/* Price section */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '40px',
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '20px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Vehicle Type</span>
                                <span style={{ fontSize: '32px', color: '#0f172a' }}>{vehicle}</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    backgroundColor: '#f3e8ff',
                                    padding: '16px 32px',
                                    borderRadius: '16px',
                                    border: '1px solid #d8b4fe',
                                }}
                            >
                                <span style={{ fontSize: '16px', color: '#7e22ce', fontWeight: 'bold', textTransform: 'uppercase' }}>Fixed Rate</span>
                                <span style={{ fontSize: '56px', fontWeight: 'bold', color: '#7e22ce' }}>₹{price}</span>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                    <span style={{ fontSize: '20px', color: '#475569' }}>{time}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" /></svg>
                                    <span style={{ fontSize: '20px', color: '#475569' }}>{distance}</span>
                                </div>
                            </div>
                            <div style={{ fontSize: '20px', color: '#475569', fontWeight: 'bold' }}>
                                staykedarnath.in
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
