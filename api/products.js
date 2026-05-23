var SUPABASE_URL = 'https://hwxskrvzyzklqhtbljjj.supabase.co'
var SUPABASE_KEY = 'sb_publishable_Z532VBTIfq0yBj4K3f26-g_S81ro8kz'
var H = { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }

async function supabase(path, opts) {
  var url = SUPABASE_URL + '/rest/v1/' + path
  var res = await fetch(url, Object.assign({ headers: H }, opts || {}))
  return { data: await res.json(), status: res.status }
}

module.exports = async function(req) {
  var url = new URL(req.url)
  var method = req.method
  try {
    if (method === 'GET') {
      var select = url.searchParams.get('select') || '*'
      var parts = ['select=' + select]
      url.searchParams.forEach(function(v, k) {
        if (k === 'select') return
        parts.push(k + '=' + v)
      })
      var path = 'products?' + parts.join('&')
      var result = await supabase(path, { method: 'GET' })
      return new Response(JSON.stringify(result.data), { status: 200, headers: H })
    }
    if (method === 'POST') {
      var body = await req.json()
      var result = await supabase('products', { method: 'POST', body: JSON.stringify(body) })
      return new Response(JSON.stringify(result.data), { status: 200, headers: H })
    }
    if (method === 'PATCH') {
      var body2 = await req.json()
      var id = url.searchParams.get('id')
      var q = id ? 'products?id=eq.' + encodeURIComponent(id) : 'products'
      var result = await supabase(q, { method: 'PATCH', body: JSON.stringify(body2) })
      return new Response(JSON.stringify(result.data), { status: 200, headers: H })
    }
    return new Response('{}', { status: 405, headers: H })
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: H })
  }
}
