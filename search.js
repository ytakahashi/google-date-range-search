'use strict'

const setTbsParameter = (currentUrl, value) => {
  let url = new URL(currentUrl)
  url.searchParams.set('tbs', value)
  return url.toString()
}

const onclickHandler = (value) => {
  // https://stackoverflow.com/a/17826527
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length === 0) {
      return
    }
    const tab = tabs[0]
    const newUrl = setTbsParameter(tab.url, value)
    chrome.tabs.update(tab.id, { url: newUrl })
  })
}

// https://support.google.com/websearch/thread/7860817?hl=en
const allTime = document.getElementById('all-time');
allTime.onclick = () => {
  onclickHandler('qdr:a')
}

const pastHour = document.getElementById('past-hour');
pastHour.onclick = () => {
   onclickHandler('qdr:h')
}

const pastDay = document.getElementById('past-day');
pastDay.onclick = () => {
  onclickHandler('qdr:d')
}

const pastWeek = document.getElementById('past-week');
pastWeek.onclick = () => {
  onclickHandler('qdr:w')
}

const pastMonth = document.getElementById('past-month');
pastMonth.onclick = () => {
  onclickHandler('qdr:m')
}

const past6Month = document.getElementById('past-6months');
past6Month.onclick = () => {
  onclickHandler('qdr:m6')
}

const pastYear = document.getElementById('past-year');
pastYear.onclick = () => {
  onclickHandler('qdr:y')
}
