// ==UserScript==
// @name        Google Search URL Filter
// @namespace   https://fadeoc.github.io
// @description The search results filter/blocker for Google Search
// @homepage    https://github.com/Fadeoc/TakeThisPill/blob/master/searchFilter.js
// baseon       http://0-oo.net/log/category/greasemonkey/google-instant-url-filter/
// @version     0.4.1
// @license     MIT
// @include     http*://www.google.tld/search*
// @include     http*://www.google.tld/webhp*
// @include     http*://www.google.tld/#*
// @include     http*://www.google.tld/
// @include     http*://www.baidu.tld/
// @include     http*://www.baidu.tld/s*
// @include     http*://cn.bing.tld/search*
// @include     http*://com.bing.tld/search*
// @include     http*://yandex.tld/search*
// @grant GM_getValue
// @grant GM_setValue
// ==/UserScript==

(function () {
	var SCRIPT_NAME = "Search URL Filter"

	function setButtonStyle(btn, label, onclick) {
		btn.style.width = "100px"
		btn.style.height = "30px"
		btn.style.padding = "2px"
		btn.style.cursor = "pointer"
		btn.textContent = label
		btn.addEventListener("click", onclick, false)
	}

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
	setButtonStyle(btn, "嗨呀搜索过滤", function () {
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

		append("b").textContent = "[" + SCRIPT_NAME + "] URL list"
		append("br")

		var ta = append("textarea")
		con.getElementsByTagName("textarea")[0].setAttribute("placeholder", "支持Google, Bing, Baidu, Yandex，每个网址换一行， 百度搜索加密了网站地址，请填写过滤的描述名，描述名在每一个搜索块的左下角，如“csdn技术博客”等，区分大小写")
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

	var urls = GM_getValue("urls")
	console.log("urls" + urls)

	if (!urls) {
		return
	}

	urls = urls.replace(/([.?])/g, "\\$1").replace(/\*/g, ".*").replace(/\n/g, "|")

	try {
		var regex = new RegExp(urls)
	} catch (e) {
		alert(SCRIPT_NAME + ": Invalid URLs")
		return
	}


	const intervalGoogle = function () {	// Watching the result page
		console.log("anti google")
		const rso = document.getElementById("rso")
		var results = rso.getElementsByClassName("g")
		for (var i = 0; i < results.length; i++) {
			var result = results[i]
			var link = result.getElementsByTagName("a")[0]

			if (link && link.href.match(regex)) {
				result.style.display = "none"
			}
		}
	}

	const intervalBing = function () {	// Watching the result page
		console.log("anti bing")
		const rso = document.getElementById("b_content")
		var results = rso.getElementsByClassName("b_algo")
		for (var i = 0; i < results.length; i++) {
			var result = results[i]
			var link = result.getElementsByTagName("cite")[0]

			if (link && link.innerText.match(regex)) {
				result.style.display = "none"
			}
		}
	}

	const intervalBaidu = function () {	// Watching the result page
		console.log("anti baidu")
		const rso = document.getElementById("wrapper_wrapper")
		var results = rso.getElementsByClassName("c-container")

		for (var i = 0; i < results.length; i++) {
			var result = results[i]
			var exactLocationContainer = result.getElementsByClassName("f13")[0]
			if (exactLocationContainer === null || typeof exactLocationContainer === "undefined") {
				continue
			}
			const linkATag = exactLocationContainer.getElementsByTagName("a")[0]
			if (typeof linkATag === "undefined") {
				continue
			}
			const link = linkATag.innerText

			const urlsAlias = urls.slice()
			urlsAlias.split("\|").forEach(element => {
				if (link.includes(element)) {
					result.style.display = "none"
				}
			})
		}
	}

	const intervalYandex = function () {	// Watching the result page
		console.log("anti yandex")
		const rso = document.getElementById("search-result")
		var results = rso.getElementsByClassName("serp-item")

		for (var i = 0; i < results.length; i++) {
			var result = results[i]
			var link = result.getElementsByTagName("a")[0]

			if (link && link.href.match(regex)) {
				result.style.display = "none"
			}
		}
	}


	const hideAds = function () {
		// Hide ads
		var ads = document.getElementsByClassName("ads-ad")

		for (var j = 0; j < ads.length; j++) {
			ads[j].style.display = "none"
		}
	}


	const isGoogle = document.getElementById("rso") === null ? false : true
	const isBing = document.getElementById("b_header") === null ? false : true
	const isBaidu = document.getElementById("wrapper_wrapper") === null ? false : true
	const isYandex = document.getElementById("search-result") === null ? false : true

	const priorArr = [isGoogle, isBing, isBaidu, isYandex]
	const priorStrArr = ["Google", "Bing", "Baidu", "Yandex"]

	const currentEngineShouldArr = []

	priorArr.forEach((v, i) => {
		if (v) {
			currentEngineShouldArr.push(priorStrArr[i])
		}
	})

	if (currentEngineShouldArr.length === 0) {
		return
	}

	const currentEngineShouldBeStr = currentEngineShouldArr[0]
	console.log("侦测到当前的搜索引擎" + currentEngineShouldBeStr)


	let filtermark = false


	let brokerId

	const brokerObj = {
		intervalGoogle,
		intervalBing,
		intervalBaidu,
		intervalYandex
	}


	const toBroker = function () {
		if (filtermark) {
			return
		}
		brokerObj["interval" + currentEngineShouldBeStr]()
		hideAds()
		filtermark = true
	}

	brokerId = setInterval(toBroker, 100)


})()
