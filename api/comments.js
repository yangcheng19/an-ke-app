var SUPABASE_URL = 'https://hwxskrvzyzklqhtbljjj.supabase.co'
var SUPABASE_KEY = 'sb_publishable_Z532VBTIfq0yBj4K3f26-g_S81ro8kz'
var H = { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }

async function supabase(path, opts) {
  var url = SUPABASE_URL + '/rest/v1/' + path
  var res = await fetch(url, { headers: H, ...opts })
  return { data: await res.json(), status: res.status }
}

export default async function handler(req) {
  var url = new URL(req.url)
  var method = req.method
  try {
    if (method === 'GET') {
      var target_type = url.searchParams.get('target_type')
      var target_id = url.searchParams.get('target_id')
      var path = 'comments?select=*&target_type=eq.' + target_type + '&target_id=eq.' + target_id + '&order=created_at.desc&limit=50'
      var result = await supabase(path, { method: 'GET' })
      return new Response(JSON.stringify(result.data), { status: 200, headers: H })
    }
    if (method === 'POST') {
      var body = await req.json()
      var result = await supabase('comments', { method: 'POST', body: JSON.stringify(body) })
      return new Response(JSON.stringify(result.data), { status: 200, headers: H })
    }
    return new Response('{}', { status: 405, headers: H })
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: H })
  }
}
