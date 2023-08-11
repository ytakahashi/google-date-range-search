import './style.scss'
import browser from 'webextension-polyfill'

const setTbsParameter = (currentUrl: string, value: string) => {
  let url = new URL(currentUrl)
  url.searchParams.set('tbs', value)
  return url.toString()
}

const updateTabUrl = async (value: string) => {
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

type DateRange = {
  from: string
  to: string
}

const storeCustomRange = async (value: DateRange) => {
  await browser.storage.local.set({ customRange: value })
}

const getCustomRange = async (): Promise<DateRange> => {
  const store = await browser.storage.local.get()
  if (store === undefined || store.customRange === undefined ) {
    const now = new Date().toISOString()
    return {
      from: now,
      to: now,
    }
  }
  return {
    from: store.customRange.from,
    to: store.customRange.to,
  }
}

/**
 * preset.
 */
const setOnclickHandler = (id: string, value: string) => {
  const element = document.getElementById(id)
  if (element == null) {
    return
  }
  element.onclick = () => updateTabUrl(value)
}

// https://support.google.com/websearch/thread/7860817?hl=en
setOnclickHandler('all-time', 'qdr:a')
setOnclickHandler('past-hour', 'qdr:h')
setOnclickHandler('past-day', 'qdr:d')
setOnclickHandler('past-week', 'qdr:w')
setOnclickHandler('past-month', 'qdr:m')
setOnclickHandler('past-year', 'qdr:y')

/**
 * calendar.
 */
const initDateRange = async () => {
  const customRange = await getCustomRange()
  const fromElement: HTMLInputElement = <HTMLInputElement>(
    document.getElementById('from-date')
  )
  const toElement: HTMLInputElement = <HTMLInputElement>(
    document.getElementById('to-date')
  )
  if (fromElement == null) {
    return
  }
  fromElement.valueAsDate = new Date(customRange.from)
  toElement.valueAsDate = new Date(customRange.to)
}

const setCalendarOnclickHandler = () => {
  const element = document.getElementById('calendar-search')
  if (element == null) {
    return
  }

  element.onclick = () => {
    const fromElement: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('from-date')
    )
    const toElement: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('to-date')
    )
    const toSearchQueryString = (date: Date): string =>
      `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`

    const fromDate = fromElement.valueAsDate
    const toDate = toElement.valueAsDate
    if (fromDate === null || toDate === null) {
      return
    }

    const from = toSearchQueryString(fromDate)
    const to = toSearchQueryString(toDate)
    const value = `cdr:1,cd_min:${from},cd_max:${to}`
    updateTabUrl(value)
    storeCustomRange({
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    })
  }
}
initDateRange()
setCalendarOnclickHandler()

/**
 * custom.
 */
const setCustomRangeFormClickHandler = () => {
  const element = document.getElementById('custom-search')
  if (element == null) {
    return
  }

  element.onclick = () => {
    const valueElement: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('date-range-value')
    )
    const unitElement: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('date-unit')
    )

    const v = valueElement.valueAsNumber
    const unit = unitElement.value
    if (v === null || unit === null) {
      return
    }

    const value = `qdr:${unit}${v}`
    updateTabUrl(value)
  }
}
setCustomRangeFormClickHandler()
