import spinner from './spinner1.png'
import iconHelp from './icons8-help-50.png'
import iconLeave from './icon-leave.png'
// import iconSkip from './icon-skip.png'
import iconVolume from './icon-volume.png'
import iconShare from './icon-share.png'
import logo from './logo.png'
import iconSelectImage from './icon-select-image.png'

import React from 'react'
import './App.css'
import PropTypes from 'prop-types'
import _ from 'lodash'
import trn from './translations'

const imageLoadTimeout = 0

// how many seconds to wait before showing word letters.
const LETTERS_DISPLAY_TIMEOUT = 3

const LETTERS_SELECTION_METHOD = 'letters-selection'
const IMAGE_SELECTION_METHOD = 'image-selection'

const UI_STATES = {
  init: 'init',
  demo: 'demo',
  inTrain: 'inTrain', // In train mode dialog.
  trainRequested: 'trainRequested',
  inExplore: 'inExplore', // In explore mode dialog.
  exploreRequested: 'exploreRequested',
  leaveRequested: 'leaveRequested',
  training: 'training', // Playing train game.
  exploring: 'exploring', // Playing epxlore game.
  constesting: 'contesting', // Playing contest game.
  skipRequested: 'skipRequested',
  skipped: 'skipped',
  contestEnqueued: 'contestEnqueued'
}

const tableSizeMap = {
  1: [1, 1],
  2: [1, 2],
  3: [1, 3],
  4: [2, 2],
  5: [2, 3],
  6: [2, 3],
  7: [3, 3],
  8: [3, 3],
  9: [3, 3],
  10: [3, 4],
  11: [3, 4],
  12: [3, 4],
  13: [4, 4],
  14: [4, 4],
  15: [4, 4],
  16: [4, 4],
  17: [4, 5],
  18: [4, 5],
  19: [4, 5],
  20: [4, 5]
} // :)

const methods = [
  IMAGE_SELECTION_METHOD,
  LETTERS_SELECTION_METHOD
  // FIXME: Implement 'enter letters' - entering letters from keyboard
]

const levels = [
  'simple',
  'normal',
  'hard'
]

const warningBlockStyle = {
  backgroundColor: 'rgb(248, 215, 218)',
  borderColor: 'rgb(114, 28, 36)',
  color: 'rgb(114, 28, 36)',
  fontSize: '18px',
  position: 'fixed',
  padding: '4px 15px 4px 4px',
  top: 0
}

const errorBlockStyle = {
  backgroundColor: 'rgb(248, 215, 218)',
  borderColor: 'rgb(114, 28, 36)',
  color: 'rgb(114, 28, 36)',
  fontSize: '18px',
  position: 'fixed',
  padding: '4px 15px 4px 4px',
  top: 0
}

const finishStatusStyle = {
  border: '3px solid green',
  fontSize: '2em',
  position: 'fixed',
  top: '45px',
  backgroundColor: '#282c34',
  padding: '5px',
  borderRadius: '10px'
}

function setCookie (name, value) {
  document.cookie = name + '=' + value
}

function getCookies () {
  const ret = {}
  let key, value
  for (const cookie of document.cookie.split('; ')) {
    [key, value] = cookie.split('=')
    ret[key] = value
  }
  return ret
}

function debugMode () {
  return document.cookie.includes('debug=1')
}

function sendExploreStartEvent (event, topicSet) {
  event.preventDefault()
  document.getElementById('root').dispatchEvent(
    new CustomEvent(
      'explore-start',
      { detail: { topicSet: topicSet } }))
}

function playSound (src, volume) {
  const voice1 = new Audio(src)
  voice1.volume = volume / 100.0
  voice1.play()

  document.getElementById('root').dispatchEvent(
    new CustomEvent('voice.played', { detail: { src: src, soundVolume: volume } }))
}

function copyToClipboard (text) {
  navigator.clipboard.writeText(text).then(
    function () {
      console.log('Async: Copying to clipboard was successful!')
    },
    function (err) {
      console.error('Async: Could not copy text: ', err)
    })
}

function getPlayersScores (players, finishedRounds) {
  const scores = {}
  if (finishedRounds.length === 0) {
    // Show zeros for all players.
    for (const userId in players) {
      scores[userId] = {
        name: players[userId].name,
        total: 0,
        all: []
      }
    }
  } else {
    for (let i = 0; i < finishedRounds.length; ++i) {
      for (const userId in finishedRounds[i].solutions) {
        if (userId in scores) {
          scores[userId].total += finishedRounds[i].solutions[userId].score
          scores[userId].all.push(finishedRounds[i].solutions[userId].score)
        } else {
          scores[userId] = {
            name: finishedRounds[i].solutions[userId].name,
            total: finishedRounds[i].solutions[userId].score,
            all: [finishedRounds[i].solutions[userId].score]
          }
        }
      }
    }
  }
  return scores
}

function preloadImage (roundIndex, imageIndex, imageMap) {
  // FIXME: Deprecated. Drop it.
  const resolve = function (img1) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent(
        'image.load',
        { detail: { roundIndex: roundIndex, imageIndex: imageIndex, img: img1, imageMap: imageMap } }))
  }
  const reject = function (img1) {
    console.log('Image rejected: ', img1)
  }

  const img = new Image()
  img.onload = function () {
    if (imageLoadTimeout === 0) {
      resolve(img)
    } else {
      // FIXME: Find better way to get choice of 1, 2, 3, 4
      const random1 = (Math.round(Math.random()) + 2000) + (Math.round(Math.random()) * 1000)
      setTimeout(resolve, imageLoadTimeout + random1, img)
    }
  }
  img.onerror = img.onabort = function () {
    reject(imageMap.src)
  }
  img.src = imageMap.src
}

function questionLettersToTable (questionLetters, chosenQueryIndexes, lettersDisplayTimeout) {
  const [tableRowsCount, tableColumnsCount] = tableSizeMap[questionLetters.length]
  let letterIndex, letter
  const tableRows = []

  const tdStyle = {
    display: 'inline-block', padding: 0, borderBottom: 0
  }

  if (lettersDisplayTimeout > 0) {
    tdStyle.opacity = 0
  }

  for (let i = 0; i < tableRowsCount; ++i) {
    const rowElems = []
    for (let j = 0; j < tableColumnsCount; ++j) {
      if (questionLetters.length > 0) {
        [letterIndex, letter] = questionLetters.shift()
        const isChosen = chosenQueryIndexes.includes(pair(0, letterIndex))
        const questionLetter = <td style={tdStyle}>
          <QuestionLetter letter={letter} wordIndex={0} letterIndex={letterIndex} isChosen={isChosen} />
        </td>
        rowElems.push(questionLetter)
      }
    }
    tableRows.push(<tr>{rowElems}</tr>)
  }

  return (
    <table>
      <tbody>
        {tableRows}
      </tbody>
    </table>
  )
};

function pair (wordIndex, letterIndex) {
  return wordIndex + ',' + letterIndex
}

function replyLettersToRow (words, isSolved, attempts, isDemoGame, isSharedGame, sharedGameIsChecked) {
  const replyLetters = []
  let inReplyWords = false

  for (let i = 0; i < attempts.length; ++i) {
    if (attempts[i].reply.letters.includes(words)) {
      inReplyWords = true
      break
    }
  }

  let isWrongReply = false
  if (isSharedGame && !isSolved && sharedGameIsChecked) {
    isWrongReply = true
  } else if (!isSolved && inReplyWords) {
    isWrongReply = true
  }

  for (let j = 0; j < words.length; ++j) {
    replyLetters.push(
      <ReplyLetter isWrongReply={isWrongReply} isSolved={isSolved} letter={words[j]} wordIndex={0} letterIndex={j} />)
  }

  const styles = {
    whiteSpace: 'nowrap'
  }
  return (
    <div style={styles}>
      {replyLetters}
    </div>
  )
};

function formatFloat (number) {
  return parseFloat(number.toFixed(2))
}

function userScoreToRow (isCurrent, score) {
  let scorePercent = ''
  if (score.all.length > 0) {
    const totalPossible = 5 * score.all.length
    scorePercent = '(' + formatFloat((score.total / totalPossible) * 100) + '%)'
  }
  const currentUserStyle = {}
  if (isCurrent) {
    currentUserStyle.color = 'green'
  }

  const allScores = score.all.slice(-3).map((score1, index) => <td key={index}>{score1}</td>)
  return (
    <tr>
      <td><span style={currentUserStyle}>{score.name}</span></td>
      <td><span className="user-total-score" style={currentUserStyle}>{score.total}{scorePercent}</span></td>
      <td>...</td>
      {allScores}
    </tr>)
};

ShareElementWidget.propTypes = {
  shareGame: PropTypes.object,
  userLanguage: PropTypes.string
}

function ShareElementWidget (props) {
  const round = props.shareGame.rounds[0]
  const shareUrl = document.location.protocol + '//' + document.location.host + props.shareGame.url
  const question = round.question.join(' ')
  const title = trn(props.userLanguage, 'Are you able to solve ') + ' ' + ' "' + question + '"?'
  const redditURL = encodeURI('https://www.reddit.com/submit?url=' + shareUrl + '&title=' + title + '&type=LINK')

  // const correctChoice = round.correct_choice
  // const correctImage = [null, round.img1, round.img2, round.img3, round.img4][correctChoice]
  // const imageURL = document.location.protocol + '//' + document.location.host + correctImage.src
  return (
    <div>
      <div style={{ clear: 'both' }}>
        <button onClick={() => copyToClipboard(title)}
                title={trn(props.userLanguage, 'Copy title')}
                style={{ float: 'left', margin: 0, paddingLeft: '5px', paddingRight: '5px' }}>
          {trn(props.userLanguage, 'Copy title')}
        </button>
        <button onClick={() => copyToClipboard(shareUrl)}
                title={trn(props.userLanguage, 'Copy share URL')}
                style={{ float: 'left', marginLeft: '5px', paddingLeft: '5px', paddingRight: '5px' }}>
          {trn(props.userLanguage, 'Copy share URL')}
        </button>
      </div>
      <div style={{ clear: 'both' }}>
        <a href={redditURL} target='_blank' rel='noreferrer' title='Create reddit post'>
          <img style={{ float: 'left', width: '32px' }}
               src="https://www.redditstatic.com/shreddit/assets/favicon/64x64.png" />
        </a>
      </div>
    </div>
  )
}

CurrentRoundTimeoutWidget.propTypes = {
  user: PropTypes.object,
  isSolved: PropTypes.bool,
  isLettersSelection: PropTypes.bool,
  currentRound: PropTypes.object
}

