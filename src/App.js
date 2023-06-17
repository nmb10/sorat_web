import spinner from './spinner1.png'

import React from 'react'
import './App.css'
import PropTypes from 'prop-types'

// Slow network emulation. Set to 0 to disable. Note: this timeout works for first round. Other rounds use preloaded images.
// How many ms to wait before images display.
// const imageLoadTimeout = 5000
const imageLoadTimeout = 0

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

const translations = {
  en: {
    'image-selection': 'Image selection',
    'letters-selection': 'Letters selection',
    report_an_issue: 'Report an issue',
    contribute: 'Contribute',
    leave: 'Leave',
    contest: 'Contest',
    train: 'Train',

    // levels
    simple: 'Simple',
    normal: 'Normal',
    hard: 'Hard'
  },
  de: {
    'image-selection': 'Image selection',
    'letters-selection': 'Letters selection',
    report_an_issue: 'Ein Problem melden',
    contribute: 'Beitragen',
    leave: 'Verlassen',
    contest: 'Wettbewerb',
    train: 'Zug',
    // levels
    simple: 'Simple',
    normal: 'Normal',
    hard: 'Hard'
  },
  ru: {
    'image-selection': 'Image selection',
    'letters-selection': 'Letters selection',
    report_an_issue: 'Сообщить о проблеме',
    contribute: 'Поучаствовать',
    leave: 'Выйти',
    contest: 'Состязание',
    train: 'Тренировка',

    // levels
    simple: 'Простой',
    normal: 'Средний',
    hard: 'Трудный'
  },
  os: { // FIXME:
    'image-selection': 'Image selection',
    'letters-selection': 'Letters selection',
    report_an_issue: 'Report an issue',
    contribute: 'Contribute',
    leave: 'Ацæуын',
    contest: 'Ерыс',
    train: 'Train',
    // levels
    simple: 'Simple',
    normal: 'Normal',
    hard: 'Hard'
  },
  dig: { // FIXME:
    'image-selection': 'Image selection',
    'letters-selection': 'Letters selection',
    report_an_issue: 'Report an issue',
    contribute: 'Contribute',
    leave: 'Рандæ ун',
    contest: 'Ерис',
    train: 'Train',
    // levels
    simple: 'Simple',
    normal: 'Normal',
    hard: 'Hard'
  }
}

const methods = [
  'image-selection',
  'letters-selection'
  // FIXME: Implement 'enter letters' - entering letters from keyboard
]

const levels = [
  'simple',
  'normal',
  'hard'
]

function t (userLanguage) {
  return translations[userLanguage]
}

function getSecondsDiff (dt1, dt2) {
  const diffMs = dt1.getTime() - dt2.getTime()
  return diffMs / 1000
}

