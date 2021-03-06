// ==UserScript==
// @name         zhihuColorRenderPro
// @namespace    http://io.github.fadeoc/
// @version      0.8
// @description  really? pro?
// @author       unwilling to leave name Mr. Fadeoc
// @match        http*://www.zhihu.com/*
// @include      http*://www.zhihu.com/*
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==
/**
 * @method modernHappyProgrammerAlias
 * @description just a shell, lol
 * @since 0.1
 * @version 0.5
 */
(function () {
  //dear sir, you could custom color here
  unsafeWindow.colorMap = {
    default: '#9aaf73',
    answer: '',
    ads: 'grey',
    article: '#e8c15f',
    magzine: '#e8c15f',
    post: '#e8c15f',
    zvideo: '#af739a',
    relevant: 'green',
    blocklist: '#000000',
    btnimg: 'green',
    btnimghover: '#9aaf73',
    btngif: '#af739a',
    btngifhover: '#cc7c8a',
    btntext: '#f8f8f8',
    btnSaleLinkFolderBg: '#5e83bf',
    btnSaleLinkFolderBgHover: '#89b2f5',
    btnSaleLinkFolderText: '#f8f8f8',

  }
  //accessbility
  unsafeWindow.descMap = {
    default: '无法识别这个内容的分类',
    answer: '这是一个回答',
    ads: '这是一支广告',
    article: '这是一篇文章',
    magzine: '这是一篇电子杂志',
    post: '这是一篇发布',
    zvideo: '这是一部视频',
    relevant: '这是您搜索结果的相关内容推荐链接区域'
  }
  unsafeWindow.proMap = {
    colorRender: true,
    imageRender: true,
    accessability: false,
    blocklist: []
  }
  //and this is check interval, by seconds, change this value could tune the speed of checking, thus save your browser performance
  unsafeWindow.timefrag = 1

  //orcs, go to work!
  console.log('more work?')
  setInput()
  workwork()

})()


/**
* @method mordenHappyProgrammerAlias
* @description just a shell, lol
* @since 0.1
* @version 0.8
* @todo scrolling detecting against setTimeout
*/
function workwork() {

  //get all feed items collection
  let items = document.getElementsByClassName('TopstoryItem')
  //maybe user is on search-result page?
  if (isVoid(items)) {
    items = document.getElementsByClassName('SearchResult-Card')
  }
  //or single question page?
  if (isVoid(items) && unsafeWindow.proMap.imageRender) {
    items = document.getElementsByClassName('AnswerItem')
  }

  if (!isVoid(items)) {
    //consume each item
    Array.prototype.forEach.call(items, item => consumer(item))
  }

  items = document.getElementsByClassName('ArticleItem')
  if (!isVoid(items)) {
    //consume each item
    Array.prototype.forEach.call(items, item => consumer(item))
  }

  //collapse sale-cards
  const salecards = document.getElementsByClassName('MCNLinkCard') || []
  if (salecards.length > 0) {
    Array.prototype.forEach.call(salecards, card => foldElement(
      card,
      unsafeWindow.colorMap.btnSaleLinkFolderText,
      unsafeWindow.colorMap.btnSaleLinkFolderBg,
      unsafeWindow.colorMap.btnSaleLinkFolderBgHover
    ))
  }

  //future update would be nice with scrolling detecting
  setTimeout(workwork, unsafeWindow.timefrag * 1000)
}

function setButtonStyle(btn, label, onclick) {
  btn.style.width = "150px"
  btn.style.height = "30px"
  btn.style.padding = "2px"
  btn.style.cursor = "pointer"
  btn.textContent = label
  btn.addEventListener("click", onclick, false)
}