function CurrentRoundTimeoutWidget (props) {
  // TODO: Too dirty, refactor.
  if (props.isSolved) {
    let pointsBlock
    let points = 0
    if (props.isSolved && props.isLettersSelection) {
      if (props.currentRound.solutions[props.user.id].hints.length === 3) {
        points = 0
      } else {
        points = '+' + (5 - props.currentRound.solutions[props.user.id].hints.length)
      }
      pointsBlock = <span style={{ color: 'green' }}>{points}</span>
    }
    return (<h3 style={{ color: 'green', marginLeft: '-5px', textShadow: '2px 2px 2px #000', fontSize: '65px', float: 'left' }}>
      {pointsBlock}
    </h3>)
  } else if (props.currentRound.timeout < 10) {
    return (
      <h3 style={{ color: 'red', marginLeft: '5px', textShadow: '2px 2px 2px #000', fontSize: '65px', float: 'left' }}>
        {props.currentRound.timeout}
      </h3>
    )
  } else {
    return (
      <h3 style={{ color: 'green', marginLeft: '-5px', textShadow: '2px 2px 2px #000', fontSize: '65px', float: 'left' }}>
        {props.currentRound.timeout}
      </h3>
    )
  }
}

FinishedRoundsTable.propTypes = {
  finishedRounds: PropTypes.array,
  user: PropTypes.object,
  players: PropTypes.array
}
function FinishedRoundsTable (props) {
  /* example of finishedRounds
  * FIXME: Add example.
  */

  const scores = getPlayersScores(props.players, props.finishedRounds)

  const imageRowElems = []
  const wordRowElems = []
  const pointsRowsElems = []

  for (const userId in scores) {
    pointsRowsElems.push(userScoreToRow(userId === props.user.id, scores[userId]))
  }

  if (props.finishedRounds.length > 0) {
    for (const round of props.finishedRounds.slice(-3)) {
      const correctChoice = round.correct_choice
      const correctImage = [null, round.img1, round.img2, round.img3, round.img4][correctChoice]
      imageRowElems.push(
        <td><img src={correctImage.src} style={{ width: '30%', height: 'auto' }} /></td>)
      wordRowElems.push(<td>{round.local_term}</td>)
    }
  }

  return (
    <table>
      <tbody>
        <tr>
          <td></td>
          <td></td>
          <td>...</td>
          {imageRowElems}
        </tr>
        <tr>
          <td></td>
          <td></td>
          <td>...</td>
          {wordRowElems}
        </tr>
        {pointsRowsElems}
      </tbody>
    </table>
  )
};

TransitionWidget.propTypes = {
  currentGame: PropTypes.object,
  nextGame: PropTypes.object,
  mode: PropTypes.string,
  userLanguage: PropTypes.string,
  totalHints: PropTypes.number,
  currentRoundNumber: PropTypes.number
}

function TransitionWidget (props) {
  // Displays information about transition to the next rounds.

  if (props.mode === 'explore' && props.currentRoundNumber >= 0 && props.currentGame && props.currentGame.topic) {
    const diff = 3 - props.totalHints
    if (diff > 0) {
      return <span
          title={trn(props.userLanguage, 'Hints amount limit to pass to the next round.')}
          style={{ marginRight: '6px', float: 'left', color: 'green', fontSize: '33px' }}>
        {diff}
      </span>
    } else if (diff === 0) {
      return <span
            title={trn(props.userLanguage, 'No more hint attempts. Otherwise new round will not be available.')}
            style={{ marginRight: '6px', float: 'left', color: 'rgb(114, 28, 36)', fontSize: '33px' }}>
        0
      </span>
    } else {
      // Too much hints. Next round not allowed.
      return <span
          title={trn(props.userLanguage, 'Too many hints. The next game will not be available.')}
          style={{ marginRight: '6px', float: 'left', color: 'red', fontSize: '33px' }}>
        x
      </span>
    }
  }
};

ProgressWidget.propTypes = {
  games: PropTypes.array,
  initialCounter: PropTypes.number
}

function ProgressWidget (props) {
  let topicPivot = ''
  let gamesCollector = []
  const splitted = []

  // FIXME: Too dirty. Add tests and refactor.
  for (let i = 0; i < props.games.length; ++i) {
    if (topicPivot === '') {
      topicPivot = props.games[i].topic.code
    }

    if (topicPivot === props.games[i].topic.code) {
      gamesCollector.push(props.games[i])
    } else {
      splitted.push(gamesCollector)
      topicPivot = props.games[i].topic.code
      gamesCollector = [props.games[i]]
    }
  }
  if (gamesCollector.length > 0) {
    splitted.push(gamesCollector)
  }

  const rows = []
  let counter = props.initialCounter
  for (let i = 0; i < splitted.length; ++i) {
    rows.push(<TopicElems sets={ splitted[i] } setsCounter={ counter } />)
    counter += splitted[i].length
  }

  return (
    <div>
      { rows }
    </div>
  )
};

TopicElems.propTypes = {
  sets: PropTypes.array,
  setsCounter: PropTypes.number
}

function TopicElems (props) {
  const rows = []

  let topicLocalName = ''

  for (let i = 0; i < props.sets.length; ++i) {
    topicLocalName = props.sets[i].topic.local_name
    if (props.sets[i].status === 'solved') {
      rows.push(
        <div style={{ border: '4px solid green', float: 'left', margin: '3px' }}>
          <a href="#" title='Try that set again' onClick={(event) => sendExploreStartEvent(event, props.setsCounter + i)}>&nbsp;{props.setsCounter + i}&nbsp;</a>
        </div>)
    } else if (props.sets[i].status === 'skipped') {
      rows.push(
        <div style={{ border: '4px solid orange', float: 'left', margin: '3px' }}>
          <a href="#" title='Try that set again' onClick={(event) => sendExploreStartEvent(event, props.setsCounter + i)}>&nbsp;{props.setsCounter + i}&nbsp;</a>
        </div>)
    } else {
      if (debugMode()) {
        // Show start game links for unsolved games.
        rows.push(
          <div style={{ border: '4px solid gray', float: 'left', margin: '3px' }}>
            <a href="#" title='Try that set' onClick={(event) => sendExploreStartEvent(event, props.setsCounter + i)}>&nbsp;{props.setsCounter + i}&nbsp;</a>
         </div>)
      } else {
        rows.push(
          <div style={{ border: '4px solid gray', float: 'left', margin: '3px' }}>
            &nbsp;{props.setsCounter + i}&nbsp;
         </div>)
      }
    }
  }

  return (
    <div style={{ border: '1px gray solid', float: 'left' }}>
      <div>{ topicLocalName }</div>
      <div>{ rows }</div>
    </div>
  )
};

WordImageColumn.propTypes = {
  imageSrc: PropTypes.node.isRequired,
  imageChoice: PropTypes.node.isRequired,
  userChoices: PropTypes.node.isRequired,
  isCorrectChoice: PropTypes.bool,
  choicePointer: PropTypes.number,
  isSolved: PropTypes.bool,
  score: PropTypes.number
}

function WordImageColumn (props) {
  let onImageClick, imagePointsBlock
  const choicePointer = props.choicePointer ? '#' + props.choicePointer : null
  const imageStyle = {} // Do not write here display settings. Otherwise use index.html@media
  // const imageStyle = { objectFit: 'cover', height: '400px', width: '300px', scroll: 'auto' }
  if (props.isCorrectChoice) {
    imagePointsBlock = <div className="choice-points valid-choice-points">+{props.score}</div>
  } else if (props.userChoices.includes(props.imageChoice)) {
    imagePointsBlock = <div className="choice-points invalid-choice-points">-1</div>
  } else if (!props.isSolved) {
    imageStyle.cursor = 'pointer'
    onImageClick = function (event) {
      document.getElementById('root').dispatchEvent(
        new CustomEvent('image-selection.reply', { detail: { userChoice: props.imageChoice } }))
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: '34px' }}>
        {choicePointer}
      </div>
      {imagePointsBlock}
      <img className="word-image word-image-letters-selection"
           src={props.imageSrc}
           onClick={onImageClick}
           style={imageStyle} />
    </div>
  )
}

SelectLettersGameWidget.propTypes = {
  currentRound: PropTypes.node.isRequired,
  isSolved: PropTypes.bool
}

function SelectLettersGameWidget (props) {
  const round = props.currentRound
  const correctChoice = round.correct_choice
  const correctImage = [null, round.img1, round.img2, round.img3, round.img4][correctChoice]
  if (props.isSolved) {
    return (
      <img className="word-image  word-image-letters-selection word-image-solved" src={correctImage.src}/>
    )
  } else {
    return (
      <img className="word-image word-image-letters-selection" src={correctImage.src}/>
    )
  }
}

SelectImageGameWidget.propTypes = {
  currentRound: PropTypes.node.isRequired,
  preloadedImages: PropTypes.node.isRequired,
  currentRoundIndex: PropTypes.node.isRequired,
  user: PropTypes.node.isRequired,
  correctChoice: PropTypes.number,
  isSolved: PropTypes.bool,
  score: PropTypes.number,
  soundVolume: PropTypes.number
}

