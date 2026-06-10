import React from 'react'

export default function Page() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '600px', margin: 'auto' }}>
      <h1>Allbirds Storefront Backend</h1>
      <p>This is the Payload CMS 3.x backend powered by Next.js 15.</p>
      <p>
        <a href="/admin" style={{ display: 'inline-block', background: '#333', color: '#fff', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px' }}>
          Go to Admin Panel
        </a>
      </p>
    </div>
  )
}
