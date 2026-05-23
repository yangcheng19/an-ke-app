// ========== Supabase 初始化 ==========
var SUPABASE_URL = 'https://hwxskrvzyzklqhtbljjj.supabase.co'
var SUPABASE_KEY = 'sb_publishable_Z532VBTIfq0yBj4K3f26-g_S81ro8kz'
var sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// ========== 用户 ID ==========
function uid() {
  var id = localStorage.getItem('ak_uid')
  if (!id) { id = 'u' + Math.random().toString(36).slice(2,10) + Date.now().toString(36); localStorage.setItem('ak_uid', id) }
  return id
}

// ========== 页面切换 ==========
function showPage(name) {
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active') })
  var el = document.getElementById('page-' + name)
  if (el) el.classList.add('active')
  document.querySelectorAll('.tab-item').forEach(function(t){
    t.classList.toggle('active', t.dataset.page === name)
  })
}

function showPublishChoice() {
  document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('active') })
  document.getElementById('page-choice').classList.add('active')
}

// ========== 首页 ==========
var homeMode = 'products'
var homeCategory = '全部'
var homeArticleCategory = '全部'
var productCategories = ['全部','数码','服饰','家居','美妆','母婴','图书','运动','其他']
var articleCategories = ['全部','表白墙','吃瓜','师说生语','校园趣事','学习分享','寻物启事','吐槽','其他']

function switchMode(mode) {
  homeMode = mode
  document.querySelectorAll('.mode-item').forEach(function(el){
    el.classList.toggle('active', el.dataset.mode === mode)
  })
  document.getElementById('cat-bar-products').style.display = mode === 'products' ? '' : 'none'
  document.getElementById('cat-bar-articles').style.display = mode === 'articles' ? '' : 'none'
  if (mode === 'products') fetchProducts()
  else fetchArticles()
}

function selectCategory(cat) { homeCategory = cat; renderCatBar(); fetchProducts() }
function selectArticleCategory(cat) { homeArticleCategory = cat; renderArticleCatBar(); fetchArticles() }

function renderCatBar() {
  var html = ''
  productCategories.forEach(function(cat){
    html += '<span class="cat-item' + (cat === homeCategory ? ' active' : '') + '" onclick="selectCategory(\'' + cat + '\')">' + cat + '</span>'
  })
  document.getElementById('cat-bar-products').innerHTML = html
}

function renderArticleCatBar() {
  var html = ''
  articleCategories.forEach(function(cat){
    html += '<span class="cat-item' + (cat === homeArticleCategory ? ' active' : '') + '" onclick="selectArticleCategory(\'' + cat + '\')">' + cat + '</span>'
  })
  document.getElementById('cat-bar-articles').innerHTML = html
}

function fetchProducts() {
  var query = sb.from('products').select('*').eq('status', 'active').order('created_at', { ascending: false }).limit(50)
  if (homeCategory !== '全部') query = query.eq('category', homeCategory)
  query.then(function(res){ renderProducts(res.data || []) })
}

function renderProducts(products) {
  var html = ''
  if (!products.length) {
    html = '<div class="empty-tip"><span class="empty-icon">📦</span>还没有物品</div>'
  } else {
    html = '<div class="product-grid">'
    products.forEach(function(p){
      html += '<div class="product-card" onclick="viewProduct(' + p.id + ')">'
      var imgs = p.images; if (typeof imgs === 'string') imgs = JSON.parse(imgs || '[]')
      if (imgs && imgs.length) html += '<img class="product-img" src="' + imgs[0] + '">'
      else html += '<div class="product-img"></div>'
      html += '<div class="product-info"><div class="product-title">' + esc(p.title) + '</div>'
      html += '<div class="product-price">' + (p.price || 0) + '</div></div></div>'
    })
    html += '</div>'
  }
  document.getElementById('product-list').innerHTML = html
}

function fetchArticles() {
  var query = sb.from('articles').select('*').order('created_at', { ascending: false }).limit(50)
  if (homeArticleCategory !== '全部') query = query.eq('category', homeArticleCategory)
  query.then(function(res){ renderArticles(res.data || []) })
}

function renderArticles(articles) {
  var html = ''
  if (!articles.length) {
    html = '<div class="empty-tip"><span class="empty-icon">📝</span>还没有文案</div>'
  } else {
    html = '<div class="article-list">'
    articles.forEach(function(a){
      html += '<div class="article-card" onclick="viewArticle(' + a.id + ')">'
      html += '<span class="article-cat">' + a.category + '</span>'
      html += '<div class="article-title">' + esc(a.title) + '</div>'
      html += '<div class="article-preview">' + esc(a.content || '').substring(0, 80) + '</div>'
      html += '<div class="article-meta">' + (a.view_count || 0) + '阅读 · ' + fmt(a.created_at) + '</div></div>'
    })
    html += '</div>'
  }
  document.getElementById('product-list').innerHTML = html
}

