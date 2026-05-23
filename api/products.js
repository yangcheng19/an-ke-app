export const config = { runtime: 'edge' }

var SB = 'https://hwxskrvzyzklqhtbljjj.supabase.co/rest/v1/products'
var KEY = 'sb_publishable_Z532VBTIfq0yBj4K3f26-g_S81ro8kz'
var H = { 'Content-Type':'application/json', apikey:KEY, Authorization:'Bearer '+KEY }

export default async function handler(req) {
  try {
    var u = new URL(req.url)
    var m = req.method

    if (m === 'GET') {
      var qs = u.search || '?select=*'
      var r = await fetch(SB + qs, { headers: H })
      return new Response(JSON.stringify(await r.json()), { headers: H })
    }
    if (m === 'POST') {
      var b = await req.json()
      b.created_at = new Date().toISOString()
      var r = await fetch(SB, { method:'POST', headers:{...H,Prefer:'return=representation'}, body:JSON.stringify(b) })
      return new Response(JSON.stringify(await r.json()), { headers: H })
    }
    if (m === 'PATCH') {
      var id = u.searchParams.get('id')
      var b2 = await req.json()
      var r = await fetch(SB + '?id=eq.' + encodeURIComponent(id), { method:'PATCH', headers:{...H,Prefer:'return=representation'}, body:JSON.stringify(b2) })
      return new Response(JSON.stringify(await r.json()), { headers: H })
    }
    return new Response('[]', { headers: H })
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: H })
  }
}