function setInput() {
  var btn = document.body.appendChild(document.createElement("button"))
  btn.style.position = "fixed"
  btn.style.top = 0
  btn.style.left = "10%"
  btn.style.marginLeft = "-100px"
  btn.style.zIndex = 10006
  btn.style.backgroundColor = "#556B2F"
  btn.style.color = "#FFFFFF"
  btn.style.border = "none"

  // Edit URL list
  setButtonStyle(btn, "知乎彩色渲染器(Pro)", function () {
    var con = document.body.appendChild(document.createElement("div"))
    con.style.position = "fixed"
    con.style.top = 0
    con.style.right = 0
    con.style.zIndex = 1000
    con.style.padding = "1px 2px"
    con.style.textAlign = "center"

    function append(name) {
      return con.appendChild(document.createElement(name))
    }

    append("br")

    var ta = append("textarea")
    con.getElementsByTagName("textarea")[0].setAttribute("placeholder", "屏蔽用户名（染成黑色），每个用户名换一行")
    ta.cols = 50
    ta.rows = 25
    ta.value = GM_getValue("urls") || ""

    append("br")

    setButtonStyle(append("button"), "Cancel", function () {
      document.body.removeChild(con)
    })

    var spacer = append("span")
    spacer.textContent = " "
    spacer.style.padding = "0 50px"

    setButtonStyle(append("button"), "Save", function () {
      GM_setValue("urls", ta.value.trim())
      location.reload()
    })
  })
}

function getInput() {
  var urls = GM_getValue("urls")
  if (!urls) {
    return null
  }
  else {
    return urls.replace(/\n/g, ",").split(",")
  }
}

/**
* @method consumer
* @description set color via item self-defined data attrs
* @param {HTMLElement} item
* @since 0.1
* @version 0.4
*/
function consumer(item) {

  if (unsafeWindow.proMap.imageRender) {
    imageReArrangeFactory(item)
  }

  const feed = item.getElementsByClassName('Feed')

  if (feed.length === 0) {
    const feed = item.getElementsByClassName('Pc-feedAd-container')
    if (feed.length === 0) {
      if (item.classList.contains('SearchResult-Card')) {
        consumeSearchContainer(item)
      }
      else if (item.classList.contains('ArticleItem')) {
        setColorMain(item, 'article')
        setColorActionbar(item, 'article')
      }
      else {
        console.log('Damn! found a leak, things change, roll with the punches')
      }
    }
    else {
      consumeAdsContainer(item)
    }
  }
  else {
    consumeNormalContainer(item, feed[0])
  }

  consumeBlocklistContainer(item)

}

/**
* @method consumeSearchContainer
* @description consume search-result block
* @param {HTMLElement} item
* @since 0.2
* @version 0.2
*/
function consumeSearchContainer(item) {
  const relevantBlocks = item.getElementsByClassName('RelevantQuery')
  if (!isVoid(relevantBlocks)) {
    setColorMain(item, 'relavent')
  }
  else if (!isVoid(item.getAttribute('data-za-extra-module'))) {
    const magzineList = item.getElementsByClassName('KfeCollection-PcCollegeCard-wrapper') || []
    if (magzineList.length !== 0) {
      setColorMain(item, 'magzine')
      setColorActionbar(item, 'magzine')
    }
    else {
      const data = item.getAttribute('data-za-extra-module')
      const json = JSON.parse(data)
      const contentType = json["card"].content.type
      setColorMain(item, contentType.toLowerCase())
      setColorActionbar(item, contentType.toLowerCase())
      const authorElement = item.getElementsByClassName('AuthorInfo')
      if (!isVoid(authorElement)) {
        const authorNameMeta = authorElement[0].getElementsByTagName('meta')[0]
        const finalBlockList = getBlockList()
        if (!isVoid(authorNameMeta) && finalBlockList.indexOf(authorNameMeta.getAttribute('content')) !== -1) {
          setColorMain(item, 'blocklist')
          setColorActionbar(item, 'blocklist')
        }
      }
    }
  }
}

