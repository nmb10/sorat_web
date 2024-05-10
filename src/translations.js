import { translations as EnTranslations } from './locales/en'
import { translations as DeTranslations } from './locales/de'
import { translations as FrTranslations } from './locales/fr'
import { translations as RuTranslations } from './locales/ru'
import { translations as OsTranslations } from './locales/os'
import { translations as DigTranslations } from './locales/dig'

const translations = {
  en: EnTranslations,
  de: DeTranslations,
  fr: FrTranslations,
  ru: RuTranslations,
  os: OsTranslations,
  dig: DigTranslations
}

const LETTERS_SELECTION_METHOD = 'letters-selection'
const IMAGE_SELECTION_METHOD = 'image-selection'

export default function trn (userLanguage, text, variables) {
  let searchText = text
  variables = variables || {}
  if (searchText === IMAGE_SELECTION_METHOD) {
    // select box options.
    searchText = 'Image selection'
  } else if (searchText === LETTERS_SELECTION_METHOD) {
    searchText = 'Letters selection'
  } else if (searchText === 'normal') {
    searchText = 'Normal'
  } else if (searchText === 'simple') {
    searchText = 'Simple'
  } else if (searchText === 'hard') {
    searchText = 'Hard'
  }
  const translatedText = translations[userLanguage][searchText]
  // For now translation is trivial, so I don't want to keep big translation library. So
  // here is simple placeholder implementation base on RE
  if (translatedText) {
    if (Object.keys(variables)) {
      // render variables.
      return translatedText.replace(/{(.*?)}/g, (x, g) => variables[g])
    } else {
      return translatedText
    }
  }

  // Not translated yet. Return like a hint.
  return userLanguage + ': ' + searchText
}