function SelectImageGameWidget (props) {
  const localTerm = props.currentRound.local_term || ''
  const currentRoundIndex = props.currentRoundIndex
  const timeoutBlock = <CurrentRoundTimeoutWidget
    isSolved={props.isSolved} currentRound={props.currentRound}
    isLettersSelection={false} user={props.user}/>
  const localTermLetters = <div className="image-selection-letters" style={{ float: 'left' }}>
    {timeoutBlock} { localTerm }
  </div>
  const userChoices = props.currentRound.solutions[props.user.id].attempts.map(
    (attemptMap) => attemptMap.reply.userChoice)

  let src0, src1, src2, src3
  let pointer0, pointer1, pointer2, pointer3
  if (props.preloadedImages[currentRoundIndex] === undefined) {
    src0 = spinner
    src1 = spinner
    src2 = spinner
    src3 = spinner
  } else {
    src0 = props.preloadedImages[currentRoundIndex][0] === undefined ? spinner : props.preloadedImages[currentRoundIndex][0].img.src
    src1 = props.preloadedImages[currentRoundIndex][1] === undefined ? spinner : props.preloadedImages[currentRoundIndex][1].img.src
    src2 = props.preloadedImages[currentRoundIndex][2] === undefined ? spinner : props.preloadedImages[currentRoundIndex][2].img.src
    src3 = props.preloadedImages[currentRoundIndex][3] === undefined ? spinner : props.preloadedImages[currentRoundIndex][3].img.src

    pointer0 = props.preloadedImages[currentRoundIndex][0] === undefined ? null : props.preloadedImages[currentRoundIndex][0].pointer
    pointer1 = props.preloadedImages[currentRoundIndex][1] === undefined ? null : props.preloadedImages[currentRoundIndex][1].pointer
    pointer2 = props.preloadedImages[currentRoundIndex][2] === undefined ? null : props.preloadedImages[currentRoundIndex][2].pointer
    pointer3 = props.preloadedImages[currentRoundIndex][3] === undefined ? null : props.preloadedImages[currentRoundIndex][3].pointer
  }

  const score0 = props.correctChoice === 1 ? props.score : null
  const score1 = props.correctChoice === 2 ? props.score : null
  const score2 = props.correctChoice === 3 ? props.score : null
  const score3 = props.correctChoice === 4 ? props.score : null

  let voiceButton
  if (props.currentRound.voice_path && props.currentRound.voice_path.src) {
    voiceButton = (
      <button onClick={() => playSound(props.currentRound.voice_path.src, props.soundVolume)}
              style={{ float: 'left', width: '70px', margin: '30px', padding: 0 }}>
        <img src={iconVolume} style={{ padding: 0, height: '35px' }} />
      </button>
    )
  }

  return (
    <table style={{ border: 'none', borderCollapse: 'collapse', cellspacing: 0, cellpadding: 0 }}>
      <tr>
        <td style={{ verticalAlign: 'top' }}>
          <WordImageColumn imageSrc={src0} imageChoice={1} userChoices={userChoices} isCorrectChoice={props.correctChoice === 1} score={score0} isSolved={props.isSolved} choicePointer={pointer0}/>
        </td>
        <td style={{ verticalAlign: 'top' }}>
          <WordImageColumn imageSrc={src1} imageChoice={2} userChoices={userChoices} isCorrectChoice={props.correctChoice === 2} score={score1} isSolved={props.isSolved} choicePointer={pointer1}/>
        </td>
      </tr>
      <tr>
        <td colSpan="2">
          {localTermLetters}{voiceButton}
        </td>
        <td></td>
      </tr>
      <tr>
        <td style={{ verticalAlign: 'top', borderBottom: 'none' }}>
          <WordImageColumn imageSrc={src2} imageChoice={3} userChoices={userChoices} isCorrectChoice={props.correctChoice === 3} score={score2} isSolved={props.isSolved} choicePointer={pointer2}/>
        </td>
        <td style={{ verticalAlign: 'top', borderBottom: 'none' }}>
          <WordImageColumn imageSrc={src3} imageChoice={4} userChoices={userChoices} isCorrectChoice={props.correctChoice === 4} score={score3} isSolved={props.isSolved} choicePointer={pointer3}/>
        </td>
      </tr>
    </table>
  )
};

QuestionLetter.propTypes = {
  letter: PropTypes.node.isRequired,
  isChosen: PropTypes.node.isRequired,
  letterIndex: PropTypes.node.isRequired,
  wordIndex: PropTypes.node.isRequired
}

function QuestionLetter (props) {
  function onClick (e) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent(
        'question-letter.click',
        { detail: { letter: props.letter, wordIndex: props.wordIndex, letterIndex: props.letterIndex } }))
  };

  if (props.isChosen || props.letter === ' ') {
    return (
      <button className="question-letter-button" disabled>
        {props.letter}
      </button>
    )
  } else {
    return (
      <button className="question-letter-button" onClick={onClick}>
        {props.letter}
      </button>
    )
  }
};

ReplyLetter.propTypes = {
  letter: PropTypes.node.isRequired,
  wordIndex: PropTypes.node.isRequired,
  letterIndex: PropTypes.node.isRequired,
  isSolved: PropTypes.node.isRequired,
  isWrongReply: PropTypes.bool
}

function ReplyLetter (props) {
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
      new CustomEvent('reply-letter.remove', eventDetail))
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
         onClick={onRemoveClick}>
      {props.letter}
    </div>
  )
};

class Main extends React.Component {
  constructor (props) {
    super(props)

    // Initial state
    this.state = {
      stateReceived: false,
      versions: {
        backend: '',
        frontend: '',
        images: '',
        translations: '',
        voices: ''
      },
      user: {
        name: null,
        id: null,
        language: null,
        method: IMAGE_SELECTION_METHOD, // user choice [select-image or select-image or select-letters]
        level: 'normal', // user choice [simple/normal/hard]
        topic: null // selected topic.
      },
      challenge: null,
      connection: '',
      languages: [], // all languages.
      topics: [], // all topics of the selected language.
      method: null, // current game method, server choice. May not match to user.method
      mode: null, // train_requested, train, contest_requested, contest_enqueued, contest_accepted
      modeOpened: null, // deprecated. Use uiState instead.
      rounds: [],
      replyMap: {}, // Question letters indexes clicked while replying.
      replyLetters: [], // Letters user clicked while replying (or placeholders if no click)
      currentRound: null,
      status: null, // Status of the current game - new, skipped, failed, solved (in progress mode)
      totalHints: 0, // Amount of hints on that game.
      players: {}, // current round players.
      preloadedImages: {},
      gameError: null,
      gameWarning: null,
      gameLastMessageTime: null, // how many seconds passed from previous game message. Large value means slow connection.
      slowMessageCount: 0, // how many messages were delayed
      slowConnection: false,
      progress: {},
      finishStatusDisplayTimeout: 0,
      replyWaitingTimeout: 0,
      recentActionTime: Date.now(),
      autoplayEnabled: !document.cookie.includes('autoplay=0'),
      soundVolume: parseInt(getCookies().volume || 40),
      voicePlayed: false,
      isDemoGame: false,
      isSharedGame: false,
      sharedGameIsChecked: false, // if current round checked on server side or not.
      ownerId: false, // owner (creator) of the game.
      url: null, // Game url (in case of shared game.)
      id: null, // Game id.
      lettersDisplayTimeout: 0,
      uiState: UI_STATES.init,
      isLoaded: false
    }

    this.nameUpdateTimeout = null
    this.onTrainClick = this.onTrainClick.bind(this)
    this.onSkipClick = this.onSkipClick.bind(this)
    this.saveState = this.saveState.bind(this)
    this.onContestClick = this.onContestClick.bind(this)
    this.onExploreClick = this.onExploreClick.bind(this)
    this.onAcceptClick = this.onAcceptClick.bind(this)
    this.onDeclineClick = this.onDeclineClick.bind(this)
    this.onImageSelectModeSwitchClick = this.onImageSelectModeSwitchClick.bind(this)
    this.startWebsocket = this.startWebsocket.bind(this)
    this.stopWebsocket = this.stopWebsocket.bind(this)
    this.sendMessageWhenOpened = this.sendMessageWhenOpened.bind(this)
    this.runFinishStatusTicker = this.runFinishStatusTicker.bind(this)
    this.runLettersDisplayTimeoutTicker = this.runLettersDisplayTimeoutTicker.bind(this)
    this.runCurrentRoundTimeoutTicker = this.runCurrentRoundTimeoutTicker.bind(this)
    this.onAutoplayToggleClick = this.onAutoplayToggleClick.bind(this)
    this.onVolumeChange = this.onVolumeChange.bind(this)
  }

  sendMessageWhenOpened (message) {
    const self = this
    if (self.state.connection === 'Opened') {
      if (self.websocket.readyState === self.websocket.OPEN) {
        self.websocket.send(JSON.stringify(message))
      } else {
        ;
      }
    } else {
      setTimeout(self.sendMessageWhenOpened, 500, message)
    }
  }

  sendMessage (message) {
    const self = this
    if (self.state.connection === 'Opened') {
      if (self.websocket.readyState === self.websocket.OPEN) {
        self.websocket.send(JSON.stringify(message))
      } else {
        ;
      }
    } else {
      self.startWebsocket()
      self.sendMessageWhenOpened(message)
    }
  }

  startWebsocket () {
    const self = this
    let wsHost = 'ws://' + window.location.host + '/game.ws'
    if (window.location.protocol === 'https:') {
      wsHost = 'wss://' + window.location.host + '/game.ws'
    }
    self.websocket = new WebSocket(wsHost)

    const onMessage = function (event) {
      const message = JSON.parse(event.data)
      if (message.type === 'game') {
        // event.detail.state.rounds
        const messageTime = new Date()
        document.getElementById('root').dispatchEvent(
          new CustomEvent(
            'state.update',
            {
              detail: {
                state: {
                  method: message.payload.method,
                  mode: message.payload.mode,
                  isDemoGame: false, // no way to get demo game on state updated.
                  isSharedGame: false,
                  url: null,
                  players: message.payload.players,
                  rounds: message.payload.rounds,
                  currentRound: message.payload.current_round,
                  status: message.payload.status,
                  totalHints: message.payload.total_hints,
                  gameLastMessageTime: messageTime
                },
                eventType: message.event_type
              }
            }))
      } else if (message.type === 'challenge') {
        document.getElementById('root').dispatchEvent(
          new CustomEvent('challenge', { detail: { user: message.payload.user } }))
      } else if (message.type === 'contest_enqueued') {
        document.getElementById('root').dispatchEvent(
          new CustomEvent('contest_enqueued', { detail: {} }))
      } else if (message.type === 'game_error') {
        document.getElementById('root').dispatchEvent(
          new CustomEvent('game_error', { detail: message.payload }))
      } else if (message.type === 'progress') {
        document.getElementById('root').dispatchEvent(
          new CustomEvent('progress', { detail: message.payload }))
      }
    }
    let intervalID
    const sendPing = function () {
      if (self.websocket.readyState === WebSocket.OPEN) {
        // TODO: Find a native way to send ping.
        self.websocket.send(JSON.stringify({ command: 'ping', payload: '' }))
      } else {
        clearInterval(intervalID)
      }
    }

    self.websocket.onopen = function (evt) {
      intervalID = setInterval(sendPing, 1000 * 30)
      document.getElementById('root').dispatchEvent(new CustomEvent('ws.opened'))
      self.runCurrentRoundTimeoutTicker()
    }

    self.websocket.onclose = function (evt) {
      document.getElementById('root').dispatchEvent(new CustomEvent('ws.closed'))
    }

    self.websocket.onerror = function (evt) {
      document.getElementById('root').dispatchEvent(new CustomEvent('ws.error'))
    }
    self.websocket.onmessage = onMessage
  }

  stopWebsocket () {
    const self = this
    // FIXME: close WS when user leaves the game.
    if (self.websocket != null) {
      self.websocket.close()
    }
  }