/**
* @method consumeAnswerContainer
* @description consume questionanswer-content block
* @param {HTMLElement} item
* @since 0.7
* @version 0.7
*/
function consumeBlocklistContainer(item) {
  let data = null
  if (!isVoid(item.getAttribute('data-zop'))) {
    data = item.getAttribute('data-zop')
  }
  else if (!isVoid(item.getElementsByClassName('ContentItem')) && !isVoid(item.getElementsByClassName('ContentItem')[0].getAttribute('data-zop'))){
    data = item.getElementsByClassName('ContentItem')[0].getAttribute('data-zop')
  }
  if (isVoid(data)) {
    return
  }

  const json = JSON.parse(data)
  const finalBlockList = getBlockList()
  if (finalBlockList.indexOf(json["authorName"]) !== -1) {
    const introCard = item.getElementsByClassName('KfeCollection-IntroCard')[0]
    if (!isVoid(introCard)) {
      setColorMain(introCard, 'blocklist')
    }
    setColorMain(item, 'blocklist')
    setColorActionbar(item, 'blocklist')
    const rightButton = item.getElementsByClassName('ContentItem-rightButton')[0]
    const expandBtn = item.getElementsByClassName('ContentItem-expandButton')[0]
    if (!isVoid(rightButton) && isVoid(expandBtn)) {
      rightButton.click()
    }
  }
}

function getBlockList() {
  let customBlockList = []
  try {
    customBlockList = getInput() == null ? [] : getInput()
  } catch (e) {
    console.log("自定义屏蔽列表格式错误，已启用默认列表")
  }
  return customBlockList.length === 0 ? unsafeWindow.proMap.blocklist : customBlockList
}

/**
* @method consumeAdsContainer
* @description consume ads block, it may already blocked by adblock, adblock plus, ublock or other plugins, again, this script doesn't block ads
* @param {HTMLElement} item
* @since 0.1
*/
function consumeAdsContainer(item) {
  if (!isVoid(unsafeWindow.colorMap.ads)) {
    setColorMain(item, 'ads')
  }
}

/**
* @method consumeNormalContainer
* @description consume normal block
* @param {HTMLElement} item
* @param {Element} normalContainer
* @since 0.1
* @version 0.3
*/
function consumeNormalContainer(item, normalContainer) {
  let data = normalContainer.getAttribute('data-za-extra-module')
  let contentType
  if (data == null) {
    const messFeedContainer = normalContainer.getElementsByClassName('ContentItem')[0]
    if (!isVoid(messFeedContainer) && messFeedContainer.classList.contains('ZVideoItem')) {
      contentType = 'zvideo'
    }
    else if (!isVoid(messFeedContainer) && messFeedContainer.classList.contains('ArticleItem')) {
      contentType = 'article'
    }
    else {
      data = messFeedContainer.getAttribute('data-zop')
      const json = JSON.parse(data)
      contentType = json.type
    }
  }
  else {
    const json = JSON.parse(data)
    contentType = json["card"].content.type
  }

  if (unsafeWindow.colorMap.hasOwnProperty(contentType.toLowerCase())) {
    setColorMain(item, contentType.toLowerCase())
    setColorActionbar(item, contentType.toLowerCase())
  }
  else {
    setColorMain(item, 'default')
    setColorActionbar(item, 'default')
  }
}


/**
 * @description set color of Main Block
 * @param {HTMLElement} item, which to be colored
 * @param type
 * @since 0.1
 * @version 0.3
 */
function setColorMain(item, type) {

  item.style.backgroundColor = unsafeWindow.colorMap[type]
  if (unsafeWindow.colorMap[type] === 'hide') {
    item.style.display = "none";
  }
  //test accessability
  if (unsafeWindow.proMap.accessability) {
    setAccessability(item, type)
  }

  if (type === 'blocklist') {
    item.style.color = '#000000'
  }
}

/**
 * @description set color of Action Bar
 * @param {HTMLElement} item, ancestor of the action bar which to be colored
 * @param type
 * @since 0.1
 */
