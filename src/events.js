import _ from 'lodash'

export const AddCustomSet = function (self, setName) {
  document.getElementById('root').dispatchEvent(
    new CustomEvent('add-set', { detail: { self: self, setName: setName } }))
}

document.getElementById('root').addEventListener('add-set', function (event) {
  event.detail.self.setState(prevState => {
    const newState = _.cloneDeep(prevState)
    newState.customSets.UIState = 'add'
    return newState
  })
})

/* Desired declaration
const AddCustomSet1 = event(
  'add-custom-set1',
  function (event) {
    console.log('Handler')
  })
*/

export const WordQueryChanged = function (self, query) {
  document.getElementById('root').dispatchEvent(
    new CustomEvent('word-query-changed', { detail: { query: query } }))
}

document.getElementById('root').addEventListener('word-query-changed', function (event) {
  console.log('word-changed', event.detail)
})

export const CUSTOM_SET_SHOW = 'custom_set.show'
export const CUSTOM_SET_HIDE = 'custom_set.hide'
export const CUSTOM_GAME_SAVE = 'custom_game.save'
export const CUSTOM_GAME_EDIT = 'custom_game.edit'
export const CUSTOM_GAME_TOPIC_CHANGE = 'custom_game.topic.change'
export const CUSTOM_GAME_WORD_CHANGE = 'custom_game.word.change'

export const VOICE_PLAYED = 'voice.played'
export const IMAGE_SELECTION_REPLY = 'image-selection.reply'
export const REPLY_LETTER_REMOVE = 'reply-letter.remove'
export const CHALLENGE = 'challenge'
export const CONTEST_ENQUEUED = 'contest_enqueued'
export const GAME_ERROR = 'game_error'
export const PROGRESS = 'progress'
export const WS_OPENED = 'ws.opened'
export const WS_CLOSED = 'ws.closed'
export const WS_ERROR = 'ws.error'
export const TICK_CHALLENGE = 'tick-challenge'
export const LETTERS_DISPLAY_TICK = 'letters-display.tick'
export const FINISH_STATUS_TICK = 'finish-status.tick'
export const CONNECTION_SLOW_MESSAGE = 'connection.slow-message'
export const GAME_HELP = 'game.help'
export const ROUND_TIMEOUT_TICK = 'round-timeout.tick'
export const ERROR_CLOSE = 'error.close'
export const GAME_LEAVE = 'game.leave'
export const IMAGE_LOAD = 'image.load'
export const STATE_UPDATE = 'state.update'
export const METHOD_CHANGED = 'method-changed'
export const SHARE_CREATE = 'share-create'
export const LEVEL_CHANGED = 'level-changed'
export const LANGUAGE_CHANGED = 'language-changed'
export const NAME_CHANGED = 'name-changed'
export const AUTOPLAY_ENABLED = 'autoplay-enabled'
export const AUTOPLAY_DISABLED = 'autoplay-disabled'
export const VOLUME_CHANGED = 'volume-changed'
export const CONTEST_CLICKED = 'contest-clicked'
export const GAME_SKIP = 'game.skip'
export const TRAIN_CLICKED = 'train-clicked'
export const EXPLORE_START = 'explore-start'
export const FORCE_IMAGE_SELECT_METHOD = 'force-image-select-method'
export const CHALLENGE_ACCEPTED = 'challenge-accepted'
export const CHALLENGE_DECLINED = 'challenge-declined'
export const TOPIC_CHANGED = 'topic-changed'
export const RECORDING_START = 'recording.start'
export const TRANSCRIPTION_DONE = 'transcription.done'
export const QUESTION_LETTER_CLICK = 'question-letter.click'

export const dispatch = function (eventName, args) {
  document.getElementById('root').dispatchEvent(
    new CustomEvent(eventName, { detail: { args: args } }))
}

// Usage:
// dispatch(CustomsetWordChange, index, autocompleteWord)

export const handle = function (eventName, callback) {
  document.getElementById('root').addEventListener(
    eventName,
    function (event) { callback.apply(null, event.detail.args) }
  )
}
