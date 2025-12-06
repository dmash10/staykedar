import { ImageResponse } from '@vercel/og';

export const config = {
    runtime: 'edge',
};

export default function handler(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const stopsParam = searchParams.get('stops') || 'Haridwar,Rishikesh,Devprayag,Srinagar,Rudraprayag,Guptkashi,Sonprayag,Kedarnath';
        const stops = stopsParam.split(',');
        const title = searchParams.get('title') || 'Route Map';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        backgroundColor: '#0f172a',
                        backgroundImage: 'linear-gradient(#1e293b 2px, transparent 2px), linear-gradient(90deg, #1e293b 2px, transparent 2px)',
                        backgroundSize: '50px 50px',
                        fontFamily: 'sans-serif',
                        padding: '40px',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            marginBottom: '60px',
                        }}
                    >
                        <div style={{ color: 'white', fontSize: '30px', fontWeight: 'bold' }}>{title}</div>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
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
                        </div>
                    </div>

                    {/* Map Container */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '20px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            maxWidth: '1000px',
                        }}
                    >
                        {stops.map((stop, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                {/* Node */}
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        backgroundColor: index === 0 || index === stops.length - 1 ? '#9333ea' : 'white',
                                        color: index === 0 || index === stops.length - 1 ? 'white' : '#1e293b',
                                        padding: '16px 24px',
                                        borderRadius: '16px',
                                        border: '4px solid #9333ea',
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                                        minWidth: '150px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{stop}</span>
                                    {index === 0 && <span style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>START</span>}
                                    {index === stops.length - 1 && <span style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>END</span>}
                                </div>

                                {/* Arrow (unless last item) */}
                                {index < stops.length - 1 && (
                                    <div style={{ margin: '0 10px' }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
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