function setColorActionbar(item, type) {
  const actionBar = item.getElementsByClassName('ContentItem-actions')
  if (isVoid(actionBar)) {
    console.log('Damn! found a leak, things change, roll with the punches')
    return
  }
  item.style.backgroundColor = unsafeWindow.colorMap[type]
  if (unsafeWindow.colorMap[type] === 'hide') {
    item.style.display = "none";
  }
  actionBar[0].style.backgroundColor = unsafeWindow.colorMap[type]
  const innerActionBars = actionBar[0].getElementsByClassName('ContentItem-action')
  if (innerActionBars.length > 0) {
    Array.prototype.forEach.call(innerActionBars, innerActionBar => {
      innerActionBar.style.backgroundColor = unsafeWindow.colorMap[type]
      if (unsafeWindow.colorMap[type] === 'hide') {
        innerActionBar.style.display = "none";
      }
      const btns = innerActionBar.getElementsByTagName('button')
      if (type === 'blocklist') {
        item.style.color = unsafeWindow.colorMap.blocklist
        innerActionBar.style.color = unsafeWindow.colorMap.blocklist
        Array.prototype.forEach.call(btns, btn => btn.style.color = unsafeWindow.colorMap.blocklist)
      }
    })
  }
}

/**
 * @method setAccessability
 * @description set accessability
 * @param {HTMLElement} item
 * @param type
 * @since 0.3
 * @version 0.3
 */
function setAccessability(item, type) {
  if (!isVoid(item.getElementsByClassName('zcrender-golden-retriever')[0])) {
    return
  }

  type = type.toLowerCase()

  const accessTypeContainer = document.createElement('div')

  accessTypeContainer.setAttribute('aria-labelledby', 'zcrender-golden-retriever')
  accessTypeContainer.classList.add('zcrender-golden-retriever')
  accessTypeContainer.style.width = "0"
  accessTypeContainer.style.height = "0"
  accessTypeContainer.style.position = 'absolute'
  accessTypeContainer.style.top = '-10000px'

  if (!isVoid(unsafeWindow.descMap[type])) {
    accessTypeContainer.textContent = unsafeWindow.descMap[type]
  }

  const parentContainer = item.getElementsByClassName('ContentItem-title')[0]
  if (!isVoid(parentContainer)) {
    parentContainer.insertAdjacentElement('afterbegin', accessTypeContainer)
  }

}


/**
* @method imageReArrangeFactory
* @description re-arrange image factory
* @param {HTMLElement} item
* @since 0.4
* @version 0.5
*/
function imageReArrangeFactory(item) {

  const allImageContainer = item.getElementsByClassName('RichContent-inner')[0]
  if (isVoid(allImageContainer)) {
    return
  }

  const allImages = allImageContainer.getElementsByTagName('img')
  const allGifs = allImageContainer.getElementsByClassName('ztext-gif')
  if (!isVoid(allImages)) {
    Array.prototype.forEach.call(allImages, img => reArrange(img))
  }
  if (!isVoid(allGifs)) {
    Array.prototype.forEach.call(allGifs, img => reArrange(img))
  }

}

/**
 * @method foldElement
 * @description fold HTML element. The function simply fold the element without do any thing but add a restore/fold btn
 * @param {HTMLImageElement} _element
 * @param {String<HexColor>} btnTextColor
 * @param {String<HexColor>} btnBgColor
 * @param {String<HexColor>} btnBgHoverColor
 * @since 0.8
 * @version 0.8
 */
