import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'XCP.FUN - Burn after minting';
export const size = {
  width: 1200,
  height: 600,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 25%, #a855f7 50%, #ec4899 75%, #22c55e 100%)',
          backgroundSize: '200% 200%',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textShadow: '0 4px 6px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: 160, fontWeight: 'bold', marginBottom: 20 }}>
          XCP.FUN
        </div>
        <div style={{ fontSize: 48, opacity: 0.95 }}>
          🔥 Burn after minting 🔥
        </div>
        <div style={{ fontSize: 32, marginTop: 40, opacity: 0.9 }}>
          XCP-420 Standard • Fair Launches
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}