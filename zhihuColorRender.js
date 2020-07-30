// ==UserScript==
// @name         zhihuColorRender
// @namespace    http://io.github.fadeoc/
// @version      0.1
// @description  color, color, how cute!~
// @author       unwilling to leave name Mr. Fadeoc
// @match        http*://www.zhihu.com/*
// @include      http*://www.zhihu.com/*
// ==/UserScript==


/**
 * @method mordenHappyProgrammerAlias
 * @description just a shell, lol
 * @since 0.1
 */
(function () {
  //dear sir, you could custom color here
  unsafeWindow.colorMap = {
    default: '#e8c15f',
    answer: '',
    ads: 'grey',
    article: '',
    post: '',
    relevant: 'green'
  }
  //and this is check interval, by seconds, change this value could tune the speed of checking, thus save your browser performance
  unsafeWindow.timefrag = 1

  //orcs, go to work!
  console.log("more work?")
  workwork()
})()


/**
* @method mordenHappyProgrammerAlias
* @description just a shell, lol
* @since 0.1
* @todo scrolling detecting against setTimeout
*/
function workwork() {
  //get all feed items collection
  let items = document.getElementsByClassName('TopstoryItem')
  //maybe user is on search-result page?
  items = document.getElementsByClassName('SearchResult-Card')
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
* @since 0.1
*/
function consumeSearchContainer(item) {
  const relevantBlocks = item.getElementsByClassName('RelevantQuery')
  if (!isVoid(relevantBlocks)) {
    setColorMain(item, 'relavent')
  }
  else {
    const data = item.getAttribute('data-za-extra-module')
    const json = JSON.parse(data)
    contentType = json.card.content.type
    setColorMain(item, contentType)
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
*/
function consumeNormalContainer(item, normalContainer) {
  let data = normalContainer.getAttribute('data-za-extra-module')
  let contentType = ""
  if (data == null) {
    const weirdFeedAnswerContainer = normalContainer.getElementsByClassName("ContentItem")[0]
    data = weirdFeedAnswerContainer.getAttribute("data-zop")
    const json = JSON.parse(data)
    contentType = json.type
  }
  else {
    const json = JSON.parse(data)
    contentType = json.card.content.type
  }

  if (unsafeWindow.colorMap.hasOwnProperty(contentType.toLowerCase())) {
    setColorMain(item, contentType)
    setColorActionbar(item, contentType)
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
  item.style.backgroundColor = unsafeWindow.colorMap[type]
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
* @method isVoid
* @description check whether an object is void
* @param {object} object
* @returns {Boolean}
* @since 0.1
*/
function isVoid(object) {
  return object === null || typeof object === 'undefined' || object === '' || object.length === 0
}