import './style.scss'
import browser from 'webextension-polyfill'

const setTbsParameter = (currentUrl: string, value: string) => {
  const url = new URL(currentUrl)
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
  if (tab.url === undefined) {
    return
  }

  const newUrl = setTbsParameter(tab.url, value)
  browser.tabs.update(tab.id, { url: newUrl })
}

type DateRange = {
  from: string
  to: string
}

const isDateRange = (value: unknown): value is DateRange => {
  return (
    typeof value === 'object' &&
    typeof (value as DateRange).from === 'string' &&
    typeof (value as DateRange).to === 'string'
  )
}

const storeCustomRange = async (value: DateRange) => {
  await browser.storage.local.set({ customRange: value })
}

const getCustomRange = async (): Promise<DateRange> => {
  const store = await browser.storage.local.get()
  if (store === undefined || !isDateRange(store.customRange)) {
    const now = new Date().toISOString()
    return {
      from: now,
      to: now,
    }
  }
  const storedRange: DateRange = store.customRange
  return {
    from: storedRange.from,
    to: storedRange.to,
  }
}

/**
 * An object representing a custom range with unit.
 */
type CustomRange = {
  range: number
  unit: string
}

/**
 * Checks if the value is a CustomRange object.
 *
 * @param value value
 * @returns true if the value is a CustomRange object
 */
const isPresetRange = (value: unknown): value is CustomRange => {
  return (
    typeof value === 'object' &&
    typeof (value as CustomRange).range === 'number' &&
    typeof (value as CustomRange).unit === 'string'
  )
}

/**
 * Set empty array as preset ranges.
 */
const clearCustomPresetRanges = async () => {
  await browser.storage.local.set({ presetRanges: [] })
}

/**
 * Store custom preset ranges.
 *
 * @param value value
 */
const storeCustomPresetRanges = async (value: CustomRange[]) => {
  await browser.storage.local.set({ presetRanges: value })
}

/**
 * Retreive custom preset ranges from local storage.
 *
 * @returns custom preset ranges
 */
const getCustomPresetRanges = async (): Promise<CustomRange[]> => {
  const store = await browser.storage.local.get()
  if (store === undefined || !Array.isArray(store.presetRanges)) {
    return []
  }
  const storedRanges: CustomRange[] = store.presetRanges
  return storedRanges.filter(range => isPresetRange(range)) as CustomRange[]
}

/**
 * An object representing a preset button.
 */
type PresetButton = {
  label: string
  searchQuery: string
}

/**
 * Returns an element by id.
 *
 * @throws Error if the element is not found
 * @returns HTMLElement
 */
const getElementById = (id: string): HTMLElement => {
  const element = document.getElementById(id)
  if (element == null) {
    throw new Error(`Element with id ${id} not found`)
  }
  return element
}

// https://support.google.com/websearch/thread/7860817?hl=en
const defaultPresets: PresetButton[] = [
  {
    label: 'all time',
    searchQuery: 'qdr:a',
  },
  {
    label: 'past hour',
    searchQuery: 'qdr:h',
  },
  {
    label: 'past day',
    searchQuery: 'qdr:d',
  },
  {
    label: 'past week',
    searchQuery: 'qdr:w',
  },
  {
    label: 'past month',
    searchQuery: 'qdr:m',
  },
  {
    label: 'past year',
    searchQuery: 'qdr:y',
  },
]

/**
 * Creates buttons from the given array of preset buttons.
 *
 * @param buttons array of buttons
 * @param idPrefix id prefix for the buttons
 */
const createPresetRangeButtons = (
  buttons: PresetButton[],
  idPrefix: string
): void => {
  buttons.forEach((btn, index) => {
    const buttonElement = document.createElement('button')
    buttonElement.type = 'button'
    buttonElement.className = 'btn'
    buttonElement.id = `${idPrefix}-${index}`
    buttonElement.innerText = btn.label
    buttonElement.onclick = async () => await updateTabUrl(btn.searchQuery)

    const presetTab = getElementById('preset-tab')
    presetTab.insertAdjacentElement('beforeend', buttonElement)
  })
}

/**
 * Creates a label from a preset range.
 *
 * @param customRange range object
 * @returns label string
 */
const createLabelFromRange = (customRange: CustomRange): string => {
  const { range, unit } = customRange
  let label = `past ${range} `
  switch (unit) {
    case 'h':
      label += 'hours'
      break
    case 'd':
      label += 'days'
      break
    case 'w':
      label += 'weeks'
      break
    case 'm':
      label += 'months'
      break
    case 'y':
      label += 'years'
      break
    default:
      label += unit
  }
  return range > 1 ? label : label.slice(0, -1)
}

/**
 * Creates custom preset range buttons.
 */
const createCustomPresetRangeButtons = async (): Promise<number> => {
  const storedPresets = await getCustomPresetRanges()
  if (storedPresets.length === 0) {
    return 0
  }

  const customPresetButtons: PresetButton[] = storedPresets.map(stored => {
    return {
      label: createLabelFromRange(stored),
      searchQuery: `qdr:${stored.unit}${stored.range}`,
    }
  })
  if (customPresetButtons.length === 0) {
    return 0
  }
  createPresetRangeButtons(customPresetButtons, 'custom-preset')
  return customPresetButtons.length
}

/**
 * Creates a button to clear custom preset ranges.
 */
const createClearCustomPresetRangeButtons = (): void => {
  const presetTab = getElementById('preset-tab')

  const hrElement = document.createElement('hr')
  hrElement.className = 'btn-separator'
  presetTab.insertAdjacentElement('beforeend', hrElement)

  const buttonElement = document.createElement('button')
  buttonElement.type = 'button'
  buttonElement.className = 'btn'
  buttonElement.id = 'clear-preset'
  buttonElement.innerText = 'clear custom presets'
  buttonElement.onclick = async () => {
    await clearCustomPresetRanges()
    presetTab.innerHTML = ''
    createPresetRangeButtons(defaultPresets, 'default-preset')
  }
  presetTab.insertAdjacentElement('beforeend', buttonElement)
}

const renderPresetButtons = async (): Promise<void> => {
  getElementById('preset-tab').innerHTML = ''
  createPresetRangeButtons(defaultPresets, 'default-preset')
  const customs = await createCustomPresetRangeButtons()
  if (customs > 0) {
    createClearCustomPresetRangeButtons()
  }
}
renderPresetButtons()

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
  const element = getElementById('custom-search')

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

/**
 * Updates preset settings when 'add-to-preset' button is clicked.
 */
const addToCustomPresetsHandler = (): void => {
  const element = getElementById('add-to-preset')
  element.onclick = async () => {
    const valueElement: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('date-range-value')
    )
    const unitElement: HTMLInputElement = <HTMLInputElement>(
      document.getElementById('date-unit')
    )

    const range = valueElement.valueAsNumber
    const unit = unitElement.value
    if (range === null || unit === null) {
      return
    }
    const value: CustomRange = {
      range,
      unit,
    }
    const storedRanges = await getCustomPresetRanges()
    if (
      storedRanges.some(
        stored => stored.range === value.range && stored.unit === value.unit
      )
    ) {
      console.log(`${value} already exists in preset ranges`)
      return
    }
    const newRanges = [...storedRanges, value]
    await storeCustomPresetRanges(newRanges)
    await renderPresetButtons()
  }
}
addToCustomPresetsHandler()
