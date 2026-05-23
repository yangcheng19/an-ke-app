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
      var path = 'articles?' + parts.join('&')
      var result = await supabase(path, { method: 'GET' })
      return new Response(JSON.stringify(result.data), { status: 200, headers: H })
    }
    if (method === 'POST') {
      var body = await req.json()
      var result = await supabase('articles', { method: 'POST', body: JSON.stringify(body) })
      return new Response(JSON.stringify(result.data), { status: 200, headers: H })
    }
    if (method === 'DELETE') {
      var id = url.searchParams.get('id')
      var result = await supabase('articles?id=eq.' + encodeURIComponent(id), { method: 'DELETE' })
      return new Response('{}', { status: 200, headers: H })
    }
    return new Response('{}', { status: 405, headers: H })
  } catch(e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: H })
  }
}