function preloadImage (roundIndex, imageIndex, imageMap) {
  // console.log('Preloading image...', roundIndex, imageMap)
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

function questionLettersToTable (questionLetters, chosenQueryIndexes) {
  const [tableRowsCount, tableColumnsCount] = tableSizeMap[questionLetters.length]
  let letterIndex, letter
  const tableRows = []

  for (let i = 0; i < tableRowsCount; ++i) {
    const rowElems = []
    for (let j = 0; j < tableColumnsCount; ++j) {
      if (questionLetters.length > 0) {
        [letterIndex, letter] = questionLetters.shift()
        const isChosen = chosenQueryIndexes.includes(pair(0, letterIndex))
        const questionLetter = <td style={{ display: 'inline-block', padding: 0 }}><QuestionLetter letter={letter} wordIndex={0} letterIndex={letterIndex} isChosen={isChosen} /></td>
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
    </table>)
};

function pair (wordIndex, letterIndex) {
  return wordIndex + ',' + letterIndex
}

function replyLettersToRow (words, isSolved) {
  const replyLetters = []
  for (let j = 0; j < words.length; ++j) {
    replyLetters.push(
      <ReplyLetter isSolved={isSolved} letter={words[j]} wordIndex={0} letterIndex={j} />)
  }

  return (
    <div style={{ whiteSpace: 'nowrap' }}>
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

FinishedRoundsTable.propTypes = {
  finishedRounds: PropTypes.array,
  user: PropTypes.object,
  players: PropTypes.array
}

function FinishedRoundsTable (props) {
  /* example of finishedRounds
  * FIXME: Add example.
  */

  const scores = {}
  if (props.finishedRounds.length === 0) {
    // Show zeros for all players.
    for (const userId in props.players) {
      scores[userId] = {
        name: props.players[userId].name,
        total: 0,
        all: []
      }
    }
  } else {
    for (let i = 0; i < props.finishedRounds.length; ++i) {
      for (const userId in props.finishedRounds[i].solutions) {
        if (userId in scores) {
          scores[userId].total += props.finishedRounds[i].solutions[userId].score
          scores[userId].all.push(props.finishedRounds[i].solutions[userId].score)
        } else {
          scores[userId] = {
            name: props.finishedRounds[i].solutions[userId].name,
            total: props.finishedRounds[i].solutions[userId].score,
            all: [props.finishedRounds[i].solutions[userId].score]
          }
        }
      }
    }
  }

  const imageRowElems = []
  const wordRowElems = []
  const pointsRowsElems = []

  for (const userId in scores) {
    pointsRowsElems.push(userScoreToRow(userId === props.user.id, scores[userId]))
  }

  if (props.finishedRounds.length > 0) {
    for (const round of props.finishedRounds.slice(-3)) {
      const correctChoice = round.correct_choice || 1
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
  const imageStyle = {}
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
      <img className="word-image"
           src={props.imageSrc}
           onClick={onImageClick}
           style={imageStyle} />
    </div>
  )
}

SelectLettersGameWidget.propTypes = {
  currentRound: PropTypes.node.isRequired
}

function SelectLettersGameWidget (props) {
  return (
    <img className="word-image" src={props.currentRound.img1.src} />
  )
}

SelectImageGameWidget.propTypes = {
  currentRound: PropTypes.node.isRequired,
  preloadedImages: PropTypes.node.isRequired,
  currentRoundIndex: PropTypes.node.isRequired,
  user: PropTypes.node.isRequired,
  correctChoice: PropTypes.number,
  isSolved: PropTypes.bool,
  score: PropTypes.number
}

function SelectImageGameWidget (props) {
  const localTerm = props.currentRound.local_term || ''
  const currentRoundIndex = props.currentRoundIndex
  const localTermLetters = <div className="image-selection-letters">{ localTerm }</div>
  const userChoices = props.currentRound.solutions[props.user.id].attempts.map(
    (attemptMap) => attemptMap.reply.userChoice)

  // <img src={spinner} alt="Spinner" />
  //
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
          {localTermLetters}
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

  const style = {
    fontSize: '35px',
    float: 'left',
    marginLeft: '3px',
    width: '75px',
    height: '75px'
  }
  // FIXME: Move to css.

  if (props.isChosen || props.letter === ' ') {
    return (
      <button disabled style={style}>
        {props.letter}
      </button>
    )
  } else {
    return (
      <button onClick={onClick} style={style}>
        {props.letter}
      </button>
    )
  }
};

ReplyLetter.propTypes = {
  letter: PropTypes.node.isRequired,
  wordIndex: PropTypes.node.isRequired,
  letterIndex: PropTypes.node.isRequired,
  isSolved: PropTypes.node.isRequired
}

function ReplyLetter (props) {
  function onClick (e) {
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
  let removeLink = <a href="#" onClick={onClick}>x</a>
  if (props.isSolved || props.letter === ' ') {
    removeLink = ''
  }

  if (props.letter !== ' ') {
    letterStyle.border = 'solid gray 2px'
  }

  return (
        <div className="reply-letter" style={ letterStyle }>
            {removeLink}
            <span style={{ fontSize: '40px' }}>
                {props.letter}
            </span>
        </div>
  )
};

class Main extends React.Component {
  constructor (props) {
    super(props)

    // Initial state
    this.state = {
      versions: {
        backend: '',
        frontend: '',
        images: '',
        translations: ''
      },
      user: {
        name: null,
        id: null,
        language: null, // selected language
        method: 'image-selection', // user choice [select-image or select-image or select-letters]
        level: 'normal', // user choice [simple/normal/hard]
        topic: null // selected topic.
      },
      challenge: null,
      connection: '',
      languages: [], // all languages.
      topics: [], // all topics of the selected language.
      method: null, // current game method, server choice. May not match to user.method
      mode: null, // train_requested, train, contest_requested, contest_enqueued, contest_accepted
      rounds: [],
      replyMap: {}, // Question letters indexes clicked while replying.
      replyLetters: [], // Letters user clicked while replying
      currentRound: null,
      players: {}, // current round players.
      preloadedImages: {},
      gameError: null,
      gameWarning: null,
      gameLastMessageTime: null, // how many seconds passed from previous game message. Large value means slow connection.
      slowMessageCount: 0, // how many messages were delayed
      slowConnection: false
    }

    this.nameUpdateTimeout = null
    this.onTrainClick = this.onTrainClick.bind(this)
    this.saveState = this.saveState.bind(this)
    this.onContestClick = this.onContestClick.bind(this)
    this.onAcceptClick = this.onAcceptClick.bind(this)
    this.onDeclineClick = this.onDeclineClick.bind(this)
    this.startWebsocket = this.startWebsocket.bind(this)
    this.stopWebsocket = this.stopWebsocket.bind(this)
    this.sendMessageByTimeout = this.sendMessageByTimeout.bind(this)
    this.checkSlowConnection = this.checkSlowConnection.bind(this)
    this.startSlowConnectionMonitor = this.startSlowConnectionMonitor.bind(this)
    this.stopSlowConnectionMonitor = this.stopSlowConnectionMonitor.bind(this)
  }

  sendMessageByTimeout (message) {
    const self = this
    // console.log('Sending WS message by timeout.', message)
    if (self.state.connection === 'Opened') {
      if (self.websocket.readyState === self.websocket.OPEN) {
        self.websocket.send(JSON.stringify(message))
      } else {
        ;
        // console.log('Websocket is not connected.')
      }
    } else {
      // console.log('Not opened. Still waiting...')
      setTimeout(self.sendMessageByTimeout, 500, message)
    }
  }

  sendMessage (message) {
    const self = this
    if (self.state.connection === 'Opened') {
      if (self.websocket.readyState === self.websocket.OPEN) {
        // console.log('Sending WS message.', message)
        self.websocket.send(JSON.stringify(message))
      } else {
        ;
        // console.log('Websocket is not connected.')
      }
    } else {
      self.startWebsocket()
      self.sendMessageByTimeout(message)
    }
  }

  startWebsocket () {
    // console.log('Initializing WS now...')
    const self = this
    // var wsHost = 'ws://127.0.0.1:8080/game.ws';
    // var wsHost = 'ws://' + window.location.host + '/game.ws';
    let wsHost = 'ws://' + window.location.host + '/game.ws'
    if (window.location.protocol === 'https:') {
      wsHost = 'wss://' + window.location.host + '/game.ws'
    }
    self.websocket = new WebSocket(wsHost)

    const onMessage = function (event) {
      const message = JSON.parse(event.data)
      // console.log('New message:', message)
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
                  players: message.payload.players,
                  rounds: message.payload.rounds,
                  currentRound: message.payload.current_round,
                  gameLastMessageTime: messageTime
                }
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
      }
    }
    let intervalID = null

    const sendPing = function () {
      if (self.websocket.readyState === WebSocket.OPEN) {
        // console.log('Sending ping.')
        self.websocket.send(JSON.stringify({ command: 'ping', payload: { user: self.state.user } }))
        // Send ping.
      } else {
        // console.log('WS closed. Clear interval.')
        clearInterval(intervalID)
      }
    }

    self.websocket.onopen = function (evt) {
      sendPing()
      intervalID = setInterval(sendPing, 1000 * 30)
      document.getElementById('root').dispatchEvent(new CustomEvent('ws.opened'))
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
    // console.log('Closing websocket now.')
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

  checkSlowConnection () {
    const self = this
    const now = new Date()
    if (self.state.gameLastMessageTime !== null && getSecondsDiff(now, self.state.gameLastMessageTime) > 4) {
      document.getElementById('root').dispatchEvent(
        new CustomEvent('connection.slow-message', { detail: {} }))
    }
  }

  startSlowConnectionMonitor () {
    const self = this
    self.slowConnectionMonitorIntervalID = setInterval(self.checkSlowConnection, 1000)
  }

  stopSlowConnectionMonitor () {
    const self = this
    clearInterval(self.slowConnectionMonitorIntervalID)
    // console.log('Slow network monitor stopped.')
  }

  componentDidMount () {
    const self = this

    // console.log('Fetch categories.')
    fetch('/api/v1/state')
      .then(response => response.json())
      .then(json => {
        self.setState(prevState => {
          const newState = { ...prevState }
          newState.languages = json.languages
          newState.topics = json.topics
          newState.user = json.user
          newState.mode = json.mode
          newState.method = json.method
          newState.versions = json.versions

          if (newState.mode == null) {
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
        const newState = { ...prevState }
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
        const newState = { ...prevState }
        newState.connection = 'error'
        return newState
      })
    })

    document.getElementById('root').addEventListener('ws.closed', function (event) {
      self.setState(prevState => {
        const newState = { ...prevState }
        newState.connection = 'closed'
        return newState
      })
    })

    document.getElementById('root').addEventListener('ws.opened', function (event) {
      self.setState(prevState => {
        const newState = { ...prevState }
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

    document.getElementById('root').addEventListener('error.close', function (event) {
      self.setState(prevState => {
        const newState = { ...prevState }
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

      self.setState(prevState => {
        const newState = { ...prevState }
        newState.mode = null
        newState.method = null
        newState.rounds = []
        newState.currentRound = -1
        newState.replyLetters = []
        newState.preloadedImages = {}
        return newState
      })
    })

    document.getElementById('root').addEventListener('challenge', function (event) {
      setTimeout(self.sendChallengeTickEvent, 1000)
      self.setState(prevState => {
        const newState = { ...prevState }

        newState.challenge = {
          user: event.detail.user,
          timeout: 10
        }
        return newState
      })
    })

    document.getElementById('root').addEventListener('image-selection.reply', function (event) {
      // console.log('userChoice: ', event.detail.userChoice)
      self.sendMessage({
        command: 'reply',
        method: 'image-selection',
        payload: { userChoice: event.detail.userChoice }
      })
    })

    document.getElementById('root').addEventListener('image.load', function (event) {
      self.setState(prevState => {
        const newState = { ...prevState }
        // console.log('!!!!!', event.detail.img.src, event.detail.roundIndex)
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
        const newState = { ...prevState }
        newState.mode = 'contest_enqueued'
        return newState
      })
    })

    document.getElementById('root').addEventListener('game_error', function (event) {
      self.setState(prevState => {
        const newState = { ...self.state }
        newState.gameError = event.detail
        return newState
      })
    })

    document.getElementById('root').addEventListener('tick-challenge', function (event) {
      if (self.state.challenge == null) {
        ;
      } else {
        self.setState(prevState => {
          const newState = { ...prevState }
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
        const newState = { ...prevState }
        newState.players = event.detail.state.players
        newState.rounds = event.detail.state.rounds
        newState.currentRound = event.detail.state.currentRound
        newState.mode = event.detail.state.mode
        newState.method = event.detail.state.method
        newState.gameLastMessageTime = event.detail.state.gameLastMessageTime

        if (newState.currentRound === -1) {
          newState.replyLetters = []
          newState.replyMap = {}
          newState.preloadedImages = {}
          newState.gameLastMessageTime = null
          self.stopSlowConnectionMonitor()
        } else if (self.state.currentRound !== newState.currentRound) {
          // Round changed. Show ? for every letter of the question.
          if (newState.currentRound === 1) {
            self.startSlowConnectionMonitor()
          }
          const currentRound = newState.rounds[newState.currentRound - 1]
          // console.log('Round changed. Loading images...')
          if (newState.preloadedImages[newState.currentRound - 1] === undefined) {
            // console.log(
            //   'No images exist for #' + (newState.currentRound - 1) + ' round. Loading now...')
            if (currentRound.img1 !== null) {
              // console.log('No preloaded for current round. Loading img1...')
              preloadImage(newState.currentRound - 1, 0, currentRound.img1)
            }
            if (currentRound.img2 !== null) {
              // console.log('No preloaded for current round. Loading img2...')
              preloadImage(newState.currentRound - 1, 1, currentRound.img2)
            }
            if (currentRound.img3 !== null) {
              // console.log('No preloaded for current round. Loading img3...')
              preloadImage(newState.currentRound - 1, 2, currentRound.img3)
            }
            if (currentRound.img4 !== null) {
              // console.log('No preloaded for current round. Loading img4...')
              preloadImage(newState.currentRound - 1, 3, currentRound.img4)
            }
          } else {
            if (newState.preloadedImages[newState.currentRound - 1][0] === undefined) {
              // TODO: Clean that hell.
              if (currentRound.img1 !== null) {
                // console.log('Round is missing image 0. Loading...')
                preloadImage(newState.currentRound - 1, 0, currentRound.img1)
              }
            }
            if (newState.preloadedImages[newState.currentRound - 1][1] === undefined) {
              if (currentRound.img2 !== null) {
                // console.log('Round is missing image 1. Loading...')
                preloadImage(newState.currentRound - 1, 1, currentRound.img2)
              }
            }
            if (newState.preloadedImages[newState.currentRound - 1][2] === undefined) {
              if (currentRound.img3 !== null) {
                // console.log('Round is missing image 2. Loading...')
                preloadImage(newState.currentRound - 1, 2, currentRound.img3)
              }
            }
            if (newState.preloadedImages[newState.currentRound - 1][3] === undefined) {
              if (currentRound.img4 !== null) {
                // console.log('Round is missing image 3. Loading...')
                preloadImage(newState.currentRound - 1, 3, currentRound.img4)
              }
            }
          }

          const nextRound = newState.rounds[newState.currentRound]
          if (nextRound === undefined) {
            // console.log('No new round!!!', nextRound)
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
        // For some reason in firefox it doesn't upgrade the state. The problem is not clear yet,
        // to overcome that create new object from state.
        // Assume problem in immutable update helper
        // FIXME: Should be fixed ASAP. stringify/parse if very heavy here.
        // const newState1 = JSON.parse(JSON.stringify(newState))
        // newState1.gameLastMessageTime = newState.gameLastMessageTime
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
            const newState = { ...prevState }
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

    document.getElementById('root').addEventListener('level-changed', function (event) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
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
            const newState = { ...prevState }
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
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: {
            name: self.state.user.name,
            language: event.detail.language,
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
            const newState = { ...prevState }
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

    document.getElementById('root').addEventListener('name-changed', function (event) {
      // Updates username

      // Update state and send to server side.
      self.setState(prevState => {
        const newState = { ...prevState }
        newState.user.name = event.detail.name
        clearTimeout(self.nameUpdateTimeout)
        self.nameUpdateTimeout = setTimeout(self.saveState, 2000)
        return newState
      })
    })

    document.getElementById('root').addEventListener('contest-clicked', function (event) {
      // FIXME:
      self.setState(prevState => {
        const newState = { ...prevState }
        newState.mode = 'contest_requested'
        // We always send user in payload because server may loose initial state once (on
        // backend restart for example).
        self.sendMessage({ command: 'contest', payload: { user: newState.user } })
        return newState
      })
    })

    document.getElementById('root').addEventListener('train-clicked', function (event) {
      self.setState(prevState => {
        const newState = { ...prevState }
        newState.mode = 'train_requested'
        // We always send user in payload because server may loose initial state once (on
        // backend restart for example).
        self.sendMessage({ command: 'train', payload: { user: newState.user } })
        return newState
      })
    })

    // new CustomEvent('challenge-accepted', {detail: {}}));
    document.getElementById('root').addEventListener('challenge-accepted', function (event) {
      self.setState(prevState => {
        const newState = { ...prevState }
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
            method: self.state.user.method
          }
        })
      }
      fetch('/api/v1/state', requestOptions)
        .then(response => response.json())
        .then(data => {
          self.setState(prevState => {
            const newState = { ...prevState }
            newState.user.topic = data.user.topic
            return newState
          })
        })
    })

    document.getElementById('root').addEventListener('reply-letter.remove', function (event) {
      // FIXME: Send to server
      // update-state
      // console.log(event.detail.letter);
      self.setState(prevState => {
        const newState = { ...prevState }
        const replyWordIndex = event.detail.wordIndex
        const replyLetterIndex = event.detail.letterIndex
        const replyWordLetters = newState.replyLetters[replyWordIndex]
        const replyWordArray = replyWordLetters.split('')
        replyWordArray[replyLetterIndex] = '?'
        newState.replyLetters[replyWordIndex] = replyWordArray.join('')

        // Drop removed indexes.
        newState.replyMap[pair(replyWordIndex, replyLetterIndex)] = null
        return newState
      })
    })

    document.getElementById('root').addEventListener('question-letter.click', function (event) {
      self.setState(prevState => {
        const newState = { ...prevState }
        const wordIndex = event.detail.wordIndex
        const letterIndex = event.detail.letterIndex
        const letter = event.detail.letter
        const replyWordLetters = newState.replyLetters[wordIndex]
        const indexToReplace = replyWordLetters.indexOf('?')
        const updatedReplyWordLetters = replyWordLetters.replace('?', letter)
        newState.replyLetters[wordIndex] = updatedReplyWordLetters
        newState.replyMap[pair(wordIndex, indexToReplace)] = pair(wordIndex, letterIndex)

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
          self.sendMessage({
            command: 'reply',
            payload: newState.replyLetters
          })
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

  handleLevelChange (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('level-changed', { detail: { level: event.target.value } }))
  }

  handleLanguageChange (event) {
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

  onContestClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('contest-clicked', { detail: {} }))
  }

  onAcceptClick (event) {
    document.getElementById('root').dispatchEvent(
      new CustomEvent('challenge-accepted', { detail: {} }))
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
    const userLanguage = self.state.user.language || 'en'
    const versions = 'Backend: ' + self.state.versions.backend +
      ', Frontend: ' + self.state.versions.frontend +
      ', Translations: ' + self.state.versions.translations +
      ', Images: ' + self.state.versions.images
    // console.log('Before render.', self.state)
    if (self.state.connection === 'closed') {
      return (
        <div className="container">
          <br />
          <div style={{ float: 'left' }}>
            <a href="https://github.com/nmb10/sorat_web/issues" title={versions}>
              {t(userLanguage).report_an_issue}
            </a>
            &nbsp;|&nbsp;
            <a href="https://github.com/nmb10/sorat_translations">
              {t(userLanguage).contribute}
            </a>
          </div>
          <div className="row">
            <div className="column">
              <div style={{ fontSize: '45px' }}>Connection closed. Please refresh the page.</div>
            </div>
          </div>
        </div>
      )
    } else if (self.state.connection === 'error') {
      return (
        <div className="container">
          <br />
          <div style={{ float: 'left' }}>
            <a href="https://github.com/nmb10/sorat_web/issues" title={versions}>
              {t(userLanguage).report_an_issue}
            </a>
            &nbsp;|&nbsp;
            <a href="https://github.com/nmb10/sorat_translations">
              {t(userLanguage).contribute}
            </a>
          </div>
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
    let splittedLettersItems = null

    let isSolved = false
    let currentRound = {}
    if (self.state.currentRound && self.state.currentRound !== -1) {
      currentRound = self.state.rounds[self.state.currentRound - 1]
      isSolved = currentRound.solutions[self.state.user.id].is_solved
    }

    // FIXME: Implement term with multiple words.
    let replyLetterItems = []

    if (Object.keys(currentRound).length > 0) {
      // New responsive implementation
      // FIXME: handle currentRound.question as string instead of list of words.
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
      const chosenQueryIndexes = Object.values(replyMap)

      const questionLettersTables = []

      for (let i = 0; i < splittedLetters.length; ++i) {
        questionLettersTables.push(questionLettersToTable(
          splittedLetters[i], chosenQueryIndexes))
      }

      // var letterItems1 = letterItems.map((divGroup) => <td style={{display: "inline-block", borderBottom: 0}}>{divGroup}</td>);
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

    if (Object.keys(currentRound).length > 0) {
      replyLetterItems = replyLettersToRow(self.state.replyLetters[0], isSolved)
    }

    let contextBlock = null
    if (currentRound.context != null && currentRound.context !== '') {
      contextBlock = <span style={{ fontSize: '34px' }}>({currentRound.context_value || currentRound.context})</span>
    }

    let gameWarningBlock = null

    if (self.state.gameWarning !== null) {
      const warningBlockStyle = {
        backgroundColor: 'rgb(248, 215, 218)',
        borderColor: 'rgb(114, 28, 36)',
        color: 'rgb(114, 28, 36)',
        fontSize: '18px',
        position: 'fixed',
        padding: '4px 15px 4px 4px',
        top: 0
      }

      gameWarningBlock = (
        <div style={warningBlockStyle}>
          <div>
            {self.state.gameWarning.message}
          </div>
        </div>)
    }

    let gameErrorBlock = null
    if (self.state.gameError != null) {
      const errorBlockStyle = {
        backgroundColor: 'rgb(248, 215, 218)',
        borderColor: 'rgb(114, 28, 36)',
        color: 'rgb(114, 28, 36)',
        fontSize: '18px',
        position: 'fixed',
        padding: '4px 15px 4px 4px',
        top: 0
      }

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

    let pointerBlock = null
    if (self.state.method === 'letters-selection' && currentRound.img1 !== undefined && currentRound.img1.pointer != null) {
      pointerBlock = <span style={{ fontSize: '34px' }}>#{currentRound.img1.pointer}</span>
    }

    let pointsBlock = null
    let points = 0
    if (isSolved && self.state.method === 'letters-selection') {
      if (currentRound.solutions[self.state.user.id].hints.length === 3) {
        points = 0
      } else {
        points = '+' + (5 - currentRound.solutions[self.state.user.id].hints.length)
      }
      pointsBlock = <span style={{ color: 'green' }}>{points}</span>
    }

    // const languages = ['dig','os','ru','en'];
    // FIXME: Move to server side.
    const languageOptionItems = self.state.languages
      .map((language) => <option key={language.code} value={language.code}>{language.local_name}</option>)

    const methodOptionItems = methods
      .map((method) => <option key={method} value={method}>{t(userLanguage)[method]}</option>)

    const levelOptionItems = levels
      .map((level) => <option key={level} value={level}>{t(userLanguage)[level]}</option>)

    const topicOptionItems = self.state.topics
      .map((topic) => <option key={topic.code} value={topic.code}>{topic.local_name}</option>)

    let trainBlock = null
    let contestBlock = null
    let challengeBlock = null

    if (self.state.challenge) {
      challengeBlock = (
        <div>
          {self.state.challenge.user.name} is challenging you!
          <button onClick={self.onAcceptClick}>Accept</button>
          (ignore to decline) ({self.state.challenge.timeout})
        </div>)
    }

    if (self.state.mode === 'contest') {
      trainBlock = (
        <button id='train' disabled onClick={self.onTrainClick}>
          {t(userLanguage).train}
        </button>)
      contestBlock = (
        <button onClick={self.leave} title='Leave game'>
          {t(userLanguage).leave}
        </button>)
    } else if (self.state.mode === 'train') {
      trainBlock = (
        <button onClick={self.leave} title='Leave game'>
          {t(userLanguage).leave}
        </button>)
      contestBlock = (
        <button disabled id='contest' onClick={self.onContestClick}>
          {t(userLanguage).contest}
        </button>)
    } else if (self.state.mode === 'contest_enqueued') {
      trainBlock = (
        <button id='train' disabled onClick={self.onTrainClick}>
          {t(userLanguage).train}
        </button>)

      contestBlock = (
        <button onClick={self.leave} title='Leave game'>
          {t(userLanguage).leave}<img src={spinner} alt="Spinner" />
        </button>)
    } else {
      trainBlock = (
        <button id='train' onClick={self.onTrainClick}>
          {t(userLanguage).train}
        </button>)
      contestBlock = (
        <button id='contest' onClick={self.onContestClick}>
          {t(userLanguage).contest}
        </button>)
    }

    let helpButton = null
    let roundDetails = null
    if (self.state.mode != null &&
                Object.keys(currentRound).length > 0) {
      roundDetails = (
        <span id='round-details' style={{ fontSize: '24px', marginTop: '10px', float: 'left' }}>
          Round #{self.state.currentRound} of {self.state.rounds.length}
        </span>)
      if (currentRound.solutions[self.state.user.id].hints.length < 3 && !isSolved) {
        helpButton = (
          <button onClick={self.getHelp}
                  title='(-1 to current game score)'
                  style={{ fontSize: '20px', float: 'left', margin: '5px', width: '145px', height: '45px' }}>
                        Help ({3 - currentRound.solutions[self.state.user.id].hints.length})
          </button>
        )
      } else {
        helpButton = (
          <button onClick={self.getHelp}
                  disabled='disabled'
                  title='(-1 to current game score)'
                  style={{ fontSize: '20px', float: 'left', margin: '5px', width: '145px', height: '45px' }}>
            Help (0)
          </button>
        )
      }
    }

    const disabled = self.state.mode != null ? 'disabled' : ''

    let currentRoundTimeoutBlock = (<h3 style={{ fontSize: '45px', float: 'left', marginLeft: '15px' }}>{currentRound.timeout}&nbsp;|&nbsp;{pointsBlock}</h3>)
    if (currentRound.timeout <= 10 && !isSolved) {
      currentRoundTimeoutBlock = <h3 style={{ color: 'red', fontSize: '45px', float: 'left', marginLeft: '15px' }}>{currentRound.timeout}</h3>
    }

    let gameWidgetElems = null
    if (Object.keys(currentRound).length > 0 && self.state.method === 'image-selection') {
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
        score={score} />
      helpButton = null // FIXME: Find better solution.
      replyLetterItems = null
      splittedLettersItems = null
    } else if (Object.keys(currentRound).length > 0 && self.state.method === 'letters-selection') {
      gameWidgetElems = <SelectLettersGameWidget currentRound={currentRound} />
    }

    return (
      <div className="container">
        <br />
        <div style={{ float: 'left' }}>
          <a href="https://github.com/nmb10/sorat_web/issues" title={versions}>
            {t(userLanguage).report_an_issue}
          </a>
          &nbsp;|&nbsp;
          <a href="https://github.com/nmb10/sorat_translations">
            {t(userLanguage).contribute}
          </a>
        </div>
        <div className="row">
          <div className="column">
            {gameErrorBlock}
            {gameWarningBlock}
            <div>
              <input type="text" placeholder="Username"
                     value={self.state.user.name}
                     onChange={self.handleNameChange}
                     style={{ color: 'white' }}>
              </input>
            </div>
          </div>
          <div className="column">
            <select style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.language} onChange={self.handleLanguageChange}>
              <option value="">---</option>
              {languageOptionItems}
            </select>
          </div>
          <div className="column">
            <select style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.method} onChange={self.handleMethodChange}>
              {methodOptionItems}
            </select>
          </div>
          <div className="column">
            <select style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.level} onChange={self.handleLevelChange}>
              {levelOptionItems}
            </select>
          </div>
          <div className="column">
            <select style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.topic} onChange={self.handleTopicChange}>
              <option value="">---</option>
              {topicOptionItems}
            </select>
          </div>
          <div className="column">
            {trainBlock}
          </div>
          <div className="column">
            {contestBlock}
          </div>
        </div>
        <div className="row">
          <FinishedRoundsTable players={self.state.players} user={self.state.user} finishedRounds={finishedRounds} rounds={self.state.rounds} />
        </div>
        <div className="row">
          <div className="column">
            {gameWidgetElems}
          </div>
        </div>
        <div className="row">
          <div className="column">
            {helpButton}&nbsp;
            {roundDetails}&nbsp;&nbsp;&nbsp;
            {currentRoundTimeoutBlock}
          </div>
        </div>
        <div className="row">
          {challengeBlock}
        </div>
        <div className="row">
          {contextBlock}&nbsp;{pointerBlock}
        </div>
        <div className="row">
          {replyLetterItems}
        </div>
        <div className="row">
          <div id="letters">
            {splittedLettersItems}
          </div>
        </div>
      </div>
    )
  }
};

function App () {
  return (
    <div className="App">
      <header className="App-header">
        <Main />
      </header>
    </div>
  )
}

export default App
