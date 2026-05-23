var SUPABASE_URL = 'https://hwxskrvzyzklqhtbljjj.supabase.co'
var SUPABASE_KEY = 'sb_publishable_Z532VBTIfq0yBj4K3f26-g_S81ro8kz'
var H = { 'Content-Type': 'application/json', 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }

async function sb(path, opts) {
  var url = SUPABASE_URL + '/rest/v1/' + path
  var res = await fetch(url, Object.assign({ headers: H }, opts || {}))
  return res.json()
}

module.exports = async function(req, res) {
  try {
    if (req.method === 'GET') {
      var q = req.query || {}
      var select = q.select || '*'
      var parts = ['select=' + select]
      for (var k in q) {
        if (k === 'select') continue
        parts.push(k + '=' + q[k])
      }
      var data = await sb('articles?' + parts.join('&'))
      return res.json(data)
    }
    if (req.method === 'POST') {
      var data = await sb('articles', { method: 'POST', body: JSON.stringify(req.body) })
      return res.json(data)
    }
    if (req.method === 'DELETE') {
      var id = req.query.id
      await sb('articles?id=eq.' + encodeURIComponent(id), { method: 'DELETE' })
      return res.json({ ok: true })
    }
    res.status(405).json({})
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