// ========== 发布物品 ==========
var productImages = []

function showPublishProduct() { showPage('publish-product') }

function addProductImage(input) {
  var file = input.files[0]; if (!file) return
  var reader = new FileReader()
  reader.onload = function(e) { productImages.push(e.target.result); renderProductImages() }
  reader.readAsDataURL(file); input.value = ''
}

function renderProductImages() {
  var html = ''
  productImages.forEach(function(img, i){
    html += '<div style="position:relative"><img class="img-item" src="' + img + '"><span class="img-del" onclick="productImages.splice('+i+',1);renderProductImages()">✕</span></div>'
  })
  if (productImages.length < 9) html += '<label class="img-add"><span>+</span><input type="file" accept="image/*" onchange="addProductImage(this)" hidden></label>'
  document.getElementById('product-images-preview').innerHTML = html
}

function submitProduct() {
  var title = document.getElementById('prod-title').value.trim()
  var desc = document.getElementById('prod-desc').value.trim()
  var price = parseFloat(document.getElementById('prod-price').value)
  var cat = document.getElementById('prod-cat').value
  var wechat = document.getElementById('prod-wechat').value.trim()
  if (!productImages.length) return alert('请上传物品图片')
  if (!title) return alert('请输入标题')
  if (isNaN(price) || price <= 0) return alert('请输入正确的价值')
  if (!wechat) return alert('请输入微信号')

  var user = JSON.parse(localStorage.getItem('ak_user')||'{}')
  sb.from('products').insert({
    title: title, description: desc, price: price, category: cat,
    images: productImages, contact_wechat: wechat,
    seller_name: user.nickName || '微信用户',
    author_id: uid(), status: 'active', view_count: 0
  }).then(function(res){
    if (res.error) return alert('发布失败: ' + res.error.message)
    alert('分享成功！')
    productImages = []; renderProductImages()
    document.getElementById('prod-title').value = ''
    document.getElementById('prod-desc').value = ''
    document.getElementById('prod-price').value = ''
    document.getElementById('prod-wechat').value = ''
    showPage('home'); switchMode('products')
  })
}

// ========== 发布文案 ==========
function showPublishArticle() { showPage('publish-article') }

function submitArticle() {
  var title = document.getElementById('art-title').value.trim()
  var content = document.getElementById('art-content').value.trim()
  var cat = document.getElementById('art-cat').value
  if (!title) return alert('请输入标题')
  if (!content) return alert('请输入内容')

  var user = JSON.parse(localStorage.getItem('ak_user')||'{}')
  sb.from('articles').insert({
    title: title, content: content, category: cat,
    author_name: user.nickName || '微信用户',
    author_id: uid()
  }).then(function(res){
    if (res.error) return alert('发布失败: ' + res.error.message)
    alert('分享成功！')
    document.getElementById('art-title').value = ''
    document.getElementById('art-content').value = ''
    showPage('home'); switchMode('articles')
  })
}

// ========== 物品详情 ==========
function viewProduct(id) {
  sb.from('products').select('*').eq('id', id).single().then(function(res){
    var p = res.data; if (!p) return
    sb.from('products').update({ view_count: (p.view_count||0)+1 }).eq('id', id).then(function(){})
    var imgs = p.images; if (typeof imgs === 'string') imgs = JSON.parse(imgs || '[]')
    var html = imgs.length ? '<div class="detail-images"><img src="' + imgs[0] + '"></div>' : ''
    html += '<div class="detail-info"><div class="detail-price">' + (p.price||0) + '米粒</div>'
    html += '<div class="detail-title">' + esc(p.title) + '</div>'
    html += '<div class="detail-meta">' + fmt(p.created_at) + ' · ' + (p.view_count||0) + '次浏览 · ' + p.category + '</div></div>'
    html += '<div class="detail-seller"><img class="seller-avatar" src="' + (p.seller_avatar || '') + '"><div><div class="seller-name">' + esc(p.seller_name || '微信用户') + '</div><div class="seller-label">分享者</div></div></div>'
    html += '<div class="detail-desc">' + esc(p.description || '暂无描述') + '</div>'
    html += '<div class="detail-bar"><button class="btn-contact" onclick="contactSeller(\'' + esc(p.contact_wechat || '') + '\')">联系Ta</button></div>'
    document.getElementById('detail-content').innerHTML = html
    showPage('detail')
  })
}

