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
