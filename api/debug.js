module.exports = async function(req, res) {
  var url = new URL(req.url, 'http://' + req.headers.host)
  res.json({
    has_query_prop: typeof req.query !== 'undefined',
    query_keys: req.query ? Object.keys(req.query) : [],
    url_search: url.search,
    search_params: Array.from(url.searchParams.entries())
  })
}