function contactSeller(wechat) {
  document.getElementById('modal-wechat').innerText = wechat || '未填写'
  document.getElementById('contact-modal').style.display = 'flex'
}

// ========== 文案详情 ==========
function viewArticle(id) {
  sb.from('articles').select('*').eq('id', id).single().then(function(res){
    var a = res.data; if (!a) return
    sb.from('articles').update({ view_count: (a.view_count||0)+1 }).eq('id', id).then(function(){})
    var html = '<div class="article-page"><div class="article-header">'
    html += '<span class="article-cat-tag">' + a.category + '</span>'
    html += '<h1 class="article-h1">' + esc(a.title) + '</h1>'
    html += '<div class="article-time">' + fmt(a.created_at) + ' · ' + (a.view_count||0) + '阅读</div></div>'
    html += '<div class="article-body">' + esc(a.content) + '</div></div>'
    document.getElementById('article-detail-content').innerHTML = html
    showPage('article-detail')
  })
}

// ========== 我的 ==========
function loadMy() {
  var myId = uid()
  Promise.all([
    sb.from('products').select('*').eq('author_id', myId).order('created_at', { ascending: false }).limit(50),
    sb.from('articles').select('*').eq('author_id', myId).order('created_at', { ascending: false }).limit(50)
  ]).then(function(results){
    var myProducts = results[0].data || []
    var myArticles = results[1].data || []
    var user = JSON.parse(localStorage.getItem('ak_user')||'{}')
    var avatarImg = document.getElementById('my-avatar'); if(avatarImg) avatarImg.src = user.avatarUrl || ''
    document.getElementById('my-name').innerText = user.nickName || '点击设置昵称'

    var pHtml = ''
    myProducts.forEach(function(p){
      pHtml += '<div class="my-item">'
      var imgs = p.images; if (typeof imgs === 'string') imgs = JSON.parse(imgs || '[]')
      if (imgs && imgs.length) pHtml += '<img class="my-item-img" src="' + imgs[0] + '">'
      else pHtml += '<div class="my-item-img"></div>'
      pHtml += '<div class="my-item-info"><div class="my-item-title">' + esc(p.title) + '</div>'
      pHtml += '<div class="my-item-status"><span class="status-' + p.status + '">'
      pHtml += (p.status === 'active' ? '展示中' : p.status === 'sold' ? '已出手' : '已下架')
      pHtml += '</span></div></div>'
      if (p.status === 'active') pHtml += '<span class="my-item-del" onclick="removeProduct(' + p.id + ')">下架</span>'
      pHtml += '</div>'
    })

    var aHtml = ''
    myArticles.forEach(function(a){
      aHtml += '<div class="my-article-item" onclick="viewArticle(' + a.id + ')">'
      aHtml += '<span class="my-article-cat">' + a.category + '</span>'
      aHtml += '<span class="my-article-title">' + esc(a.title) + '</span>'
      aHtml += '<span class="my-item-del" onclick="event.stopPropagation();removeArticle(' + a.id + ')">删除</span></div>'
    })

    document.getElementById('my-products').innerHTML = pHtml ? '<div class="section-label">物品</div>' + pHtml : ''
    document.getElementById('my-articles').innerHTML = aHtml ? '<div class="section-label">文案</div>' + aHtml : ''
    document.getElementById('my-empty').style.display = (!myProducts.length && !myArticles.length) ? '' : 'none'
    document.getElementById('stat-all').innerText = myProducts.length + myArticles.length
  })
}

function removeProduct(id) {
  if (!confirm('确认下架？')) return
  sb.from('products').update({ status: 'removed' }).eq('id', id).eq('author_id', uid()).then(function(){
    loadMy()
  })
}

function removeArticle(id) {
  if (!confirm('确认删除？')) return
  sb.from('articles').delete().eq('id', id).eq('author_id', uid()).then(function(){
    loadMy()
  })
}

function switchMyTab(tab) {
  document.querySelectorAll('.my-tab').forEach(function(el){
    el.classList.toggle('active', el.dataset.mytab === tab)
  })
}

// ========== 用户设置 ==========
function setNickname() {
  var name = prompt('请输入昵称：'); if (!name) return
  var user = JSON.parse(localStorage.getItem('ak_user') || '{}'); user.nickName = name
  localStorage.setItem('ak_user', JSON.stringify(user)); loadMy()
}

