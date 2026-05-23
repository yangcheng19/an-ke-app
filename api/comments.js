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
      var tt = req.query.target_type
      var ti = req.query.target_id
      var path = 'comments?select=*&target_type=eq.' + encodeURIComponent(tt) + '&target_id=eq.' + encodeURIComponent(ti) + '&order=created_at.desc&limit=50'
      var data = await sb(path)
      return res.json(data)
    }
    if (req.method === 'POST') {
      var data = await sb('comments', { method: 'POST', body: JSON.stringify(req.body) })
      return res.json(data)
    }
    res.status(405).json({})
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
