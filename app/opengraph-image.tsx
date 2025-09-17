import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

// Image metadata
export const alt = 'XCP.FUN - Burn after minting';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div style={{ fontSize: 160, fontWeight: 'bold', marginBottom: 20 }}>
          XCP.FUN
        </div>
        <div style={{ fontSize: 48, opacity: 0.9 }}>
          🔥 Burn after minting 🔥
        </div>
        <div style={{ fontSize: 32, marginTop: 40, opacity: 0.8 }}>
          XCP-420 Standard Fairminters
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}