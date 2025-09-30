// import React, { useState, useRef, useEffect, useCallback } from 'react'
import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import trn from './translations'

import { setCookie, getCookies } from './utils'

SettingsComponent.propTypes = {
  userLanguage: PropTypes.str,
  isSharedGame: PropTypes.bool,
  user: PropTypes.object,
  languages: PropTypes.array
}

function SettingsComponent ({ userLanguage, isSharedGame, user, languages }) {
  const [autoplayEnabled, setAutoplayEnabled] = useState(!document.cookie.includes('autoplay=0'))
  const [soundVolume, setSoundVolume] = useState(parseInt(getCookies().volume || 40))
  const [settingsDisplayed, setSettingsDisplayed] = useState(false)

  const handleSettingsDisplayButtonClick = useCallback((event) => {
    event.preventDefault()
    if (settingsDisplayed) {
      setSettingsDisplayed(false)
    } else {
      setSettingsDisplayed(true)
    }
  })

  const onAutoplayToggleClick = useCallback((event) => {
    if (event.target.checked) {
      setAutoplayEnabled(true)
      setCookie('autoplay', '1')
    } else {
      setAutoplayEnabled(false)
      setCookie('autoplay', '0')
    }
  })

  const handleVolumeChange = useCallback((event) => {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('volume-changed', { detail: { volume: event.target.valueAsNumber } }))
    setSoundVolume(event.target.valueAsNumber)
    setCookie('volume', event.target.valueAsNumber)
  })

  const handleUsernameChange = useCallback((event) => {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('name-changed', { detail: { name: event.target.value } }))
  })

  const handleLanguageChange = useCallback((event) => {
    // Leave should go first to use language before changed.
    document.getElementById('root').dispatchEvent(
      new CustomEvent('game.leave', { detail: {} }))

    document.getElementById('root').dispatchEvent(
      new CustomEvent('language-changed', { detail: { language: event.target.value } }))
  })

  let autoplayColumn, volumeColumn, usernameInput, languageColumn, settingsDialog

  let title = 'Open settings'

  if (!isSharedGame && settingsDisplayed) {
    autoplayColumn = (
      <label htmlFor="autoplay-toggle-checkbox" title={trn(userLanguage, 'Autoplay site sounds')}>
        {trn(userLanguage, 'Autoplay')}
        <input id="autoplay-toggle-checkbox" type="checkbox" checked={autoplayEnabled} onClick={onAutoplayToggleClick}/>
      </label>
    )

    volumeColumn = (
      <input type="range"
             id="volume"
             name="volume" min="0" max="100"
             defaultValue={soundVolume}
             onChange={handleVolumeChange}/>
    )

    usernameInput = (
      <input type="text" placeholder="Username"
             value={user.name}
             onChange={handleUsernameChange}
             style={{ color: 'white' }}>
      </input>
    )

    const languageOptionItems = languages
      .map((language) => <option key={language.code} value={language.code}>{language.local_name}</option>)

    languageColumn = (
      <select id="language" style={{ backgroundColor: '#282c34' }} value={user.language} onChange={handleLanguageChange}>
        <option value="">---</option>
        {languageOptionItems}
      </select>
    )

    settingsDialog = (
      <ul style={{ backgroundColor: '#282c34', listStyleType: 'none', width: '400px', border: '4px solid white', padding: '5px', paddingTop: '40px' }}>
        <li>{autoplayColumn}</li>
        <li><label>Sound volume:</label>{volumeColumn}</li>
        <li><label>Username:</label> {usernameInput}</li>
        <li><label>Language:</label>{languageColumn}</li>
      </ul>
    )

    title = 'Close settings'
  }

  return (
    <div style={{ position: 'fixed', right: '20px', top: '20px', zIndex: 9999 }}>
      <button
        onClick={handleSettingsDisplayButtonClick}
        style={{ padding: '0 16px', float: 'right', height: '40px' }}
        title={ title }>
        Settings
      </button>
      {settingsDialog}
    </div>
  )
}

export default SettingsComponent
