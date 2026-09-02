import React from 'react'
import PropTypes from 'prop-types'

import { REPLY_LETTER_REMOVE } from './events'

ReplyLetterComponent.propTypes = {
  letter: PropTypes.node.isRequired,
  wordIndex: PropTypes.node.isRequired,
  letterIndex: PropTypes.node.isRequired,
  isSolved: PropTypes.node.isRequired,
  isWrongReply: PropTypes.bool
}

export default function ReplyLetterComponent (props) {
  function onRemoveClick (e) {
    e.preventDefault()
    const eventDetail = {
      detail: {
        letter: props.letter,
        wordIndex: props.wordIndex,
        letterIndex: props.letterIndex
      }
    }
    document.getElementById('root').dispatchEvent(
      new CustomEvent(REPLY_LETTER_REMOVE, eventDetail))
  };

  const letterStyle = {}
  if (props.letter !== ' ') {
    letterStyle.border = 'solid gray 2px'
  }
  if (props.isSolved && props.letter !== ' ') {
    letterStyle.border = 'solid green 2px'
  } else if (props.isWrongReply && props.letter !== ' ') {
    letterStyle.border = 'solid red 2px'
  }

  if (props.letter !== '?') {
    letterStyle.cursor = 'pointer'
  }

  return (
    <div className="reply-letter"
         title="Remove letter"
         style={ letterStyle }
         onClick={ onRemoveClick }>
      {props.letter}
    </div>
  )
};
