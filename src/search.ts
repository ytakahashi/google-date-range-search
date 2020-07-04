import { browser } from 'webextension-polyfill-ts'

const setTbsParameter = (currentUrl: string, value: string) => {
  let url = new URL(currentUrl)
  url.searchParams.set('tbs', value)
  return url.toString()
}

const setOnclickHandler = (id: string, value: string) => {
  const element = document.getElementById(id)
  if (element == null) {
    return
  }

  element.onclick = async () => {
    // https://stackoverflow.com/a/17826527
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length === 0) {
      return
    }

    const tab = tabs[0]
    if (tab.url == undefined) {
      return
    }

    const newUrl = setTbsParameter(tab.url, value)
    browser.tabs.update(tab.id, { url: newUrl })
  }
}

// https://support.google.com/websearch/thread/7860817?hl=en
setOnclickHandler('all-time', 'qdr:a')
setOnclickHandler('past-hour', 'qdr:h')
setOnclickHandler('past-day', 'qdr:d')
setOnclickHandler('past-week', 'qdr:w')
setOnclickHandler('past-month', 'qdr:m')
setOnclickHandler('past-6months', 'qdr:m6')
setOnclickHandler('past-year', 'qdr:y')
