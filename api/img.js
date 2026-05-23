export const config = { runtime: 'edge' }

// Vercel Edge 缓存: 建好就缓存一年，后面全从 CDN 边缘节点出
export default async function handler(req) {
  var u = new URL(req.url)
  var src = u.searchParams.get('url')
  if (!src) return new Response('missing url', { status: 400 })

  // 只允许代理 Supabase 存储的图片
  if (src.indexOf('supabase.co/storage/v1/object/public/images/') === -1) {
    return new Response('not allowed', { status: 403 })
  }

  try {
    var r = await fetch(src)
    if (!r.ok) return new Response('image not found', { status: 404 })

    return new Response(r.body, {
      status: 200,
      headers: {
        'Content-Type': r.headers.get('Content-Type') || 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch(e) {
    return new Response('proxy error', { status: 500 })
  }
}