  sendChallengeTickEvent () {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('tick-challenge', { detail: {} }))
  }

  saveState () {
    // Saves state to server side.
    const self = this

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(self.state || {})
    }
    fetch('/api/v1/state', requestOptions)
      .then(response => response.json())
      .then(data => {
        ;
      })
  }

  runCurrentRoundTimeoutTicker () {
    const self = this
    let currentRound = {}
    if (self.state.currentRound && self.state.currentRound !== -1) {
      currentRound = self.state.rounds[self.state.currentRound - 1]
    }
    if (currentRound.timeout > 0) {
      document.getElementById('root').dispatchEvent(
        new CustomEvent(
          'round-timeout.tick',
          {
            detail: {
              timeout: currentRound.timeout - 1,
              currentRound: self.state.currentRound
            }
          }))
    }
    setTimeout(self.runCurrentRoundTimeoutTicker, 1000)
  }

  runLettersDisplayTimeoutTicker (seconds) {
    const self = this
    if (seconds > 0) {
      document.getElementById('root').dispatchEvent(
        new CustomEvent('letters-display.tick', { detail: { seconds: seconds - 1 } }))
      setTimeout(self.runLettersDisplayTimeoutTicker, 1000, seconds - 1)
    }
  }

  runFinishStatusTicker (seconds) {
    const self = this
    if (seconds > 0) {
      document.getElementById('root').dispatchEvent(
        new CustomEvent('finish-status.tick', { detail: { seconds: seconds - 1 } }))
      setTimeout(self.runFinishStatusTicker, 1000, seconds - 1)
    }
    if (seconds === 1) {
      // ticker will finish soon. Start new explore game if needed.
      let currentRound = {}
      if (self.state.currentRound && self.state.currentRound !== -1) {
        currentRound = self.state.rounds[self.state.currentRound - 1]
      }
      const currentRoundIsEmpty = Object.keys(currentRound).length === 0
      const secondsFromRecentInteraction = (Date.now() - self.state.recentActionTime) / 1000
      if (self.state.uiState === UI_STATES.skipped || self.state.uiState === UI_STATES.inExplore) {
        if (secondsFromRecentInteraction < 60 && currentRoundIsEmpty) {
          self.sendMessage({ command: 'explore', payload: { user: self.state.user } })
          self.setState(prevState => {
            const newState = _.cloneDeep(prevState)
            newState.recentActionTime = Date.now()
            return newState
          })
        } else {
          self.setState(prevState => {
            const newState = _.cloneDeep(prevState)
            newState.modeOpened = null
            newState.uiState = UI_STATES.init
            return newState
          })
        }
      }
    }
  }

  componentDidMount () {
    const self = this
    let shareId
    let url
    const pathParts = location.pathname.split('/')
    if (pathParts.length === 3 && pathParts.includes('share')) {
      // English share (without language in path)
      shareId = pathParts[2]
      url = '/api/v1/state?share=' + shareId + '&language=en'
    } else if (pathParts.length === 4 && pathParts.includes('share')) {
      // Other languages share.
      shareId = pathParts[3]
      url = '/api/v1/state?share=' + shareId + '&language=' + pathParts[1]
    } else {
      url = '/api/v1/state'
    }

    fetch(url)
      .then(response => response.json())
      .then(json => {
        self.setState(prevState => {
          const newState = _.cloneDeep(prevState)
          newState.languages = json.languages
          newState.topics = json.topics
          newState.user = json.user
          newState.mode = json.mode
          newState.modeOpened = json.mode
          newState.method = json.method
          newState.versions = json.versions
          newState.stateReceived = true
          newState.rounds = json.rounds
          newState.isDemoGame = json.is_demo_game
          newState.isSharedGame = json.is_shared_game
          newState.ownerId = json.owner_id
          newState.url = json.url
          newState.id = json.id
          newState.isLoaded = true
          if (json.mode === 'explore') {
            if (json.rounds.length > 0) {
              newState.uiState = UI_STATES.exploring
            } else {
              newState.uiState = UI_STATES.inExplore
            }
          } else if (json.is_demo_game) {
            newState.uiState = UI_STATES.demo
          }
          newState.currentRound = json.current_round
          const currentRoundObj = newState.rounds[newState.currentRound - 1]
          const word = currentRoundObj.question[0] // FIXME: Use string instead of list of strings
          const replyLetters = word.split('').map((elem) => elem === ' ' ? ' ' : '?')
          newState.replyMap = {}
          newState.replyLetters = [replyLetters.join('')]
          // FIXME: Add state.

          if (newState.mode == null) {
            self.stopWebsocket()
          } else if (newState.uiState === UI_STATES.demo) {
            self.stopWebsocket()
          } else {
            self.startWebsocket()
          }
          return newState
        })
      })

    // Start WS only on game start.
    // FIXME: Uncomment.
    // self.syncGame();

    // Events listeners.
    //

    document.getElementById('root').addEventListener('connection.slow-message', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        if (prevState.slowMessageCount > 5) {
          newState.gameWarning = {
            message: 'Your connection is too slow or site has problems. Please refresh page.'
          }
          newState.slowConnection = true
        } else {
          newState.slowMessageCount = prevState.slowMessageCount + 1
        }
        return newState
      })
    })

    document.getElementById('root').addEventListener('ws.error', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.connection = 'error'
        return newState
      })
    })

    document.getElementById('root').addEventListener('ws.closed', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.connection = 'closed'
        return newState
      })
    })

    document.getElementById('root').addEventListener('ws.opened', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.connection = 'Opened'
        return newState
      })
    })

    document.getElementById('root').addEventListener('game.help', function (event) {
      self.sendMessage({
        command: 'help',
        payload: {}
      })
    })

    document.getElementById('root').addEventListener('letters-display.tick', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.lettersDisplayTimeout = event.detail.seconds
        return newState
      })
    })

    document.getElementById('root').addEventListener('finish-status.tick', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.finishStatusDisplayTimeout = event.detail.seconds
        return newState
      })
    })

    document.getElementById('root').addEventListener('round-timeout.tick', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.rounds[event.detail.currentRound - 1].timeout = event.detail.timeout
        return newState
      })
    })

    document.getElementById('root').addEventListener('error.close', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.gameError = null
        newState.mode = null
        newState.method = null
        return newState
      })
    })

    document.getElementById('root').addEventListener('game.leave', function (event) {
      self.sendMessage({
        command: 'leave',
        payload: {
          user: self.state.user
        }
      })
      // It may handle only client side specific state. Server side state should be handled by server.
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.modeOpened = null
        newState.uiState = UI_STATES.leaveRequested
        return newState
      })
    })

    document.getElementById('root').addEventListener('challenge', function (event) {
      setTimeout(self.sendChallengeTickEvent, 1000)
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)

        newState.challenge = {
          user: event.detail.user,
          timeout: 10
        }
        return newState
      })
    })

    document.getElementById('root').addEventListener('voice.played', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.voicePlayed = true
        return newState
      })
    })

    document.getElementById('root').addEventListener('image-selection.reply', function (event) {
      self.sendMessage({
        command: 'reply',
        method: IMAGE_SELECTION_METHOD,
        payload: { userChoice: event.detail.userChoice }
      })

      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.recentActionTime = Date.now()
        return newState
      })
    })

    document.getElementById('root').addEventListener('image.load', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        if (newState.preloadedImages[event.detail.roundIndex] === undefined) {
          newState.preloadedImages[event.detail.roundIndex] = {}
        }
        newState.preloadedImages[event.detail.roundIndex][event.detail.imageIndex] = {
          img: event.detail.img,
          pointer: event.detail.imageMap.pointer
        }
        return newState
      })
    })

    document.getElementById('root').addEventListener('contest_enqueued', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.mode = 'contest_enqueued'
        return newState
      })
    })

    document.getElementById('root').addEventListener('game_error', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.gameError = event.detail
        return newState
      })
    })

    document.getElementById('root').addEventListener('progress', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.progress = event.detail
        return newState
      })
    })

    document.getElementById('root').addEventListener('tick-challenge', function (event) {
      if (self.state.challenge == null) {
        ;
      } else {
        self.setState(prevState => {
          const newState = _.cloneDeep(prevState)
          const currentTimeout = newState.challenge.timeout

          if (currentTimeout === 1) {
            newState.challenge = null
          } else {
            newState.challenge.timeout -= 1
            setTimeout(self.sendChallengeTickEvent, 1000)
          }
          return newState
        })
      }
    })

    document.getElementById('root').addEventListener('state.update', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.players = event.detail.state.players
        newState.rounds = event.detail.state.rounds
        newState.currentRound = event.detail.state.currentRound
        newState.status = event.detail.state.status
        newState.totalHints = event.detail.state.totalHints
        newState.isDemoGame = event.detail.state.isDemoGame
        newState.isSharedGame = event.detail.state.isSharedGame
        newState.sharedGameIsChecked = event.detail.state.sharedGameIsChecked
        newState.ownerId = event.detail.state.ownerId
        newState.url = event.detail.state.url
        newState.id = event.detail.state.id
        newState.mode = event.detail.state.mode
        newState.method = event.detail.state.method
        newState.gameLastMessageTime = event.detail.state.gameLastMessageTime

        if (event.detail.eventType === 'start' && event.detail.state.mode === 'train') {
          newState.uiState = UI_STATES.training
        } else if (event.detail.eventType === 'start' && event.detail.state.mode === 'explore') {
          if (event.detail.state.isSharedGame) {
            // This is for start from share page.
            let indexUrl
            const userLanguage = newState.user.language
            if (userLanguage === 'en') {
              indexUrl = document.location.protocol + '//' + document.location.host
            } else {
              indexUrl = document.location.protocol + '//' + document.location.host + '/' + userLanguage
            }
            window.open(indexUrl, '_self')
          }
          newState.uiState = UI_STATES.exploring
        } else if (event.detail.eventType === 'train_leave') {
          newState.uiState = UI_STATES.inTrain
        } else if (event.detail.eventType === 'explore_leave') {
          newState.uiState = UI_STATES.init
          newState.mode = null
          newState.modeOpened = null
          newState.method = null
        } else if (event.detail.eventType === 'explore_skip') {
          newState.uiState = UI_STATES.skipped
        }

        const roundOrMethodChanged = event.detail.eventType === 'round_changed' || event.detail.eventType === 'method_changed' || event.detail.eventType === 'start'

        if (newState.currentRound === -1) {
          newState.replyLetters = []
          newState.replyMap = {}
          newState.preloadedImages = {}
          newState.gameLastMessageTime = null
          if (['explore', 'train'].includes(prevState.modeOpened) && prevState.currentRound > -1 && prevState.finishStatusDisplayTimeout === 0) {
            // WS message just after game finish.
            // WTF? It should be much simpler!
            self.runFinishStatusTicker(4)
            if (prevState.uiState === UI_STATES.exploring) {
              newState.uiState = UI_STATES.inExplore
            }
          }
        } else if (roundOrMethodChanged) {
          // Round changed. Show ? for every letter of the question.
          newState.voicePlayed = false
          const currentRound = newState.rounds[newState.currentRound - 1]
          if (newState.preloadedImages[newState.currentRound - 1] === undefined) {
            if (currentRound.img1 !== null) {
              preloadImage(newState.currentRound - 1, 0, currentRound.img1)
            }
            if (currentRound.img2 !== null) {
              preloadImage(newState.currentRound - 1, 1, currentRound.img2)
            }
            if (currentRound.img3 !== null) {
              preloadImage(newState.currentRound - 1, 2, currentRound.img3)
            }
            if (currentRound.img4 !== null) {
              preloadImage(newState.currentRound - 1, 3, currentRound.img4)
            }
          } else {
            if (newState.preloadedImages[newState.currentRound - 1][0] === undefined) {
              // TODO: Clean that hell.
              if (currentRound.img1 !== null) {
                preloadImage(newState.currentRound - 1, 0, currentRound.img1)
              }
            }
            if (newState.preloadedImages[newState.currentRound - 1][1] === undefined) {
              if (currentRound.img2 !== null) {
                preloadImage(newState.currentRound - 1, 1, currentRound.img2)
              }
            }
            if (newState.preloadedImages[newState.currentRound - 1][2] === undefined) {
              if (currentRound.img3 !== null) {
                preloadImage(newState.currentRound - 1, 2, currentRound.img3)
              }
            }
            if (newState.preloadedImages[newState.currentRound - 1][3] === undefined) {
              if (currentRound.img4 !== null) {
                preloadImage(newState.currentRound - 1, 3, currentRound.img4)
              }
            }
          }

          const nextRound = newState.rounds[newState.currentRound]
          if (nextRound === undefined) {
            ;
          } else {
            // preload next round images.
            if (nextRound.img1 !== null) {
              preloadImage(newState.currentRound, 0, nextRound.img1)
            }
            if (nextRound.img2 !== null) {
              preloadImage(newState.currentRound, 1, nextRound.img2)
            }
            if (nextRound.img3 !== null) {
              preloadImage(newState.currentRound, 2, nextRound.img3)
            }
            if (nextRound.img4 !== null) {
              preloadImage(newState.currentRound, 3, nextRound.img4)
            }
          }
          const word = currentRound.question[0] // FIXME: Use string instead of list of strings
          const replyLetters = word.split('').map((elem) => elem === ' ' ? ' ' : '?')
          newState.replyMap = {}
          newState.replyLetters = [replyLetters.join('')]
          if (newState.method === LETTERS_SELECTION_METHOD) {
            self.runLettersDisplayTimeoutTicker(LETTERS_DISPLAY_TIMEOUT)
          }
        } else {
          const currentRound = newState.rounds[newState.currentRound - 1]
          const stateUserHints = self.state.rounds[newState.currentRound - 1].solutions[newState.user.id].hints
          const newStateUserHints = currentRound.solutions[newState.user.id].hints || []
          const word = currentRound.question[0] // FIXME: Use string instead of list of strings

          if (stateUserHints.length !== newStateUserHints.length) {
            newState.replyMap = {}
            if (newStateUserHints.length > 0) {
              // show hint.
              const replyLetters = word.split('').map((elem) => elem === ' ' ? ' ' : '?')

              const lastHintArray = newStateUserHints[newStateUserHints.length - 1]

              for (let i = 0; i < currentRound.question.length; ++i) {
                const mappedIndexes = []
                const questionWord = currentRound.question[i]
                for (let j = 0; j < lastHintArray.length; ++j) {
                  // For every hint find appropriate letter and add to reply map.
                  for (let n = 0; n < questionWord.length; ++n) {
                    if (questionWord[n] === lastHintArray[j][1] && !mappedIndexes.includes(n)) {
                      // match found, add as reply
                      newState.replyMap[pair(0, j)] = pair(0, n)
                      replyLetters[lastHintArray[j][0]] = lastHintArray[j][1]
                      mappedIndexes.push(n)
                      break
                    }
                  }
                }
              }
              newState.replyLetters = [replyLetters.join('')]
            }
          }
        }
        return newState
      })
    })

    document.getElementById('root').addEventListener('method-changed', function (event) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name: self.state.user.name,
            language: self.state.user.language,
            level: self.state.user.level,
            topic: self.state.user.topic,
            method: event.detail.method
          }
        })
      }
      fetch('/api/v1/state', requestOptions)
        .then(response => response.json())
        .then(data => {
          self.setState(prevState => {
            const newState = _.cloneDeep(prevState)
            newState.topics = data.topics
            newState.user.language = data.user.language
            newState.user.name = data.user.name
            newState.user.method = data.user.method
            newState.user.topic = data.topics[0].code
            newState.rounds = data.rounds || []
            newState.mode = data.mode
            newState.method = data.method
            newState.players = data.players
            newState.currentRound = data.currentRound
            return newState
          })
        })
    })

    document.getElementById('root').addEventListener('share-create', function (event) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // it will create share from current round.
      }
      fetch('/api/v1/shares', requestOptions)
        .then(response => response.json())
        .then(data => {
          const shareURL = document.location.protocol + '//' + document.location.host + data.url
          window.open(shareURL, '_blank')
        })
    })

    document.getElementById('root').addEventListener('level-changed', function (event) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            id: self.state.user.id,
            name: self.state.user.name,
            language: self.state.user.language,
            level: event.detail.level,
            topic: self.state.user.topic,
            method: self.state.user.method
          }
        })
      }
      fetch('/api/v1/state', requestOptions)
        .then(response => response.json())
        .then(data => {
          self.setState(prevState => {
            const newState = _.cloneDeep(prevState)
            newState.topics = data.topics
            newState.user.language = data.user.language
            newState.user.name = data.user.name
            newState.user.method = data.user.method
            newState.user.level = data.user.level
            newState.user.topic = data.topics[0].code
            newState.rounds = data.rounds || []
            newState.mode = data.mode
            newState.method = data.method
            newState.players = data.players
            newState.currentRound = data.currentRound
            return newState
          })
        })
    })

    document.getElementById('root').addEventListener('language-changed', function (event) {
      if (event.detail.language === 'en') {
        window.history.pushState('/', 'Title', '/')
      } else {
        window.history.pushState('/' + event.detail.language, 'Title', '/' + event.detail.language)
      }
      window.location.reload(true)
    })

    document.getElementById('root').addEventListener('name-changed', function (event) {
      // Updates username

      // Update state and send to server side.
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.user.name = event.detail.name
        clearTimeout(self.nameUpdateTimeout)
        self.nameUpdateTimeout = setTimeout(self.saveState, 2000)
        return newState
      })
    })

    document.getElementById('root').addEventListener('autoplay-enabled', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.autoplayEnabled = true
        setCookie('autoplay', '1')
        return newState
      })
    })

    document.getElementById('root').addEventListener('autoplay-disabled', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.autoplayEnabled = false
        setCookie('autoplay', '0')
        return newState
      })
    })

    document.getElementById('root').addEventListener('contest-clicked', function (event) {
      // FIXME:
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        if (newState.modeOpened === 'contest') {
          newState.mode = 'contest_requested'
          // We always send user in payload because server may loose initial state once (on
          // backend restart for example).
          self.sendMessage({ command: 'contest', payload: { user: newState.user } })
        } else {
          newState.modeOpened = 'contest'
        }
        return newState
      })
    })

    document.getElementById('root').addEventListener('game.skip', function (event) {
      self.sendMessage({ command: 'skip', payload: {} })
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.uiState = UI_STATES.skipRequested
        self.runFinishStatusTicker(4)
        return newState
      })
    })

    document.getElementById('root').addEventListener('train-clicked', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        if (newState.modeOpened === 'train') {
          newState.mode = 'train_requested'
          newState.uiState = UI_STATES.trainRequested
          // We always send user in payload because server may loose initial state once (on
          // backend restart for example).
          self.sendMessage({ command: 'train', payload: { user: newState.user } })
        } else {
          newState.modeOpened = 'train'
          newState.uiState = UI_STATES.inTrain
        }
        return newState
      })
    })

    document.getElementById('root').addEventListener('explore-start', function (event) {
      // FIXME:
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.mode = 'explore_requested'
        newState.modeOpened = 'explore'
        newState.uiState = UI_STATES.exploreRequested
        // We always send user in payload because server may loose initial state once (on
        // backend restart for example).
        self.sendMessage({
          command: 'explore',
          payload: {
            user: newState.user,
            topic_set: event.detail.topicSet
          }
        })
        return newState
      })
    })

    // new CustomEvent('challenge-accepted', {detail: {}}));
    document.getElementById('root').addEventListener('force-image-select-method', function (event) {
      self.sendMessage({ command: 'force-image-select-method', payload: { } })
    })

    document.getElementById('root').addEventListener('challenge-accepted', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.challenge = null
        newState.currentRound = -1
        newState.replyLetters = []
        newState.replyMap = {}
        newState.preloadedImages = {}
        self.sendMessage({ command: 'challenge-accept', payload: {} })
        return newState
      })
    })

    document.getElementById('root').addEventListener('challenge-declined', function (event) {
      self.sendMessage({
        command: 'challenge-decline',
        payload: {}
      })
    })

    document.getElementById('root').addEventListener('topic-changed', function (event) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            topic: event.detail.topic,
            language: self.state.user.language,
            level: self.state.user.level,
            name: self.state.user.name,
            method: self.state.user.method,
            id: self.state.user.id
          }
        })
      }
      fetch('/api/v1/state', requestOptions)
        .then(response => response.json())
        .then(data => {
          self.setState(prevState => {
            const newState = _.cloneDeep(prevState)
            newState.user.topic = data.user.topic
            return newState
          })
        })
    })

    document.getElementById('root').addEventListener('volume-changed', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.soundVolume = event.detail.volume
        setCookie('volume', newState.soundVolume)
        return newState
      })
    })

    document.getElementById('root').addEventListener('reply-letter.remove', function (event) {
      // FIXME: Send to server
      // update-state
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        const replyWordIndex = event.detail.wordIndex
        const replyLetterIndex = event.detail.letterIndex
        const replyWordLetters = newState.replyLetters[replyWordIndex]
        const replyWordArray = replyWordLetters.split('')
        replyWordArray[replyLetterIndex] = '?'
        newState.replyLetters[replyWordIndex] = replyWordArray.join('')

        // Drop removed indexes.
        newState.replyMap[pair(replyWordIndex, replyLetterIndex)] = null
        newState.sharedGameIsChecked = false
        return newState
      })
    })

    document.getElementById('root').addEventListener('question-letter.click', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        const wordIndex = event.detail.wordIndex
        const letterIndex = event.detail.letterIndex
        const letter = event.detail.letter
        const replyWordLetters = newState.replyLetters[wordIndex]
        const indexToReplace = replyWordLetters.indexOf('?')
        const updatedReplyWordLetters = replyWordLetters.replace('?', letter)
        newState.replyLetters[wordIndex] = updatedReplyWordLetters
        newState.replyMap[pair(wordIndex, indexToReplace)] = pair(wordIndex, letterIndex)
        newState.recentActionTime = Date.now()

        // If all letters entered send to server side.
        let containsQuestionMark = false
        for (let i = 0; i < newState.replyLetters.length; ++i) {
          const word = newState.replyLetters[i]
          if (word.includes('?')) {
            containsQuestionMark = true
            break
          }
        }
        if (!containsQuestionMark) {
          if (prevState.uiState === UI_STATES.demo) {
            // FIXME: take share language from state
            if (prevState.isSharedGame) {
              // Ask server side.
              const pathParts = location.pathname.split('/')
              let shareLanguage
              if (pathParts.length === 4) {
                // Other languages share.
                shareLanguage = pathParts[1]
              } else {
                // English share (without language in path)
                shareLanguage = 'en'
              }
              const reply = {
                letters: newState.replyLetters,
                language: shareLanguage
              }

              const requestOptions = {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reply)
              }
              fetch('/api/v1/shares/' + newState.id, requestOptions)
                .then(response => response.json())
                .then(data => {
                  if (Object.values(data.rounds[0].solutions)[0].is_solved && window.ConfettiPage) {
                    window.ConfettiPage.play()
                  }
                  document.getElementById('root').dispatchEvent(
                    new CustomEvent(
                      'state.update',
                      {
                        detail: {
                          state: {
                            method: data.method,
                            mode: data.mode,
                            isDemoGame: data.is_demo_game,
                            isSharedGame: data.is_shared_game,
                            sharedGameIsChecked: true,
                            ownerId: data.owner_id,
                            url: data.url,
                            id: data.id,
                            players: data.players,
                            rounds: data.rounds,
                            currentRound: data.current_round,
                            status: data.status,
                            totalHints: data.total_hints
                            // gameLastMessageTime: messageTime
                          }
                        }
                      }))
                })
              /*
              newState.mode = 'explore_requested'
              newState.modeOpened = 'explore'
              newState.uiState = UI_STATES.exploreRequested
              // We always send user in payload because server may loose initial state once (on
              // backend restart for example).
              self.sendMessage({ command: 'explore', payload: { user: newState.user } })
              */
            } else {
              // compare on client side.
              const replyLetters = newState.replyLetters[0]
              const localTerm = newState.rounds[0].local_term

              if (replyLetters === localTerm) {
                newState.status = 'solved'
                newState.rounds[0].solutions[newState.user.id].attempts = [
                  {
                    time: 'FIXME:',
                    reply: {
                      letters: replyLetters
                    }
                  }
                ]
                newState.rounds[0].solutions[newState.user.id].is_solved = true
                if (window.ConfettiPage) {
                  window.ConfettiPage.play()
                }
              } else {
                newState.status = 'failed'
                newState.rounds[0].solutions[newState.user.id].attempts = [
                  {
                    time: 'FIXME:',
                    reply: {
                      letters: replyLetters
                    }
                  }
                ]
                newState.rounds[0].solutions[newState.user.id].is_solved = false
              }
            }
          } else {
            self.sendMessage({
              command: 'reply',
              payload: {
                letters: newState.replyLetters
              }
            })
          }
        }
        return newState
      })
    })
  }

  componentWillUnmount () {
    ;
    // clearInterval(this.timerID);
  }

  handleMethodChange (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('method-changed', { detail: { method: event.target.value } }))
  }

  handleCreateShareButtonClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('share-create', {}))
  }

  handleLevelChange (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('level-changed', { detail: { level: event.target.value } }))
  }

  handleLanguageChange (event) {
    // Leave should go first to use language before changed.
    document.getElementById('root').dispatchEvent(
      new CustomEvent('game.leave', { detail: {} }))

    document.getElementById('root').dispatchEvent(
      new CustomEvent('language-changed', { detail: { language: event.target.value } }))
  }

  handleNameChange (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('name-changed', { detail: { name: event.target.value } }))
  }

  onTrainClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('train-clicked', { detail: {} }))
  }

  onSkipClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('game.skip', { detail: {} }))
  }

  onContestClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('contest-clicked', { detail: {} }))
  }

  onAutoplayToggleClick (event) {
    if (event.target.checked) {
      document.getElementById('root').dispatchEvent(
        new CustomEvent('autoplay-enabled', { detail: {} }))
    } else {
      document.getElementById('root').dispatchEvent(
        new CustomEvent('autoplay-disabled', { detail: {} }))
    }
  }

  onVolumeChange (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('volume-changed', { detail: { volume: event.target.valueAsNumber } }))
  }

  onExploreClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('explore-start', { detail: {} }))
  }

  onAcceptClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('challenge-accepted', { detail: {} }))
  }

  onImageSelectModeSwitchClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('force-image-select-method', { detail: {} }))
  }

  onDeclineClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('challenge-declined', { detail: {} }))
  }

  handleTopicChange (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('topic-changed', { detail: { topic: event.target.value } }))
  }

  getHelp (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('game.help', { detail: {} }))
  }

  leave (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('game.leave', { detail: {} }))
  }

  onErrorClose (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('error.close', { detail: {} }))
  }

  render () {
    const self = this
    // console.log('Before render.', self.state)
    // First of all hide landing preview (used to generate previews for messengers)

    if (!self.state.isLoaded) {
      // No data from api yet.
      return null
    }
    const userLanguage = self.state.user.language || 'en'
    const versions = 'Backend: ' + self.state.versions.backend +
      ', Frontend: ' + self.state.versions.frontend +
      ', Translations: ' + self.state.versions.translations +
      ', Images: ' + self.state.versions.images +
      ', Voices: ' + self.state.versions.voices

    const languageOptionItems = self.state.languages
      .map((language) => <option key={language.code} value={language.code}>{language.local_name}</option>)

    // Parts not visible on shared game.
    let volumeColumn, autoplayColumn, usernameInput,
      languageColumn, warningRow

    if (!self.state.isSharedGame) {
      autoplayColumn = (
        <div className="column">
          <label htmlFor="autoplay-toggle-checkbox" style={{ float: 'right' }} title={trn(userLanguage, 'Autoplay site sounds')}>
            {trn(userLanguage, 'Autoplay')}
            <input id="autoplay-toggle-checkbox" type="checkbox" checked={self.state.autoplayEnabled} onClick={this.onAutoplayToggleClick}/>
          </label>
        </div>
      )

      volumeColumn = (
        <div className="column">
          <input type="range"
                 style={{ float: 'left' }}
                 id="volume"
                 name="volume" min="0" max="100"
                 defaultValue={self.state.soundVolume}
                 onChange={this.onVolumeChange}/>
        </div>
      )

      usernameInput = (
        <div>
          <input type="text" placeholder="Username"
                 value={self.state.user.name}
                 onChange={self.handleNameChange}
                 style={{ color: 'white' }}>
          </input>
        </div>
      )

      languageColumn = (
        <div className="column">
          <select id="language" style={{ backgroundColor: '#282c34' }} value={self.state.user.language} onChange={self.handleLanguageChange}>
            <option value="">---</option>
            {languageOptionItems}
          </select>
        </div>
      )

      warningRow = (
        <div className="row" style={{ fontSize: '25px', color: 'orange' }}>
          {trn(userLanguage, 'Warning: this is alpha version of the app. Please be ready to lose your progress in explore mode once. Sorry for inconvenience.')}
        </div>
      )
    }

    const header = (
      <div className="row">
        <div className="column">
          <img style={{ float: 'left', padding: '5px' }} src={ logo } alt="Logo" title={versions}/>
        </div>
        {autoplayColumn}
        {volumeColumn}
        {languageColumn}
      </div>)

    if (self.state.connection === 'closed') {
      return (
        <div className="container">
          <br />
          {header}
          <div className="row">
            <div className="column">
              <div style={{ fontSize: '45px' }}>Connection closed. Please refresh the page.</div>
            </div>
          </div>
        </div>
      )
    } else if (!self.state.stateReceived) {
      return (
        <div className="container">
          <br />
          {header}
          <div className="row">
            <div className="column">
              <div style={{ fontSize: '45px' }}></div>
            </div>
          </div>
        </div>
      )
    } else if (self.state.connection === 'error') {
      return (
        <div className="container">
          <br />
          {header}
          <div className="row">
            <div className="column">
              <div style={{ fontSize: '45px' }}>
                Connection error. Please refresh the page.
              </div>
            </div>
          </div>
        </div>)
    }

    let finishedRounds
    if (self.state.currentRound === -1) {
      finishedRounds = self.state.rounds || []
    } else {
      finishedRounds = self.state.rounds.slice(0, self.state.currentRound - 1)
    }

    let finishStatusBlock
    let finishStatus

    if (self.state.finishStatusDisplayTimeout > 0) {
      // FIXME: cache scores somewhere for that case. We do not need to recompute because
      // round is finished.
      const allPlayersScores = getPlayersScores(self.state.players, finishedRounds)
      const userScores = allPlayersScores[self.state.user.id]

      if (self.state.uiState === UI_STATES.skipped || self.state.uiState === UI_STATES.skipRequested) {
        finishStatusStyle.border = '3px solid red'
        finishStatus = trn(
          userLanguage,
          'Game skipped. Starting the next game in {seconds} seconds.',
          { seconds: self.state.finishStatusDisplayTimeout })
        finishStatusBlock = <div style={finishStatusStyle}>
          {finishStatus}
        </div>
      } else if (self.state.method === IMAGE_SELECTION_METHOD) {
        finishStatusStyle.border = '3px solid green'
        finishStatus = trn(
          userLanguage,
          'Good, but letters selection mode is required to pass. Starting the same game in {seconds} seconds.',
          { seconds: self.state.finishStatusDisplayTimeout })
        finishStatusBlock = <div style={finishStatusStyle}>
          {finishStatus}
        </div>
      } else if (Object.keys(self.state.rounds[0].solutions).length === 1) {
        // FIXME: Too dirty. Refactor!
        // Single player mode (train/progress)
        let scorePercent = 0
        if (userScores.all.length > 0) {
          const totalPossible = 5 * userScores.all.length
          scorePercent = (userScores.total / totalPossible) * 100
        }

        if (self.state.uiState === UI_STATES.inExplore) {
          if (self.state.totalHints > 3) {
            finishStatus = trn(
              userLanguage,
              'Too many hints. Starting the same game in {seconds} seconds.',
              { seconds: self.state.finishStatusDisplayTimeout })
            finishStatusStyle.border = '3px solid red'
          } else {
            finishStatusStyle.border = '3px solid green'
            finishStatus = trn(
              userLanguage,
              'Amazing. The next game will start in {seconds} seconds.',
              { seconds: self.state.finishStatusDisplayTimeout })
          }
        } else {
          if (scorePercent >= 98) {
            finishStatus = trn(userLanguage, 'Amazing')
          } else if (scorePercent >= 80) {
            finishStatus = trn(userLanguage, 'Very well')
          } else if (scorePercent >= 60) {
            finishStatus = trn(userLanguage, 'Well')
          } else {
            finishStatus = trn(userLanguage, 'So bad. You can do better!')
          }
        }
      } else {
        // FIXME: Add you lost.
        finishStatus = trn(userLanguage, 'You won!')
      }
      finishStatusBlock = <div style={finishStatusStyle}>
        {finishStatus}
      </div>
    }

    let splittedLettersItems

    let isSolved
    let currentRound = {}

    if (self.state.isDemoGame) {
      // for share game solving means there is at least one user who solved.
      if (self.state.uiState === UI_STATES.demo) {
        currentRound = self.state.rounds[self.state.currentRound - 1]
        isSolved = Object.values(currentRound.solutions)
          .some((userSolution) => userSolution.is_solved)
      }
    } else if (self.state.currentRound && self.state.currentRound !== -1) {
      currentRound = self.state.rounds[self.state.currentRound - 1]
      isSolved = currentRound.solutions[self.state.user.id].is_solved
    }
    const currentRoundNotEmpty = Object.keys(currentRound).length > 0

    let replyLetterItems = []
    if (currentRoundNotEmpty && self.state.method === LETTERS_SELECTION_METHOD) {
      // New responsive implementation
      // FIXME: handle currentRound.question as string instead of list of words.

      const attempts = currentRound.solutions[self.state.user.id].attempts
      replyLetterItems = replyLettersToRow(
        self.state.replyLetters[0], isSolved, attempts,
        self.state.isDemoGame, self.state.isSharedGame,
        self.state.sharedGameIsChecked)

      const splittedLetters = [[]]
      const words = currentRound.question[0]
      for (let letterIndex = 0; letterIndex < words.length; ++letterIndex) {
        if (words[letterIndex] === ' ') {
          splittedLetters.push([])
        } else {
          splittedLetters[splittedLetters.length - 1].push([letterIndex, words[letterIndex]])
        }
      }

      const replyMap = self.state.replyMap || {}
      // const replyMap = { '0,0': '0,6', '0,1': '0,3', '0,2': '0,5', '0,3': '0,1', '0,4': '0,0', '0,5': '0,4' }
      const chosenQueryIndexes = Object.values(replyMap)

      const questionLettersTables = []

      for (let i = 0; i < splittedLetters.length; ++i) {
        questionLettersTables.push(questionLettersToTable(
          splittedLetters[i], chosenQueryIndexes, self.state.lettersDisplayTimeout))
      }

      const letterItems1 = questionLettersTables
        .map((divGroup, index) => <td key={index} style={{ verticalAlign: 'top', display: 'inline-block', borderBottom: 0 }}>{divGroup}</td>)

      splittedLettersItems = (
        <table>
          <tr>
            {letterItems1}
          </tr>
        </table>
      )
    };

    let contextBlock

    if (currentRound.context != null && currentRound.context !== '') {
      contextBlock = (
        <div className="row">
          <span style={{ fontSize: '34px' }}>
            ({currentRound.context_value || currentRound.context})
          </span>
        </div>)
    }

    let gameWarningBlock

    if (self.state.gameWarning !== null) {
      gameWarningBlock = (
        <div style={warningBlockStyle}>
          <div>
            {self.state.gameWarning.message}
          </div>
        </div>)
    }

    let gameErrorBlock
    if (self.state.gameError != null) {
      gameErrorBlock = (
        <div style={errorBlockStyle}>
          <div style={{ height: '10px' }}>
            <a style={{ top: 0, position: 'absolute', right: 0 }} href="#" onClick={self.onErrorClose}>x</a>
          </div>
          <div>
            {self.state.gameError.message}. ({self.state.gameError.error_id})
          </div>
        </div>)
    }

    // const languages = ['dig','os','ru','en'];
    // FIXME: Move to server side.
    const methodOptionItems = methods
      .map((method) => <option key={method} value={method}>{trn(userLanguage, method)}</option>)

    const levelOptionItems = levels
      .map((level) => <option key={level} value={level}>{trn(userLanguage, level)}</option>)

    const topicOptionItems = self.state.topics
      .map((topic) => <option key={topic.code} value={topic.code}>{topic.local_name}</option>)

    let challengeBlock

    let buttonsBlock

    let imageSelectModeSwitchButton

    const buttonStyle = { marginRight: '5px', float: 'left' }

    if (self.state.method === LETTERS_SELECTION_METHOD && self.state.uiState === UI_STATES.exploring) {
      imageSelectModeSwitchButton = <button onClick={self.onImageSelectModeSwitchClick} title={trn(userLanguage, 'Image selection')} style={ buttonStyle } >
        <img src={iconSelectImage} style={{ padding: 0, height: '35px' }}/>
      </button>
    }

    if (self.state.challenge) {
      challengeBlock = (
        <div className="row">
          {self.state.challenge.user.name} is challenging you!
          <button onClick={self.onAcceptClick}>Accept</button>
          (ignore to decline) ({self.state.challenge.timeout})
        </div>)
    }

    if (self.state.uiState === UI_STATES.inTrain) {
      buttonsBlock = (
        <div className="column">
          <button onClick={self.leave} title={trn(userLanguage, 'Leave')} style={ buttonStyle }>
            <img src={iconLeave} style={{ padding: 0, height: '35px' }}/>
          </button>
        </div>
      )
    } else if (self.state.uiState === UI_STATES.contesting) {
      buttonsBlock = (
        <div className="column">
          <button onClick={self.leave} title={trn(userLanguage, 'Leave')} style={ buttonStyle }>
            <img src={iconLeave} style={{ padding: 0, height: '35px' }}/>
          </button>
        </div>)
    } else if (self.state.uiState === UI_STATES.training) {
      buttonsBlock = (
        <div className="column">
          <button onClick={self.leave} title={trn(userLanguage, 'Leave')} style={ buttonStyle }>
            <img src={iconLeave} style={{ padding: 0, height: '35px' }}/>
          </button>
        </div>)
    } else if (self.state.uiState === UI_STATES.contestEnqueued) {
      buttonsBlock = (
        <div className="column">
          <button onClick={self.leave} title={trn(userLanguage, 'Leave')} style={ buttonStyle }>
            <img src={iconLeave} style={{ padding: 0, height: '35px' }}/>
            <img src={spinner} alt="Spinner" />
          </button>
        </div>)
    } else if (self.state.uiState === UI_STATES.exploreRequested) {
      buttonsBlock = (
        <div className="column">
          <button id="explore" onClick={self.leave} title={trn(userLanguage, 'Explore')} style={ buttonStyle }>
            {trn(userLanguage, 'Explore')}
            <img src={spinner} alt="Spinner" />
          </button>
        </div>)
    } else if (self.state.uiState === UI_STATES.skipped) {
      buttonsBlock = (
        <div className="column">
          <button id="leave" onClick={self.leave} title={trn(userLanguage, 'Leave')} style={ buttonStyle }>
            <img src={iconLeave} style={{ padding: 0, height: '35px' }}/>
          </button>
        </div>)
    } else if (self.state.uiState === UI_STATES.inExplore) {
      buttonsBlock = (
        <div className="column">
          <button id="leave" onClick={self.leave} title={trn(userLanguage, 'Leave')} style={ buttonStyle }>
            <img src={iconLeave} style={{ padding: 0, height: '35px' }} />
          </button>

          <button onClick={self.handleCreateShareButtonClick}
                  title={trn(userLanguage, 'Create share')}
                  style={{ float: 'left', width: '70px', margin: 0, padding: 0 }}>
            <img src={iconShare} style={{ padding: 0, height: '35px' }} />
          </button>
          {/*
          <button id="skip" onClick={self.onSkipClick} style={ buttonStyle } title={trn(userLanguage, 'Skip')}>
            <img src={iconSkip} style={{ padding: 0, height: '35px' }} />
          </button>
          */}
        </div>)
    } else if (self.state.uiState === UI_STATES.exploring) {
      if (self.state.status !== 'skipped') {
        buttonsBlock = (
          <div className="column">
            <button id="leave" onClick={self.leave} title={trn(userLanguage, 'Leave')} style={ buttonStyle }>
              <img src={iconLeave} style={{ padding: 0, height: '35px' }}/>
            </button>
            {/*
            <button id="skip" onClick={self.onSkipClick} style={ buttonStyle } title={trn(userLanguage, 'Skip')}>
              <img src={iconSkip} style={{ padding: 0, height: '35px' }} />
            </button>
            */}
            {imageSelectModeSwitchButton}
            <button onClick={self.handleCreateShareButtonClick}
                    title={trn(userLanguage, 'Create share')}
                    style={{ float: 'left', width: '70px', margin: 0, padding: 0 }}>
              <img src={iconShare} style={{ padding: 0, height: '35px' }} />
            </button>
          </div>
        )
      } else {
        buttonsBlock = (
          <div className="column">
            <button id="leave" onClick={self.leave} title={trn(userLanguage, 'Leave')} style={ buttonStyle }>
              <img src={iconLeave} style={{ padding: 0, height: '35px' }}/>
            </button>
            {imageSelectModeSwitchButton}
          </div>)
      }
    } else if (!self.state.isSharedGame) {
      buttonsBlock = (
        <div className="column">
          <button id="explore" onClick={self.onExploreClick} title={trn(userLanguage, 'Start new game in explore mode')} style={ buttonStyle }>
            {trn(userLanguage, 'Explore')}
          </button>
        </div>)
    }

    // FIXME: Too dirty. Refactor (see the upper code.)
    if (self.state.finishStatusDisplayTimeout > 0) {
      buttonsBlock = null
    }

    let helpButton
    let roundDetails
    if (self.state.mode != null && currentRoundNotEmpty && !self.state.isDemoGame) {
      roundDetails = (
        <div id='round-details' style={{ color: 'green', marginLeft: '10px', textShadow: '2px 2px 2px #000', position: 'absolute', fontSize: '32px', float: 'left' }}>
          #{self.state.currentRound} of {self.state.rounds.length}
        </div>)

      if (currentRound.solutions[self.state.user.id].hints.length < 3 && !isSolved) {
        helpButton = (
          <button onClick={self.getHelp}
                  title='(-1 to current game score)'
                  style={{ float: 'left', width: '40px', margin: 0, padding: 0 }}>
            <img src={iconHelp} alt="{ trn(userLanguage, 'Help') }" style={{ maxHeight: '36px', float: 'left' }} />
          </button>
        )
      } else {
        helpButton = (
          <button disabled="disabled"
                  title='(-1 to current game score)'
                  style={{ float: 'left', width: '40px', maring: 0, padding: 0 }}>
            <img src={iconHelp} alt="{ trn(userLanguage, 'Help') }"
                 style={{ maxHeight: '36px', float: 'left' }} />
          </button>
        )
      }
    }

    let timeoutBlock
    if (self.state.method === LETTERS_SELECTION_METHOD) {
      if (self.state.lettersDisplayTimeout) {
        timeoutBlock = <h3 style={{ color: 'green', marginLeft: '-5px', textShadow: '2px 2px 2px #000', fontSize: '65px', float: 'left' }}>
          &nbsp;{self.state.lettersDisplayTimeout} <span style={{ fontSize: '40px' }}>Think...</span>
        </h3>
      } else if (!self.state.isDemoGame) {
        timeoutBlock = <CurrentRoundTimeoutWidget
          isSolved={isSolved} currentRound={currentRound}
          isLettersSelection={self.state.method === LETTERS_SELECTION_METHOD} user={self.state.user}/>
      }
    }

    let suggestionBlock

    /*
    const reload = function (url) {
      window.history.pushState(url)
      window.location.reload(true)
      window.open(url, '_self')
    }
    */

    const startExploreGame = function () {
      self.sendMessage({ command: 'explore', payload: { user: self.state.user } })
    }

    if (self.state.isSharedGame || self.state.isDemoGame) {
      suggestionBlock = (
        <div className="row">
          <div className="column">
            <button style={{ float: 'left', margin: '5px' }} onClick={ startExploreGame }>
            If you want to solve more words click here.
            </button>
          </div>
        </div>
      )
    }

    let gameWidgetElems
    let gameColumn
    if (currentRoundNotEmpty) {
      if (self.state.method === IMAGE_SELECTION_METHOD) {
        let score
        let correctChoice
        if (isSolved) {
          // TODO: Should be taken from server response, but API doesn't compute score for
          // current round yet.
          score = currentRound.solutions[self.state.user.id].attempts.length > 3 ? 0 : 5 - currentRound.solutions[self.state.user.id].attempts.length + 1
          correctChoice = currentRound.correct_choice
        }
        gameWidgetElems = <SelectImageGameWidget
          currentRound={currentRound}
          user={self.state.user}
          preloadedImages={self.state.preloadedImages}
          currentRoundIndex={self.state.currentRound - 1}
          correctChoice={correctChoice}
          isSolved={isSolved}
          score={score}
          soundVolume={self.state.soundVolume} />
        helpButton = null // FIXME: Find better solution.
        replyLetterItems = null
        splittedLettersItems = null
        gameColumn = <div className="column">{gameWidgetElems}</div>
      } else if (self.state.method === LETTERS_SELECTION_METHOD) {
        gameWidgetElems = <SelectLettersGameWidget currentRound={currentRound} isSolved={isSolved}/>
        gameColumn = <div className="column image-wrapper">{roundDetails}{gameWidgetElems}</div>
      } else {
        ;
      }
    }

    let progressRows = ''
    // if (self.state.modeOpened === 'explore' && self.state.progress.simple) {
    if (self.state.progress.simple) {
      progressRows = (
        <table>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                {trn(userLanguage, 'Simple')}
              </td>
              <td>
                <ProgressWidget games={self.state.progress.simple || []} initialCounter={ 1 }/>
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                {trn(userLanguage, 'Normal')}
              </td>
              <td>
                <ProgressWidget games={self.state.progress.normal || []} initialCounter={ (self.state.progress.simple || []).length + 1 } />
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                {trn(userLanguage, 'Hard')}
              </td>
              <td>
                <ProgressWidget games={self.state.progress.hard || []} initialCounter={(self.state.progress.simple || []).length + (self.state.progress.normal || []).length + 1 } />
              </td>
            </tr>
          </tbody>
        </table>
      )
    }

    let methodSelectBox
    let levelSelectBox
    let topicSelectBox
    let finishedRoundsTable

    // if (self.state.modeOpened === 'train') {
    if (self.state.uiState === UI_STATES.inTrain || self.state.uiState === UI_STATES.training) {
      const disabled = self.state.uiState === UI_STATES.training ? 'disabled' : ''

      methodSelectBox = (
        <div className="column">
          <select id="method" style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.method} onChange={self.handleMethodChange}>
          {methodOptionItems}
          </select>
        </div>)

      levelSelectBox = (
        <div className="column">
          <select id="level" style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.level} onChange={self.handleLevelChange}>
          {levelOptionItems}
          </select>
        </div>)

      topicSelectBox = (
        <div className="column">
          <select id="topic" style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.topic} onChange={self.handleTopicChange}>
          <option value="">---</option>
          {topicOptionItems}
          </select>
        </div>)
    }

    if (self.state.mode === 'contest') {
      finishedRoundsTable = <FinishedRoundsTable players={self.state.players} user={self.state.user} finishedRounds={finishedRounds} rounds={self.state.rounds} />
    }

    if (currentRound.voice_path && currentRound.voice_path.src && self.state.autoplayEnabled && self.state.soundVolume > 0 && !self.state.voicePlayed && !self.state.isSharedGame) {
      playSound(currentRound.voice_path.src, self.state.soundVolume)
    }

    let voiceButton
    if (currentRound.voice_path && currentRound.voice_path.src && !self.state.isSharedGame) {
      voiceButton = (
        <button onClick={() => playSound(currentRound.voice_path.src, self.state.soundVolume)}
                title={trn(userLanguage, 'Tell again')}
                style={{ float: 'left', width: '70px', margin: 0, padding: 0 }}>
          <img src={iconVolume} style={{ padding: 0, height: '35px' }} />
        </button>
      )
    }
    let shareBlock

    if (self.state.isSharedGame && (self.state.user.id === self.state.ownerId)) {
      shareBlock = <ShareElementWidget userLanguage={userLanguage} shareGame={self.state}/>
    }

    let debugBlock = null
    if (debugMode()) {
      debugBlock = <div>{Date.now() + ': ' + 'asdfsd'}</div>
    }

    let firstUnsolvedGame = {}
    let secondUnsolvedGame = {}
    if (Object.keys(self.state.progress).length > 0) {
      // Progress exists.
      firstUnsolvedGame = self.state.progress.first_unsolved_game || {}
      secondUnsolvedGame = self.state.progress.second_unsolved_game || {}
    }

    let transitionBlock

    if (!self.state.isDemoGame && self.state.method === LETTERS_SELECTION_METHOD) {
      transitionBlock = <TransitionWidget
        userLanguage={ userLanguage }
        currentGame={ firstUnsolvedGame }
        nextGame={ secondUnsolvedGame }
        totalHints={ self.state.totalHints || 0 }
        mode={ self.state.mode }
        currentRoundNumber={ self.state.currentRound } />
    }

    let statusLine
    if (Object.keys(firstUnsolvedGame).length > 0 && Object.keys(secondUnsolvedGame).length > 0 && self.state.currentRound !== -1) {
      const variables = {
        firstUnsolvedGameTopic: firstUnsolvedGame.topic.local_name,
        firstUnsolvedGameTopicSet: firstUnsolvedGame.topic_set,
        secondUnsolvedGameTopic: secondUnsolvedGame.topic.local_name,
        secondUnsolvedGameTopicSet: secondUnsolvedGame.topic_set
      }
      let statusText
      if (self.state.totalHints > 3) {
        statusText = trn(
          userLanguage,
          'Hints limit exceeded. Try to solve {firstUnsolvedGameTopic}#{firstUnsolvedGameTopicSet} again to reach the {secondUnsolvedGameTopic}#{secondUnsolvedGameTopicSet}.',
          variables)
        statusLine = <div style={{ fontSize: '20px', color: 'red' }}>
          {statusText}
        </div>
      } else if (self.state.status === 'failed') {
        statusText = trn(
          userLanguage,
          'At least one word not solved. The next game will not be available.',
          variables)
        statusLine = <div style={{ fontSize: '20px', color: 'red' }}>
          {statusText}
        </div>
      } else {
        statusText = trn(
          userLanguage,
          'Solve {firstUnsolvedGameTopic}#{firstUnsolvedGameTopicSet} to reach the {secondUnsolvedGameTopic}#{secondUnsolvedGameTopicSet}.',
          variables)
        statusLine = <div style={{ fontSize: '20px', color: 'orange' }}>
          {statusText}
        </div>
      }
    }
    return (
    <>
      <header className="App-header">
        {warningRow}
        {header}
      </header>
      <div className="container">
        {debugBlock}
        <br />
        <div className="row">
          <div className="column">
            {finishStatusBlock}
          </div>
        </div>
        <div className="row">
          <div className="column">
            {gameErrorBlock}
            {gameWarningBlock}
          </div>
        </div>
        <div className="row">
          <div className="column">
            {statusLine}
            {usernameInput}
            {methodSelectBox}
            {levelSelectBox}
            {topicSelectBox}
          </div>
          <div className="column">
            {buttonsBlock}
          </div>
        </div>
        <div className="row">
          {finishedRoundsTable}
        </div>
        <div className="row">
          {shareBlock}
        </div>
        <div className="row">
          {gameColumn}
        </div>
        <div className="row">
          {transitionBlock}
          {helpButton}&nbsp;
          {replyLetterItems}
          {voiceButton}
        </div>
        {challengeBlock}
        {contextBlock}
        {suggestionBlock}
        <div className="row">
          <div className="column">
            {timeoutBlock}
            <div id="letters" style={{ float: 'left' }}>
              {splittedLettersItems}
            </div>
          </div>
        </div>
        <div>
        {progressRows}
        </div>
      </div>
    </>)
  }
};

function App () {
  return (
    <div className="App">
      <Main />
      <hr style={{ margin: 0 }}/>
    </div>
  )
}

export default App
