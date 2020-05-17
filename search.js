'use strict'

const setTbsParameter = (currentUrl, value) => {
  let url = new URL(currentUrl)
  url.searchParams.set('tbs', value)
  return url.toString()
}

const onclickHandler = (value) => {
  chrome.tabs.query({ active: true }, function (tabs) {
    if (tabs.length === 0) {
      return
    }
    const tab = tabs[0]
    const newUrl = setTbsParameter(tab.url, value)
    chrome.tabs.update(tab.id, { url: newUrl })
  })
}

// https://support.google.com/websearch/thread/7860817?hl=en
const itm1 = document.getElementById('past-hour');
itm1.onclick = () => {
   onclickHandler('qdr:h')
}

const itm2 = document.getElementById('past-day');
itm2.onclick = () => {
  onclickHandler('qdr:d')
}

const itm3 = document.getElementById('past-week');
itm3.onclick = () => {
  onclickHandler('qdr:w')
}

const itm4 = document.getElementById('past-month');
itm4.onclick = () => {
  onclickHandler('qdr:m')
}

const itm5 = document.getElementById('past-6months');
itm5.onclick = () => {
  onclickHandler('qdr:m6')
}

const itm6 = document.getElementById('past-year');
itm6.onclick = () => {
  onclickHandler('qdr:y')
}
