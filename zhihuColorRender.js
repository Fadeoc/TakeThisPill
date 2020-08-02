// ==UserScript==
// @name         zhihuColorRender
// @namespace    http://io.github.fadeoc/
// @version      0.3
// @description  color, color, how cute!~
// @author       unwilling to leave name Mr. Fadeoc
// @match        http*://www.zhihu.com/*
// @include      http*://www.zhihu.com/*
// ==/UserScript==


/**
 * @method mordenHappyProgrammerAlias
 * @description just a shell, lol
 * @since 0.1
 * @version 0.3
 */
(function () {
  //dear sir, you could custom color here
  unsafeWindow.colorMap = {
    default: '#9aaf73',
    answer: '',
    ads: 'grey',
    article: '#e8c15f',
    post: '#e8c15f',
    zvideo: '#af739a',
    relevant: 'green'
  }
  //accessbility
  unsafeWindow.descMap = {
    default: '无法识别这个内容的分类',
    answer: '这是一个回答',
    ads: '这是一支广告',
    article: '这是一篇文章',
    post: '这是一篇发布',
    zvideo: '这是一部视频',
    relevant: '这是您搜索结果的相关内容推荐链接区域'
  }
  //and this is check interval, by seconds, change this value could tune the speed of checking, thus save your browser performance
  unsafeWindow.timefrag = 1

  //orcs, go to work!
  console.log('more work?')
  workwork()
})()


/**
* @method mordenHappyProgrammerAlias
* @description just a shell, lol
* @since 0.1
* @version 0.2
* @todo scrolling detecting against setTimeout
*/
function workwork() {
  //get all feed items collection
  let items = document.getElementsByClassName('TopstoryItem')
  //maybe user is on search-result page?
  if (isVoid(items)) {
    items = document.getElementsByClassName('SearchResult-Card')
  }
  //consume each item
  Array.prototype.forEach.call(items, item => consumer(item))

  //future update would be nice with scrolling detecting
  setTimeout(workwork, unsafeWindow.timefrag * 1000)
}

/**
* @method consumer
* @description set color via item self-defined data attrs
* @param {HTML Element} item
* @since 0.1
* @version 0.2
*/
function consumer(item) {

  const feed = item.getElementsByClassName('Feed')
  if (feed.length === 0) {
    const feed = item.getElementsByClassName('Pc-feedAd-container')
    if (feed.length === 0) {
      if (item.classList.contains('SearchResult-Card')) {
        consumeSearchContainer(item)
      }
      else {
        console.log('Damn! found a leak, things change, roll with the punches')
        return
      }
    }
    else {
      consumeAdsContainer(item)
    }
  }
  else {
    consumeNormalContainer(item, feed[0])
  }

}

/**
* @method consumeSearchContainer
* @description consume search-result block
* @param {HTML Element} item
* @since 0.2
* @version 0.2
*/
function consumeSearchContainer(item) {
  const relevantBlocks = item.getElementsByClassName('RelevantQuery')
  if (!isVoid(relevantBlocks)) {
    setColorMain(item, 'relavent')
  }
  else if (!isVoid(item.getAttribute('data-za-extra-module'))) {
    const data = item.getAttribute('data-za-extra-module')
    const json = JSON.parse(data)
    contentType = json.card.content.type
    setColorMain(item, contentType.toLowerCase())
    setColorActionbar(item, contentType.toLowerCase())
  }
}

/**
* @method consumeAdsContainer
* @description consume ads block, it may already blocked by adblock, adblock plus, ublock or other plugins, again, this script doesn't block ads
* @param {HTML Element} item
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
* @param {HTML Element} item
* @param {HTML Element} normalContainer
* @since 0.1
* @version 0.3
*/
function consumeNormalContainer(item, normalContainer) {
  let data = normalContainer.getAttribute('data-za-extra-module')
  let contentType = ''
  if (data == null) {
    const messFeedContainer = normalContainer.getElementsByClassName('ContentItem')[0]
    if (!isVoid(messFeedContainer) && messFeedContainer.classList.contains('ZVideoItem')) {
      contentType = 'zvideo'
    }
    else {
      data = messFeedContainer.getAttribute('data-zop')
      const json = JSON.parse(data)
      contentType = json.type
    }
  }
  else {
    const json = JSON.parse(data)
    contentType = json.card.content.type
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
* @param {HTML Element} item, which to be colored
* @since 0.1
*/
function setColorMain(item, type) {
  const color = unsafeWindow.colorMap[type]
  item.style.backgroundColor = color
  //test accessability
  setAccessability(item, type)
}


/**
* @description set color of Action Bar
* @param {HTML Element} item, ancestor of the action bar which to be colored
* @since 0.1
*/
function setColorActionbar(item, type) {
  const actionBar = item.getElementsByClassName('ContentItem-actions')
  if (isVoid(actionBar)) {
    console.log('Damn! found a leak, things change, roll with the punches')
    return
  }
  item.style.backgroundColor = unsafeWindow.colorMap[type]
  actionBar[0].style.backgroundColor = unsafeWindow.colorMap[type]
  const innerActionBar = actionBar[0].getElementsByClassName('ContentItem-action')
  if (innerActionBar.length > 0) {
    innerActionBar[0].style.backgroundColor = unsafeWindow.colorMap[type]
  }
  
}

/**
* @method setAccessability
* @description set accessability
* @param {HTML Element} item
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
  accessTypeContainer.style.width = 0
  accessTypeContainer.style.height = 0
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
* @method isVoid
* @description check whether an object is void
* @param {object} object
* @returns {Boolean}
* @since 0.1
*/
function isVoid(object) {
  return object === null || typeof object === 'undefined' || object === '' || object.length === 0
}