function setAvatar() {
  var input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'
  input.style.display = 'none'; document.body.appendChild(input)
  input.addEventListener('change', function() {
    if (!this.files || !this.files[0]) return
    var reader = new FileReader()
    reader.onload = function(e) {
      var user = JSON.parse(localStorage.getItem('ak_user') || '{}'); user.avatarUrl = e.target.result
      localStorage.setItem('ak_user', JSON.stringify(user)); loadMy()
      document.body.removeChild(input)
    }
    reader.readAsDataURL(this.files[0])
  })
  // 延迟触发，避免移动端拦截
  setTimeout(function(){ input.click() }, 100)
}

// ========== 狐狸 ==========
var fox = { x: 280, y: 400 }
var foxDragging = false, foxDragged = false, foxMouseOffX, foxMouseOffY

function initFox() {
  var el = document.getElementById('float-fox')
  var bubble = document.getElementById('fox-bubble')

  el.addEventListener('mousedown', function(e){ foxDragging = true; foxDragged = false; foxMouseOffX = e.offsetX; foxMouseOffY = e.offsetY })
  el.addEventListener('touchstart', function(e){
    foxDragging = true; foxDragged = false; var t = e.touches[0]; foxMouseOffX = t.clientX - fox.x; foxMouseOffY = t.clientY - fox.y
  }, {passive:false})

  document.addEventListener('mousemove', function(e){ if(foxDragging){ foxDragged = true; e.preventDefault(); moveFox(e.clientX, e.clientY) } })
  document.addEventListener('touchmove', function(e){ if(foxDragging){ foxDragged = true; e.preventDefault(); moveFox(e.touches[0].clientX, e.touches[0].clientY) } }, {passive:false})

  document.addEventListener('mouseup', function(){ foxDragging = false })
  document.addEventListener('touchend', function(){ foxDragging = false })

  el.addEventListener('click', function(e){
    if(foxDragged) { foxDragged = false; return }
    var flash = 0; var timer = setInterval(function(){
      el.style.opacity = flash++ % 2 ? '0' : '0.85'
      if(flash > 6){ clearInterval(timer); el.style.opacity = '0.85'; randomNavigate() }
    }, 100)
  })

  function showFoxBubble() {
    var msgs = ['点我一下试试','发现惊喜好物','随便看看呗','今天有什么新发现','听说魏老师只是刀子嘴豆腐心','这里的大家都是匿名，可以畅所欲言啦！']
    bubble.innerText = msgs[Math.floor(Math.random() * msgs.length)]
    bubble.style.display = ''
    if (fox.y < 80) { bubble.className = 'fox-bubble below'; bubble.style.top = (fox.y + 80) + 'px' }
    else { bubble.className = 'fox-bubble'; bubble.style.top = (fox.y - bubble.offsetHeight - 8) + 'px' }
    bubble.style.left = (fox.x + 10) + 'px'
    setTimeout(function(){ bubble.style.display = 'none' }, 2500)
  }

  setInterval(showFoxBubble, 10000)
  setTimeout(showFoxBubble, 3000)
  updateFoxPos()
}

function moveFox(cx, cy) {
  fox.x = Math.max(0, Math.min(cx - foxMouseOffX, window.innerWidth - 80))
  fox.y = Math.max(0, Math.min(cy - foxMouseOffY, window.innerHeight - 120))
  updateFoxPos()
}

function updateFoxPos() {
  var el = document.getElementById('float-fox')
  el.style.left = fox.x + 'px'; el.style.top = fox.y + 'px'
}

function randomNavigate() {
  Promise.all([
    sb.from('products').select('id').eq('status', 'active').limit(50),
    sb.from('articles').select('id').limit(50)
  ]).then(function(results){
    var items = []
    ;(results[0].data||[]).forEach(function(p){ items.push({type:'product',id:p.id}) })
    ;(results[1].data||[]).forEach(function(a){ items.push({type:'article',id:a.id}) })
    if(!items.length) return
    var item = items[Math.floor(Math.random()*items.length)]
    if(item.type==='product') viewProduct(item.id)
    else viewArticle(item.id)
  })
}

// ========== 工具 ==========
function esc(s) { if(!s)return''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function fmt(s) { if(!s)return''; var d=new Date(s), n=new Date(), diff=n-d; if(diff<6e4)return'刚刚'; if(diff<36e5)return Math.floor(diff/6e4)+'分钟前'; if(diff<864e5)return Math.floor(diff/36e5)+'小时前'; if(diff<2592e6)return Math.floor(diff/864e5)+'天前'; return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate() }

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', function(){
  renderCatBar()
  renderArticleCatBar()
  renderProductImages()
  switchMode('products')
  showPage('home')
  initFox()
  document.getElementById('contact-modal').addEventListener('click', function(e){
    if(e.target === this) this.style.display = 'none'
  })
})
