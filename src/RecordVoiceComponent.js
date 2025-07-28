import React, { useState, useCallback } from 'react'
// import _ from 'lodash'
// import trn from './translations'
import PropTypes from 'prop-types'
import iconShare from './icon-share.png'
import { dispatch, CUSTOM_GAME_SAVE, CUSTOM_GAME_EDIT, CUSTOM_GAME_TOPIC_CHANGE, CUSTOM_GAME_WORD_CHANGE } from './events'

CustomSetWordRow.propTypes = {
  index: PropTypes.number,
  word: PropTypes.object,
  language: PropTypes.str
}

// Custom set of games prepared by user.

function CustomSetWordRow ({ index, word, language }) {
  const [autocompleteWords, setAutocompleteWords] = useState([])
  const onWordChange = useCallback((event) => {
    const word1 = [
      // term, local_term, context, context_value, level, meaning, image, sound
      event.target.value, event.target.value, '', '', '', word[5], '', ''
    ]
    dispatch(CUSTOM_GAME_WORD_CHANGE, [index, word1])

    const requestOptions = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
    fetch('/api/v1/words?language=' + language + '&query=' + event.target.value, requestOptions)
      .then(response => response.json())
      .then(data => {
        setAutocompleteWords(data)
      })
  }, [index, word])

  const onMeaningChange = useCallback((event) => {
    const word1 = [
      // term, local_term, context, context_value, level, meaning, image, sound
      word[0], word[1], '', '', '', event.target.value, word[6], word[7]
    ]
    dispatch(CUSTOM_GAME_WORD_CHANGE, [index, word1])
  }, [index, word])

  const onAutocompleteOptionChoose = useCallback((event, autocompleteWord) => {
    event.preventDefault()
    setAutocompleteWords([])
    dispatch(CUSTOM_GAME_WORD_CHANGE, [index, autocompleteWord])
  }, [index, autocompleteWords])

  const autocompleteOptions = autocompleteWords
    .map((word1) => <li key={word1[0]}><a href="#" onClick={(event) => onAutocompleteOptionChoose(event, word1)} >{word1[1]} <img src={word1[6]} style={{ width: '40px', margin: 0, padding: 0 }} /></a></li>)

  return (
    <tr>
      <td>
        {index + 1}
      </td>
      <td>
        <input className="custom-set-word" type="text" onChange={onWordChange} value={word[1]}/>
        <ul>
          {autocompleteOptions}
        </ul>
      </td>
      <td>
        <img src={word[6]} style={{ height: '140px' }} />
      </td>
      <td>
        <input type="text" value={word[5]} onChange={onMeaningChange}/>
      </td>
    </tr>
  )
}

CustomSetComponent.propTypes = {
  setIndex: PropTypes.str,
  topicTitle: PropTypes.str,
  words: PropTypes.array,
  games: PropTypes.array,
  language: PropTypes.str,
  displayGame: PropTypes.bool
}

function CustomSetComponent ({ setIndex, topicTitle, words, games, language, displayGame }) {
  const onTopicTitleChange = useCallback((event) => {
    dispatch(CUSTOM_GAME_TOPIC_CHANGE, [event.target.value])
  }, [])

  const onGameSave = useCallback(() => {
    dispatch(CUSTOM_GAME_SAVE, [false])
  }, [])

  const onGameSaveAndStart = useCallback(() => {
    dispatch(CUSTOM_GAME_SAVE, [true])
  }, [])

  const handleNewGameClick = useCallback((event) => {
    event.preventDefault()
    const game = {
      index: null,
      language: null,
      topic: {
        local_name: '',
        code: ''
      },
      // term, local_term, ?, ?, level, image, sound
      rounds: []
    }
    dispatch(CUSTOM_GAME_EDIT, [game, null])
  }, [])

  const sendEditableGameEvent = useCallback((event, game, index) => {
    event.preventDefault()
    dispatch(CUSTOM_GAME_EDIT, [game, index])
  })

  const wordRows = words.map((word1, i) => <CustomSetWordRow index={i} word={word1} language={language} key={i}/>)

  let gameBlock

  const gameElems = games.map((game, i) => <li key={i}><a href="#" onClick={ (event) => sendEditableGameEvent(event, game, i) }>{game.topic.local_name} ({game.language})</a> | {game.status}</li>)
  const gameListBlock = (<>
    <h2>Your set of games</h2>
    <a href="#" onClick={handleNewGameClick}>Add new game</a>
    <ul>{gameElems}</ul>
  </>)

  if (displayGame) {
    gameBlock = (<>
      <h3>Create/edit game</h3>
      <button onClick={onGameSave}
              title='Save'
              style={{ float: 'left', width: '70px', margin: 0, padding: 0 }}>
        <img src={iconShare} style={{ padding: 0, height: '35px' }} />
      </button>
      <button onClick={onGameSaveAndStart}
              title='Save and start solving'
              style={{ float: 'left', width: '70px', margin: 0, padding: 0 }}>
        <img src={iconShare} style={{ padding: 0, height: '35px' }} />
      </button>

      <label>
        Title:
        <input type="text" value={topicTitle} onChange={onTopicTitleChange} />
      </label>
        <table className="table">
          <thead>
            <th>
              <td>
               #
              </td>
            </th>
            <th>
              <td>
               Word
              </td>
            </th>
            <th>
              <td>
               Image
              </td>
            </th>
            <th>
              <td>
               Meaning (optional)
              </td>
            </th>
          </thead>
          <tbody>
            {wordRows}
          </tbody>
        </table>
    </>)
  }

  return (
    <div>
      {gameListBlock}
      {gameBlock}
    </div>
  )
}

export default CustomSetComponent
