import spinner from './spinner1.png'

import React from 'react'
import './App.css'
import update from 'react-addons-update'
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
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    report_an_issue: 'Report an issue',
    leave: 'Leave',
    contest: 'Contest',
    train: 'Train'
  },
  ru: {
    beginner: 'Начальный',
    intermediate: 'Средний',
    advanced: 'Продвинутый',
    report_an_issue: 'Сообщить о проблеме',
    leave: 'Выйти',
    contest: 'Состязание',
    train: 'Тренировка'
  },
  os: { // FIXME:
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    report_an_issue: 'Report an issue',
    leave: 'Leave',
    contest: 'Состязание',
    train: 'Тренировка'
  },
  dig: { // FIXME:
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    report_an_issue: 'Report an issue',
    leave: 'Leave',
    contest: 'Contest',
    train: 'Train'
  }
}

const levels = [
  'beginner',
  'intermediate'
  // FIXME: Implement 'advanced'
]

function t (userLanguage) {
  return translations[userLanguage]
}

function preloadImage (roundIndex, imageIndex, imageMap) {
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
    </table>
  )
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
    </tr>
  )
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
  const imageStyle = {
    maxWidth: '300px',
    width: '100%',
    height: 'auto',
    display: 'inline-block',
    padding: '0px',
    float: 'left'
  }
  if (props.isCorrectChoice) {
    imagePointsBlock = (
      <div style={{ maxWidth: '300px', fontSize: '100px', position: 'absolute', float: 'left', color: 'green', left: '0px', top: '0px', textShadow: '3px 3px 4px black' }}>
        +{props.score}
      </div>)
  } else if (props.userChoices.includes(props.imageChoice)) {
    imagePointsBlock = (
      <div style={{ maxWidth: '300px', fontSize: '100px', position: 'absolute', float: 'left', color: 'red', left: '0px', top: '0px', textShadow: '3px 3px 4px black' }}>
        -1
      </div>)
  } else if (!props.isSolved) {
    imageStyle.cursor = 'pointer'
    onImageClick = function (event) {
      document.getElementById('root').dispatchEvent(
        new CustomEvent('beginner.reply', { detail: { userChoice: props.imageChoice } }))
    }
  }

  return (
    <div className="column" style={{ position: 'relative' }}>
      <div style={{ fontSize: '24px' }}>
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

IntermediateGameWidget.propTypes = {
  currentRound: PropTypes.node.isRequired
}

function IntermediateGameWidget (props) {
  return (
    <img id="word-image"
         src={props.currentRound.img1.src}
         style={{ maxWidth: '500px', width: '100%', height: 'auto', display: 'inline-block', padding: '0px' }} />
  )
}

BeginnerGameWidget.propTypes = {
  currentRound: PropTypes.node.isRequired,
  preloadedImages: PropTypes.node.isRequired,
  currentRoundIndex: PropTypes.node.isRequired,
  user: PropTypes.node.isRequired,
  correctChoice: PropTypes.number,
  isSolved: PropTypes.bool,
  score: PropTypes.number
}

function BeginnerGameWidget (props) {
  const localTerm = props.currentRound.local_term || ''
  const currentRoundIndex = props.currentRoundIndex
  const localTermLetters = []
  for (let j = 0; j < localTerm.length; ++j) {
    localTermLetters.push(
      <ReplyLetter isSolved={true} letter={localTerm[j]} wordIndex={0} letterIndex={j} />)
  }
  // function fetchChoice (attemptMap) {
  // return attemptMap.reply.userChoice
  // }
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
    <div>
      <div className="row">
        <WordImageColumn imageSrc={src0} imageChoice={1} userChoices={userChoices} isCorrectChoice={props.correctChoice === 1} score={score0} isSolved={props.isSolved} choicePointer={pointer0}/>
        <WordImageColumn imageSrc={src1} imageChoice={2} userChoices={userChoices} isCorrectChoice={props.correctChoice === 2} score={score1} isSolved={props.isSolved} choicePointer={pointer1}/>
      </div>
      <div className="row">
        <div className="column">
          {localTermLetters}
        </div>
      </div>
      <div className="row">
        <WordImageColumn imageSrc={src2} imageChoice={3} userChoices={userChoices} isCorrectChoice={props.correctChoice === 3} score={score2} isSolved={props.isSolved} choicePointer={pointer2}/>
        <WordImageColumn imageSrc={src3} imageChoice={4} userChoices={userChoices} isCorrectChoice={props.correctChoice === 4} score={score3} isSolved={props.isSolved} choicePointer={pointer3}/>
      </div>
    </div>
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

  const borderStyle = 'solid gray 2px'

  let removeLink = <a href="#" onClick={onClick}>x</a>
  if (props.isSolved || props.letter === ' ') {
    removeLink = ''
  }

  return (
        <div
            className="reply-letter"
            style={{ border: borderStyle }}>
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
        app: '',
        release: '',
        web: ''
      },
      user: {
        name: null,
        id: null,
        language: null, // selected language
        topic: null // selected topic.
      },
      challenge: null,
      connection: '',
      languages: [], // all languages.
      topics: [], // all topics of the selected language.
      mode: null, // train_requested, train, contest_requested, contest_enqueued, contest_accepted
      level: 'beginner', // beginner, intermediate
      rounds: [],
      replyMap: {}, // Question letters indexes clicked while replying.
      replyLetters: [], // Letters user clicked while replying
      currentRound: null,
      players: {}, // current round players.
      preloadedImages: {}
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
  }

  sendMessageByTimeout (message) {
    const self = this
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
      // console.log('New message:', message);
      if (message.type === 'game') {
        // event.detail.state.rounds
        document.getElementById('root').dispatchEvent(
          new CustomEvent(
            'state.update',
            {
              detail: {
                state: {
                  mode: message.payload.mode,
                  players: message.payload.players,
                  rounds: message.payload.rounds,
                  currentRound: message.payload.current_round
                }
              }
            }))
      } else if (message.type === 'challenge') {
        document.getElementById('root').dispatchEvent(
          new CustomEvent('challenge', { detail: { user: message.payload.user } }))
      } else if (message.type === 'contest_enqueued') {
        document.getElementById('root').dispatchEvent(
          new CustomEvent('contest_enqueued', { detail: {} }))
      }
    }
    let intervalID = null

    const sendPing = function () {
      if (self.websocket.readyState === WebSocket.OPEN) {
        // console.log('Sending ping.')
        self.websocket.send(JSON.stringify({ command: 'ping', payload: '' }))
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
      // console.log('Opened');
    }

    self.websocket.onclose = function (evt) {
      // event.detail.state.rounds
      // console.log('onclose! evt: ', evt)
      document.getElementById('root').dispatchEvent(new CustomEvent('ws.closed'))
      // console.log('Closed');
    }

    self.websocket.onerror = function (evt) {
      // console.log('onerror! evt: ', evt)
      document.getElementById('root').dispatchEvent(new CustomEvent('ws.error'))
    }
    self.websocket.onmessage = onMessage
  }

  stopWebsocket () {
    const self = this
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
        /* looks like state update is not needed here */
        /*
              const newState = update(self.state, {});
              newState.user.language = data.user.language;
              newState.user.name = data.user.name;
              newState.user.topic = data.user.topic;
              newState.topics = data.topics;
              self.setState(newState);
              */
        ;
      })
  }

  componentDidMount () {
    const self = this

    // console.log('Fetch categories.')
    fetch('/api/v1/state')
      .then(response => response.json())
      .then(json => {
        const newState = update(self.state, {})
        newState.languages = json.languages
        newState.topics = json.topics
        newState.user = json.user
        newState.mode = json.mode
        newState.versions = json.versions

        if (newState.mode == null) {
          self.stopWebsocket()
        } else {
          self.startWebsocket()
        }
        self.setState(newState)
      })

    // Start WS only on game start.
    // FIXME: Uncomment.
    // self.syncGame();

    // Events listeners.
    //
    document.getElementById('root').addEventListener('ws.error', function (event) {
      const newState = update(self.state, {})
      newState.connection = 'error'
      // console.log('Error')
      // newState.language = event.detail.state.language;
      // newState.mode = event.detail.state.mode;
      // FIXME:Add-other-fields.
      self.setState(newState)
    })

    document.getElementById('root').addEventListener('ws.closed', function (event) {
      const newState = update(self.state, {})
      newState.connection = 'closed'
      // console.log('Closed')
      // newState.language = event.detail.state.language;
      // newState.mode = event.detail.state.mode;
      // FIXME:Add-other-fields.
      self.setState(newState)
    })

    document.getElementById('root').addEventListener('ws.opened', function (event) {
      const newState = update(self.state, {})
      newState.connection = 'Opened'
      // newState.language = event.detail.state.language;
      // newState.mode = event.detail.state.mode;
      // FIXME:Add-other-fields.
      self.setState(newState)
    })

    document.getElementById('root').addEventListener('game.help', function (event) {
      self.sendMessage({
        command: 'help',
        payload: {}
      })
    })

    document.getElementById('root').addEventListener('game.leave', function (event) {
      const newState = update(self.state, {})
      newState.mode = null
      newState.rounds = []
      newState.currentRound = -1
      newState.replyLetters = []
      newState.preloadedImages = {}
      self.setState(newState)
      self.sendMessage({
        command: 'leave',
        payload: {
          language: self.state.user.language,
          topic: self.state.user.topic
        }
      })
    })

    document.getElementById('root').addEventListener('challenge', function (event) {
      const newState = update(self.state, {})

      newState.challenge = {
        user: event.detail.user,
        timeout: 10
      }

      setTimeout(self.sendChallengeTickEvent, 1000)

      self.setState(newState)
    })

    document.getElementById('root').addEventListener('beginner.reply', function (event) {
      // console.log('userChoice: ', event.detail.userChoice)
      self.sendMessage({
        command: 'reply',
        level: 'beginner',
        payload: { userChoice: event.detail.userChoice }
      })
    })

    document.getElementById('root').addEventListener('image.load', function (event) {
      const newState = update(self.state, {})
      // console.log('!!!!!', event.detail.img.src, event.detail.roundIndex)
      if (newState.preloadedImages[event.detail.roundIndex] === undefined) {
        newState.preloadedImages[event.detail.roundIndex] = {}
      }
      newState.preloadedImages[event.detail.roundIndex][event.detail.imageIndex] = {
        img: event.detail.img,
        pointer: event.detail.imageMap.pointer
      }
      self.setState(newState)
    })

    document.getElementById('root').addEventListener('contest_enqueued', function (event) {
      const newState = update(self.state, {})
      newState.mode = 'contest_enqueued'
      self.setState(newState)
    })

    document.getElementById('root').addEventListener('tick-challenge', function (event) {
      if (self.state.challenge == null) {
        ;
      } else {
        const newState = update(self.state, {})
        const currentTimeout = newState.challenge.timeout

        if (currentTimeout === 1) {
          newState.challenge = null
        } else {
          newState.challenge.timeout -= 1
          setTimeout(self.sendChallengeTickEvent, 1000)
        }

        self.setState(newState)
      }
    })

    document.getElementById('root').addEventListener('state.update', function (event) {
      const newState = update(self.state, {})
      newState.players = event.detail.state.players
      newState.rounds = event.detail.state.rounds
      newState.currentRound = event.detail.state.currentRound
      newState.mode = event.detail.state.mode

      if (newState.currentRound === -1) {
        newState.replyLetters = []
        newState.replyMap = {}
        newState.preloadedImages = {}
      } else if (self.state.currentRound !== newState.currentRound) {
        // Round changed. Show ? for every letter of the question.
        const currentRound = newState.rounds[newState.currentRound - 1]
        if (newState.preloadedImages[newState.currentRound - 1] === undefined) {
          // console.log(
          //   'No images exist for #' + (newState.currentRound - 1) + ' round. Loading now...')
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
            // console.log('Round is missing image 0. Loading...')
            // TODO: Clean that hell.
            if (currentRound.img1 !== null) {
              preloadImage(newState.currentRound - 1, 0, currentRound.img1)
            }
          }
          if (newState.preloadedImages[newState.currentRound - 1][1] === undefined) {
            // console.log('Round is missing image 1. Loading...')
            if (currentRound.img2 !== null) {
              preloadImage(newState.currentRound - 1, 1, currentRound.img2)
            }
          }
          if (newState.preloadedImages[newState.currentRound - 1][2] === undefined) {
            // console.log('Round is missing image 2. Loading...')
            if (currentRound.img3 !== null) {
              preloadImage(newState.currentRound - 1, 2, currentRound.img3)
            }
          }
          if (newState.preloadedImages[newState.currentRound - 1][3] === undefined) {
            // console.log('Round is missing image 3. Loading...')
            if (currentRound.img4 !== null) {
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
      self.setState(newState)
    })

    document.getElementById('root').addEventListener('level-changed', function (event) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { level: event.detail.level, language: self.state.user.language } })
      }
      fetch('/api/v1/state', requestOptions)
        .then(response => response.json())
        .then(data => {
          const newState = update(self.state, {})
          newState.topics = data.topics
          newState.user.language = data.user.language
          newState.user.name = data.user.name
          newState.level = data.user.level
          newState.user.topic = data.topics[0].code
          newState.rounds = data.rounds || []
          newState.mode = data.mode
          newState.players = data.players
          newState.currentRound = data.currentRound
          self.setState(newState)
        })
    })

    document.getElementById('root').addEventListener('language-changed', function (event) {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { language: event.detail.language } })
      }
      fetch('/api/v1/state', requestOptions)
        .then(response => response.json())
        .then(data => {
          const newState = update(self.state, {})
          newState.topics = data.topics
          newState.user.language = data.user.language
          newState.user.name = data.user.name
          newState.user.topic = data.topics[0].code
          newState.rounds = data.rounds || []
          newState.mode = data.mode
          newState.players = data.players
          newState.currentRound = data.currentRound
          self.setState(newState)
        })

      /*
            fetch('/api/v1/state')
              .then(response => response.json())
              .then(json => {
                const newState = update(self.state, {});
                newState.languages = json.languages;
                newState.topics = json.topics;
                newState.user = json.user;
                self.setState(newState);
                self.startWebsocket();
            });
            */
    })

    document.getElementById('root').addEventListener('name-changed', function (event) {
      // Updates username

      // Update state and send to server side.
      const newState = update(self.state, {})
      newState.user.name = event.detail.name
      self.setState(newState)

      clearTimeout(self.nameUpdateTimeout)
      self.nameUpdateTimeout = setTimeout(self.saveState, 2000)
    })

    document.getElementById('root').addEventListener('contest-clicked', function (event) {
      // FIXME:
      const newState = update(self.state, {})
      newState.mode = 'contest_requested'
      self.setState(newState)

      self.sendMessage({
        command: 'contest',
        payload: {
          name: self.state.user.name,
          language: self.state.user.language,
          topic: self.state.user.topic,
          level: self.state.level
        }
      })
    })

    document.getElementById('root').addEventListener('train-clicked', function (event) {
      const newState = update(self.state, {})
      newState.mode = 'train_requested'
      self.setState(newState)
      self.sendMessage({
        command: 'train',
        payload: {
          name: self.state.user.name,
          language: self.state.user.language,
          topic: self.state.user.topic,
          level: self.state.level
        }
      })
    })

    // new CustomEvent('challenge-accepted', {detail: {}}));
    document.getElementById('root').addEventListener('challenge-accepted', function (event) {
      const newState = update(self.state, {})
      newState.challenge = null
      newState.currentRound = -1
      newState.replyLetters = []
      newState.replyMap = {}
      newState.preloadedImages = {}
      self.setState(newState)
      self.sendMessage({
        command: 'challenge-accept',
        payload: {
          language: self.state.user.language,
          topic: self.state.user.topic,
          level: self.state.level
        }
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
            level: self.state.user.level
          }
        })
      }
      fetch('/api/v1/state', requestOptions)
        .then(response => response.json())
        .then(data => {
          const newState = update(self.state, {})
          newState.user.topic = data.user.topic
          self.setState(newState)
        })
    })

    document.getElementById('root').addEventListener('reply-letter.remove', function (event) {
      // FIXME: Send to server
      // update-state
      // console.log(event.detail.letter);

      const newState = update(self.state, {})
      const replyWordIndex = event.detail.wordIndex
      const replyLetterIndex = event.detail.letterIndex
      const replyWordLetters = newState.replyLetters[replyWordIndex]
      const replyWordArray = replyWordLetters.split('')
      replyWordArray[replyLetterIndex] = '?'
      newState.replyLetters[replyWordIndex] = replyWordArray.join('')

      // Drop removed indexes.
      newState.replyMap[pair(replyWordIndex, replyLetterIndex)] = null
      self.setState(newState)
    })

    document.getElementById('root').addEventListener('question-letter.click', function (event) {
      const newState = update(self.state, {})
      // {topic: {$set: event.detail.topic}});
      // self.setState(newState);
      const wordIndex = event.detail.wordIndex
      const letterIndex = event.detail.letterIndex
      const letter = event.detail.letter
      const replyWordLetters = newState.replyLetters[wordIndex]
      const indexToReplace = replyWordLetters.indexOf('?')
      const updatedReplyWordLetters = replyWordLetters.replace('?', letter)
      newState.replyLetters[wordIndex] = updatedReplyWordLetters
      newState.replyMap[pair(wordIndex, indexToReplace)] = pair(wordIndex, letterIndex)
      self.setState(newState)

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
    })
  }

  componentWillUnmount () {
    ;
    // clearInterval(this.timerID);
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

  render () {
    const self = this
    const userLanguage = self.state.user.language || 'en'
    const versions = 'App: ' + self.state.versions.app +
      ', Release: ' + self.state.versions.release +
      ', Web: ' + self.state.versions.web
    // console.log('Version upgrade check! Before render.', self.state)
    if (self.state.connection === 'closed') {
      return (
        <div className="container">
          <br />
          <div style={{ float: 'left' }}>
            <a href="https://github.com/nmb10/sorat_web/issues" title={versions}>
              {t(userLanguage).report_an_issue}
            </a>
          </div>
          <div className="row">
            <div className="column">
              <div style={{ fontSize: '45px' }}>Connection closed. Please refresh the page.</div>
            </div>
          </div>
        </div>
      )
    } else if (this.state.connection === 'error') {
      return (
        <div className="container">
          <br />
          <div style={{ float: 'left' }}>
            <a href="https://github.com/nmb10/sorat_web/issues" title={versions}>
              {t(userLanguage).report_an_issue}
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
    if (this.state.currentRound === -1) {
      finishedRounds = this.state.rounds || []
    } else {
      finishedRounds = this.state.rounds.slice(0, this.state.currentRound - 1)
    }
    let splittedLettersItems = null

    let isSolved = false
    let currentRound = {}
    if (this.state.currentRound && this.state.currentRound !== -1) {
      currentRound = this.state.rounds[this.state.currentRound - 1]
      isSolved = currentRound.solutions[this.state.user.id].is_solved
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

      const replyMap = this.state.replyMap || {}
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
      replyLetterItems = replyLettersToRow(this.state.replyLetters[0], isSolved)
    }

    let contextBlock = null
    if (currentRound.context != null && currentRound.context !== '') {
      contextBlock = <span style={{ fontSize: '34px' }}>({currentRound.context_value || currentRound.context})</span>
    }

    let pointerBlock = null
    if (currentRound.pointer != null) {
      pointerBlock = <span style={{ fontSize: '34px' }}>#{currentRound.img1.pointer}</span>
    }

    let pointsBlock = null
    let points = 0
    if (isSolved && self.state.level === 'intermediate') {
      if (currentRound.solutions[this.state.user.id].hints.length === 3) {
        points = 0
      } else {
        points = '+' + (5 - currentRound.solutions[this.state.user.id].hints.length)
      }
      pointsBlock = <span style={{ color: 'green' }}>{points}</span>
    }

    // const languages = ['dig','os','ru','en'];
    // FIXME: Move to server side.
    const languageOptionItems = this.state.languages
      .map((language) => <option key={language.code} value={language.code}>{language.local_name}</option>)

    const levelOptionItems = levels
      .map((level) => <option key={level} value={level}>{t(userLanguage)[level]}</option>)

    const topicOptionItems = this.state.topics
      .map((topic) => <option key={topic.code} value={topic.code}>{topic.local_name}</option>)

    let trainBlock = null
    let contestBlock = null
    let challengeBlock = null

    if (this.state.challenge) {
      challengeBlock = (
        <div>
          {this.state.challenge.user.name} is challenging you!
          <button onClick={this.onAcceptClick}>Accept</button>
          (ignore to decline) ({this.state.challenge.timeout})
        </div>
      )
    }

    if (this.state.mode === 'contest') {
      trainBlock = (
        <button id='train' disabled onClick={this.onTrainClick}>
          {t(userLanguage).train}
        </button>)
      contestBlock = (
        <button onClick={self.leave} title='Leave game'>
          {t(userLanguage).leave}
        </button>)
    } else if (this.state.mode === 'train') {
      trainBlock = (
        <button onClick={self.leave} title='Leave game'>
          {t(userLanguage).leave}
        </button>)
      contestBlock = (
        <button disabled id='contest' onClick={this.onContestClick}>
          {t(userLanguage).contest}
        </button>)
    } else if (this.state.mode === 'contest_enqueued') {
      trainBlock = (
        <button id='train' disabled onClick={this.onTrainClick}>
          {t(userLanguage).train}
        </button>)

      contestBlock = (
        <button onClick={self.leave} title='Leave game'>
          {t(userLanguage).leave}<img src={spinner} alt="Spinner" />
        </button>)
    } else {
      trainBlock = (
        <button id='train' onClick={this.onTrainClick}>
          {t(userLanguage).train}
        </button>)
      contestBlock = (
        <button id='contest' onClick={this.onContestClick}>
          {t(userLanguage).contest}
        </button>)
    }

    let helpButton = null
    let roundDetails = null
    if (this.state.mode != null &&
                Object.keys(currentRound).length > 0) {
      roundDetails = (
        <span id='round-details' style={{ fontSize: '24px', marginTop: '10px', float: 'left' }}>
          Round #{this.state.currentRound} of {this.state.rounds.length}
        </span>)
      if (currentRound.solutions[this.state.user.id].hints.length < 3 && !isSolved) {
        helpButton = (
          <button onClick={self.getHelp}
                  title='(-1 to current game score)'
                  style={{ fontSize: '20px', float: 'left', margin: '5px', width: '145px', height: '45px' }}>
                        Help ({3 - currentRound.solutions[this.state.user.id].hints.length})
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

    const disabled = this.state.mode != null ? 'disabled' : ''

    let currentRoundTimeoutBlock = (<h3 style={{ fontSize: '45px', float: 'left', marginLeft: '15px' }}>{currentRound.timeout}&nbsp;|&nbsp;{pointsBlock}</h3>)
    if (currentRound.timeout <= 10 && !isSolved) {
      currentRoundTimeoutBlock = <h3 style={{ color: 'red', fontSize: '45px', float: 'left', marginLeft: '15px' }}>{currentRound.timeout}</h3>
    }

    let gameWidgetElems = null
    if (this.state.level === 'beginner' && Object.keys(currentRound).length > 0) {
      let score
      let correctChoice
      if (isSolved) {
        // TODO: Should be taken from server response, but API doesn't compute score for
        // current round yet.
        score = currentRound.solutions[this.state.user.id].attempts.length > 3 ? 0 : 5 - currentRound.solutions[this.state.user.id].attempts.length + 1
        correctChoice = currentRound.correct_choice
      }
      gameWidgetElems = <BeginnerGameWidget
        currentRound={currentRound}
        user={this.state.user}
        preloadedImages={this.state.preloadedImages}
        currentRoundIndex={this.state.currentRound - 1}
        correctChoice={correctChoice}
        isSolved={isSolved}
        score={score} />
      helpButton = null // FIXME: Find better solution.
      replyLetterItems = null
      splittedLettersItems = null
    } else if (this.state.level === 'intermediate' && Object.keys(currentRound).length > 0) {
      gameWidgetElems = <IntermediateGameWidget currentRound={currentRound} />
    }

    return (
      <div className="container">
        <br />
        <div style={{ float: 'left' }}>
          <a href="https://github.com/nmb10/sorat_web/issues" title={versions}>
            {t(userLanguage).report_an_issue}
          </a>
        </div>
        <div className="row">
          <div className="column">
            <div>
              <input type="text" placeholder="Username"
                     value={this.state.user.name}
                     onChange={this.handleNameChange}
                     style={{ color: 'white' }}>
              </input>
            </div>
          </div>
          <div className="column">
            <select disabled={disabled} value={this.state.user.language} onChange={this.handleLanguageChange}>
              <option value="">---</option>
              {languageOptionItems}
            </select>
          </div>
          <div className="column">
            <select disabled={disabled} value={this.state.level} onChange={this.handleLevelChange}>
              {levelOptionItems}
            </select>
          </div>
          <div className="column">
            <select disabled={disabled} value={this.state.user.topic} onChange={this.handleTopicChange}>
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
          <FinishedRoundsTable players={this.state.players} user={this.state.user} finishedRounds={finishedRounds} rounds={this.state.rounds} />
        </div>
        <div className="row">
          <div className="column">
            {gameWidgetElems}
            <div>
              {helpButton}&nbsp;
              {roundDetails}&nbsp;&nbsp;&nbsp;
              {currentRoundTimeoutBlock}
            </div>
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