function foldElement(_element, btnTextColor, btnBgColor, btnBgHoverColor) {

  if (!isVoid(_element.getAttribute('zcrender-pan'))) {
    return
  }

  const oriHeight = _element.style.height
  const oriMinHeight = _element.style.minHeight
  const newHeight = '1px'
  const newMinHeight = '1px'

  _element.style.height = newHeight
  _element.style.minHeight = newMinHeight
  _element.setAttribute('zcrender-pan', 'true')

  const restoreBtn = document.createElement('button')
  restoreBtn.style.outline = 'none'
  const restoreText = '恢复商品连接'
  const panText = '拍扁商品连接'
  restoreBtn.textContent = restoreText
  restoreBtn.style.backgroundColor = btnBgColor
  restoreBtn.style.boxSizing = 'border-box'
  restoreBtn.style.padding = '3px 6px'
  restoreBtn.style.color = btnTextColor
  restoreBtn.style.fontSize = '12px'
  restoreBtn.style.zIndex = '9999'
  restoreBtn.onmouseenter = function () {
    restoreBtn.style.backgroundColor = btnBgHoverColor
  }
  restoreBtn.onmouseleave = function () {
    restoreBtn.style.backgroundColor = btnBgColor
  }


  restoreBtn.onclick = function () {
    const newPanValue = _element.getAttribute('zcrender-pan') === 'true' ? 'false' : 'true'
    const newPanText = _element.getAttribute('zcrender-pan') === 'false' ? restoreText : panText
    const newPanHeight = _element.getAttribute('zcrender-pan') === 'false' ? newHeight : oriHeight
    const newPanMinHeight = _element.getAttribute('zcrender-pan') === 'false' ? newMinHeight : oriMinHeight
    _element.setAttribute('zcrender-pan', newPanValue)
    _element.style.height = newPanHeight
    _element.style.minHeight = newPanMinHeight
    restoreBtn.textContent = newPanText
  }
  _element.parentElement.style.textAlign = 'center'
  _element.parentElement.insertBefore(restoreBtn, _element)

}

/**
* @method reArrange
* @description re-arrange image
* @param {HTMLImageElement} img
* @since 0.4
* @version 0.5
*/
function reArrange(img) {

  let parentNode = img.parentElement

  const isGif = parentNode.classList.contains('GifPlayer')

  if (parentNode.tagName.toLowerCase() !== 'figure' && !isGif) {
    return
  }

  if (!isVoid(img.getAttribute('zcrender-pan'))) {
    return
  }

  if (isGif) {
    parentNode = parentNode.parentElement.parentElement
  }

  parentNode.style.textAlign = 'center'

  const oriHeight = img.style.height
  const newHeight = '1px'

  img.style.height = newHeight
  img.setAttribute('zcrender-pan', 'true')

  const restoreBtn = document.createElement('button')
  restoreBtn.style.outline = 'none'
  const restoreText = isGif ? '恢复Gif' : '恢复图片'
  const panText = isGif ? '拍扁Gif' : '拍扁图片'
  restoreBtn.textContent = restoreText
  restoreBtn.style.backgroundColor = isGif ? unsafeWindow.colorMap.btngif : unsafeWindow.colorMap.btnimg
  restoreBtn.style.boxSizing = 'border-box'
  restoreBtn.style.padding = '3px 6px'
  restoreBtn.style.color = unsafeWindow.colorMap.btntext
  restoreBtn.style.fontSize = '12px'
  restoreBtn.style.zIndex = '9999'
  restoreBtn.onmouseenter = function () {
    restoreBtn.style.backgroundColor = isGif ? unsafeWindow.colorMap.btngifhover : unsafeWindow.colorMap.btnimghover
  }
  restoreBtn.onmouseleave = function () {
    restoreBtn.style.backgroundColor = isGif ? unsafeWindow.colorMap.btngif : unsafeWindow.colorMap.btnimg
  }


  restoreBtn.onclick = function () {
    const newPanValue = img.getAttribute('zcrender-pan') === 'true' ? 'false' : 'true'
    const newPanText = img.getAttribute('zcrender-pan') === 'false' ? restoreText : panText
    const newPanHeight = img.getAttribute('zcrender-pan') === 'false' ? newHeight : oriHeight
    img.setAttribute('zcrender-pan', newPanValue)
    img.style.height = newPanHeight
    restoreBtn.textContent = newPanText
  }

  // parentNode.insertBefore(restoreBtn, img)
  parentNode.prepend(restoreBtn)

}


/**
* @method isVoid
* @description check whether an object is void
* @param {object} object
* @returns {Boolean}
* @since 0.1
*/
function isVoid(object) {
  return object === null || typeof object === 'undefined' || object === '' || object.length === 0
}