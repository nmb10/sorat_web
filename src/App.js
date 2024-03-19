import spinner from './spinner1.png'

import React from 'react'
import './App.css'
import PropTypes from 'prop-types'
import _ from 'lodash'

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
    'Image selection': 'Image selection',
    'Letters selection': 'Letters selection',
    'Report an issue': 'Report an issue',
    'Tell again': 'Tell again',
    Help: 'Help',
    Contribute: 'Contribute',
    Leave: 'Leave',
    Contest: 'Contest',
    'Find rival': 'Find rival',
    'Start train': 'Start train',
    Train: 'Train',
    Amazing: 'Amazing',
    'Amazing. New round will start in': 'Amazing. New round will start in',
    'Well, but not enough. Try again in': 'Well, but not enough. Try again in',
    'Very well. New round will start in': 'Very well. New round will start in',
    seconds: 'seconds',
    'Very well': 'Very well',
    'Well done': 'Well done',
    'So bad. You can do better!': 'So bad. You can do better!',
    Explore: 'Explore',
    'What?': 'What?',
    'You won!': 'You won!',

    // levels
    Simple: 'Simple',
    Normal: 'Normal',
    Hard: 'Hard'
  },
  de: {
    'Image selection': 'Auswahl des Bildes',
    'Letters selection': 'Auswahl der Briefe',
    'Report an issue': 'Ein Problem melden',
    Contribute: 'Beitragen',
    Leave: 'Verlassen',
    Contest: 'Wettbewerb',
    Train: 'Zug',
    'Start contest': 'Rivalen finden',
    'Start train': 'Zug starten',
    Amazing: 'Erstaunlich',
    'Very well': 'Sehr gut',
    Well: 'Quelle',
    'So bad. You can do better!': 'So schlecht. Das kannst du besser!',
    Explore: 'Erkunden',
    'What?': 'Wie?',
    'You won!': 'Du hast gewonnen!',

    // levels
    Simple: 'Einfach',
    Normal: 'Normal',
    Hard: 'Hart'
  },
  ru: {
    'Image selection': 'Подбор изображения',
    'Letters selection': 'Подбор букв',
    'Report an issue': 'Сообщить о проблеме',
    Contribute: 'Поучаствовать',
    Leave: 'Выйти',
    Contest: 'Состязание',
    Train: 'Тренировка',
    'Start contest': 'Найти соперника',
    'Start train': 'Начать тренировку',
    Amazing: 'Великолепно',
    'Amazing. New round will start in': 'Великолепно. Новый раунд начнется через',
    'Well, but not enough. Try again in': 'Хорошо, но недостаточно. Попробуй еще раз через',
    'Very well. New round will start in': 'Очень хорошо. Новый раунд начнется через',
    seconds: 'секунд',
    'Very well': 'Очень хорошо',
    Well: 'Хорошо',
    'So bad. You can do better!': 'Плохо. Ты можешь лучше!',
    Explore: 'Прохождение',
    'What?': 'Как?',
    'You won!': 'Ты выиграл!',

    // levels
    Simple: 'Простой',
    Normal: 'Средний',
    Hard: 'Трудный'
  },
  os: {
    'Image selection': 'Сурæт æвзарын',
    'Letters selection': 'Дамгъæтæ æвзарын',
    'Report an issue': 'Рæдыд фехъусын кæнын',
    Contribute: 'Æмгуыстад',
    Leave: 'Ацæуын',
    Contest: 'Ерыс',
    Train: 'Ахуыр',
    'Start-contest': 'Ерыс райдайын',
    'Start-train': 'Ахуыр райдайын',
    Amazing: 'Иттæг хорз',
    'Very well': 'Тынг хорз',
    Well: 'Хорз у',
    'So bad. You can do better!': 'Æвзæр. Дæ бон хуæздæр у!',
    Explore: 'Иртасæн',
    'What?': 'Куыд?',
    'You won!': 'Ды рамбылдтай!',

    // levels
    Simple: 'Хумæтæг',
    Normal: 'Астæуккаг',
    Hard: 'Зын'
  },
  dig: {
    'Image selection': 'Сорæт æвзарун',
    'Letters selection': 'Дамугътæ æвзарун',
    'Report an issue': 'Рæдуд фегъосун кæнун',
    Help: 'Агъаз',
    Contribute: 'Æгустадæ',
    Leave: 'Рандæ ун',
    Contest: 'Ерис',
    Train: 'Ахур',
    'Start contest': 'Ерис райдайун',
    'Start train': 'Ахур райдайун',
    Amazing: 'Хъæбæр хуарз',
    'Very well': 'Хуарз',
    Well: 'Бæззуй',
    'So bad. You can do better!': 'Лæгъуз. Дæ бон хуæздæр æй!',
    Explore: 'Æсгарун',
    'What?': 'Куд?',
    'You won!': 'You won! FIXME:',

    // levels
    Simple: 'Еувазæг',
    Normal: 'Уаггин',
    Hard: 'Гъесгун'
  },
  fr: {
    'Image selection': 'Sélection des images',
    'Letters selection': 'Sélection de lettres',
    'Report an issue': 'Signaler un problème',
    Contribute: 'Contribuer',
    Leave: 'Laisser',
    Contest: 'Concours',
    Train: 'Former',
    'Start contest': 'Démarrer le concours',
    'Start train': 'Démarrer le train',
    Amazing: 'Incroyable',
    'Very well': 'Très bien',
    Well: 'Bien',
    'So bad. You can do better!': 'Dommage. Tu peux faire mieux!',
    Explore: 'Explorer',
    'What?': 'Quoi?',
    'You won!': 'Tu as gagné',

    // levels
    Simple: 'Simple',
    Normal: 'Normale',
    Hard: 'Dur'
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

// FIXME: Move to css.
//
const questionLetterStyle = {
  fontSize: '30px',
  float: 'left',
  marginLeft: '5px',
  padding: 0,
  width: '60px',
  height: '60px'
}

const finishStatusStyle = {
  minWidth: '400px',
  minHeight: '60px',
  border: '3px solid green',
  fontSize: '44px',
  position: 'fixed',
  top: '45px',
  backgroundColor: '#282c34',
  padding: '5px',
  borderRadius: '10px'
}

function trn (userLanguage, text) {
  let searchText = text
  if (searchText === 'image-selection') {
    // select box options.
    searchText = 'Image selection'
  } else if (searchText === 'letters-selection') {
    searchText = 'Letters selection'
  } else if (searchText === 'normal') {
    searchText = 'Normal'
  } else if (searchText === 'simple') {
    searchText = 'Simple'
  } else if (searchText === 'hard') {
    searchText = 'Hard'
  }
  return translations[userLanguage][searchText] || (userLanguage + ': ' + searchText)
}

function getSecondsDiff (dt1, dt2) {
  const diffMs = dt1.getTime() - dt2.getTime()
  return diffMs / 1000
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
        const questionLetter = <td style={{ display: 'inline-block', padding: 0, borderBottom: 0 }}><QuestionLetter letter={letter} wordIndex={0} letterIndex={letterIndex} isChosen={isChosen} /></td>
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

function replyLettersToRow (words, isSolved, attempts) {
  const replyLetters = []
  let inReplyWords = false
  for (let i = 0; i < attempts.length; ++i) {
    if (attempts[i].reply.includes(words)) {
      inReplyWords = true
      break
    }
  }

  const isWrongReply = !isSolved && inReplyWords

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

ProgressWidget.propTypes = {
  games: PropTypes.array
}

function ProgressWidget (props) {
  /* example of finishedRounds
  * FIXME: Add example.
  */

  let temp = ''
  let temp1 = []
  const splitted = []
  // FIXME: Too dirty. Add tests and refactor.
  for (let i = 0; i < props.games.length; ++i) {
    if (temp === '') {
      temp = props.games[i].topic.code
    }

    if (temp === props.games[i].topic.code) {
      temp1.push(props.games[i])
    } else {
      splitted.push(temp1)
      temp = props.games[i].topic.code
      temp1 = [props.games[i]]
    }
  }
  if (temp1.length >= 0) {
    splitted.push(temp1)
  }

  const rows = []

  for (let i = 0; i < splitted.length; ++i) {
    rows.push(<TopicElems sets={ splitted[i] } />)
  }

  return (
    <div>
      { rows }
    </div>
  )
};

TopicElems.propTypes = {
  sets: PropTypes.array
}

function TopicElems (props) {
  const rows = []

  let topicLocalName = ''

  for (let i = 0; i < props.sets.length; ++i) {
    topicLocalName = props.sets[i].topic.local_name
    if (props.sets[i].is_solved) {
      rows.push(<div style={{ border: '4px green solid', float: 'left', margin: '3px' }}>&nbsp;&nbsp;</div>)
    } else {
      rows.push(<div style={{ border: '4px gray solid', float: 'left', margin: '3px' }}>&nbsp;&nbsp;</div>)
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
      <img className="word-image"
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
  if (props.isSolved) {
    return (
      <img className="word-image word-image-solved" src={props.currentRound.img1.src}/>
    )
  } else {
    return (
      <img className="word-image" src={props.currentRound.img1.src}/>
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
  score: PropTypes.number
}

function SelectImageGameWidget (props) {
  const localTerm = props.currentRound.local_term || ''
  const currentRoundIndex = props.currentRoundIndex
  const localTermLetters = <div className="image-selection-letters">{ localTerm }</div>
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

  if (props.isChosen || props.letter === ' ') {
    return (
      <button disabled style={questionLetterStyle}>
        {props.letter}
      </button>
    )
  } else {
    return (
      <button onClick={onClick} style={questionLetterStyle}>
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
        <div className="reply-letter" title="Remove letter" style={ letterStyle } onClick={onRemoveClick}>
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
        translations: ''
      },
      user: {
        name: null,
        id: null,
        language: document.location.pathname.replaceAll('/', '') || 'en', // selected language
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
      modeOpened: null,
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
      slowConnection: false,
      progress: {},
      finishStatusDisplayTimeout: -1,
      recentReplyTime: Date.now(),
      autoplayEnabled: true,
      soundVolume: 50,
      voicePlayed: false
    }

    this.nameUpdateTimeout = null
    this.onTrainClick = this.onTrainClick.bind(this)
    this.saveState = this.saveState.bind(this)
    this.onContestClick = this.onContestClick.bind(this)
    this.onExploreClick = this.onExploreClick.bind(this)
    this.onAcceptClick = this.onAcceptClick.bind(this)
    this.onDeclineClick = this.onDeclineClick.bind(this)
    this.startWebsocket = this.startWebsocket.bind(this)
    this.stopWebsocket = this.stopWebsocket.bind(this)
    this.sendMessageByTimeout = this.sendMessageByTimeout.bind(this)
    this.checkSlowConnection = this.checkSlowConnection.bind(this)
    this.startSlowConnectionMonitor = this.startSlowConnectionMonitor.bind(this)
    this.stopSlowConnectionMonitor = this.stopSlowConnectionMonitor.bind(this)
    this.displayFinishStatus = this.displayFinishStatus.bind(this)
    this.onAutoplayToggleClick = this.onAutoplayToggleClick.bind(this)
    this.onVolumeChange = this.onVolumeChange.bind(this)
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
                  players: message.payload.players,
                  rounds: message.payload.rounds,
                  currentRound: message.payload.current_round,
                  progress: message.payload.progress,
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
    let intervalID

    const sendPing = function () {
      if (self.websocket.readyState === WebSocket.OPEN) {
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

  displayFinishStatus () {
    const self = this
    /*
        if (self.state.finishStatusDisplayTimeout === 1) {
          // FIXME: Restart game.
        }
    */
    if (self.state.finishStatusDisplayTimeout > 0) {
      document.getElementById('root').dispatchEvent(
        new CustomEvent('finish-status.tick', { detail: {} }))
      setTimeout(self.displayFinishStatus, 1000)
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
          const newState = _.cloneDeep(prevState)
          newState.languages = json.languages
          newState.topics = json.topics
          newState.user = json.user
          newState.mode = json.mode
          newState.modeOpened = json.mode
          newState.method = json.method
          newState.versions = json.versions
          newState.stateReceived = true

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

    document.getElementById('root').addEventListener('finish-status.tick', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.finishStatusDisplayTimeout -= 1
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

      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.mode = null
        newState.modeOpened = null
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
      // console.log('userChoice: ', event.detail.userChoice)
      self.sendMessage({
        command: 'reply',
        method: 'image-selection',
        payload: { userChoice: event.detail.userChoice }
      })

      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.recentReplyTime = Date.now()
        return newState
      })
    })

    document.getElementById('root').addEventListener('image.load', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
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
        newState.progress = event.detail.state.progress || {}
        newState.mode = event.detail.state.mode
        newState.method = event.detail.state.method
        newState.gameLastMessageTime = event.detail.state.gameLastMessageTime

        if (newState.currentRound === -1) {
          newState.replyLetters = []
          newState.replyMap = {}
          newState.preloadedImages = {}
          newState.gameLastMessageTime = null
          newState.finishStatusDisplayTimeout = 5
          self.stopSlowConnectionMonitor()
          self.displayFinishStatus()
        } else if (self.state.currentRound !== newState.currentRound) {
          // Round changed. Show ? for every letter of the question.
          newState.voicePlayed = false
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
        document.location.pathname = '/'
      } else {
        document.location.pathname = '/' + event.detail.language
      }
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
        return newState
      })
    })

    document.getElementById('root').addEventListener('autoplay-disabled', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.autoplayEnabled = false
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

    document.getElementById('root').addEventListener('train-clicked', function (event) {
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        if (newState.modeOpened === 'train') {
          newState.mode = 'train_requested'
          // We always send user in payload because server may loose initial state once (on
          // backend restart for example).
          self.sendMessage({ command: 'train', payload: { user: newState.user } })
        } else {
          newState.modeOpened = 'train'
        }
        return newState
      })
    })

    document.getElementById('root').addEventListener('explore-clicked', function (event) {
      // FIXME:
      self.setState(prevState => {
        const newState = _.cloneDeep(prevState)
        newState.mode = 'explore_requested'
        newState.modeOpened = 'explore'
        // We always send user in payload because server may loose initial state once (on
        // backend restart for example).
        self.sendMessage({ command: 'explore', payload: { user: newState.user } })
        return newState
      })
    })

    // new CustomEvent('challenge-accepted', {detail: {}}));
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
        newState.recentReplyTime = Date.now()

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
      new CustomEvent('explore-clicked', { detail: {} }))
  }

  playSound (src, volume) {
    const voice1 = new Audio(src)
    voice1.volume = volume / 100.0
    voice1.play()

    document.getElementById('root').dispatchEvent(
      new CustomEvent('voice.played', { detail: { src: src, soundVolume: volume } }))
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

    const languageOptionItems = self.state.languages
      .map((language) => <option key={language.code} value={language.code}>{language.local_name}</option>)

    const volumeWidget = (
      <input type="range" id="volume" name="volume" min="0" max="100" defaultValue={self.state.soundVolume} onChange={this.onVolumeChange}/>
    )

    const header = (
      <div className="row">
        <div className="column">
          <img style={{ float: 'left', padding: '5px' }} src="/logo.png" alt="Logo" />
        </div>
        <div className="column">
          <a style={{ float: 'right' }} href="https://github.com/nmb10/sorat_web/issues" title={versions}>
            {trn(userLanguage, 'Report an issue')}
          </a>
        </div>
        <div className="column">
          <a style={{ float: 'left' }} href="https://github.com/nmb10/sorat_translations">
            {trn(userLanguage, 'Contribute')}
          </a>
        </div>
        <div className="column">
          <div>
            <label htmlFor="autoplay-toggle-checkbox" title="Enable or disable autoplay">
              Autoplay:
              <input id="autoplay-toggle-checkbox" type="checkbox" checked={self.state.autoplayEnabled} onClick={this.onAutoplayToggleClick}/>
            </label>
          </div>
          <div>
            {volumeWidget}
          </div>
        </div>
        <div className="column">
          <select id="language" style={{ backgroundColor: '#282c34' }} value={self.state.user.language} onChange={self.handleLanguageChange}>
            <option value="">---</option>
            {languageOptionItems}
          </select>
        </div>
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

      if (Object.keys(self.state.rounds[0].solutions).length === 1) {
        // Single player mode (train/progress)
        let scorePercent = 0
        if (userScores.all.length > 0) {
          const totalPossible = 5 * userScores.all.length
          scorePercent = (userScores.total / totalPossible) * 100
        }

        if (scorePercent >= 95) {
          if (self.state.modeOpened === 'explore') {
            finishStatus = trn(userLanguage, 'Amazing. New round will start in') + ' ' + self.state.finishStatusDisplayTimeout + ' ' + trn(userLanguage, 'seconds.')
          } else {
            finishStatus = trn(userLanguage, 'Amazing')
          }
        } else if (scorePercent >= 80) {
          if (self.state.modeOpened === 'explore') {
            finishStatus = trn(userLanguage, 'Very well. New round will start in') + ' ' + self.state.finishStatusDisplayTimeout + ' ' + trn(userLanguage, 'seconds.')
          } else {
            finishStatus = trn(userLanguage, 'Very well')
          }
        } else if (scorePercent >= 60) {
          if (self.state.modeOpened === 'explore') {
            finishStatus = trn(userLanguage, 'Well, but not enough. Try again in') + ' ' + self.state.finishStatusDisplayTimeout + ' ' + trn(userLanguage, 'seconds.')
            finishStatusStyle.border = '3px solid red'
          } else {
            finishStatus = trn(userLanguage, 'Well')
          }
        } else {
          if (self.state.modeOpened === 'explore') {
            finishStatus = trn(userLanguage, 'So bad. Try again in') + ' ' + self.state.finishStatusDisplayTimeout + ' ' + trn(userLanguage, 'seconds.')
            finishStatusStyle.border = '3px solid red'
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

    const secondsFromRecentAction = (Date.now() - self.state.recentReplyTime) / 1000

    const startNextExploreGame = self.state.finishStatusDisplayTimeout === 5 &&
      self.state.modeOpened === 'explore' &&
      secondsFromRecentAction < 60

    let splittedLettersItems

    let isSolved
    let currentRound = {}
    if (self.state.currentRound && self.state.currentRound !== -1) {
      currentRound = self.state.rounds[self.state.currentRound - 1]
      isSolved = currentRound.solutions[self.state.user.id].is_solved
    }
    const currentRoundNotEmpty = Object.keys(currentRound).length > 0
    const currentRoundIsEmpty = Object.keys(currentRound).length === 0

    if (startNextExploreGame && currentRoundIsEmpty) {
      setTimeout(
        function () {
          self.sendMessage({ command: 'explore', payload: { user: self.state.user } })
        },
        5000)
    }

    let replyLetterItems = []

    if (currentRoundNotEmpty) {
      // New responsive implementation
      // FIXME: handle currentRound.question as string instead of list of words.
      const attempts = currentRound.solutions[self.state.user.id].attempts
      replyLetterItems = replyLettersToRow(self.state.replyLetters[0], isSolved, attempts)

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

    let pointsBlock
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
    const methodOptionItems = methods
      .map((method) => <option key={method} value={method}>{trn(userLanguage, method)}</option>)

    const levelOptionItems = levels
      .map((level) => <option key={level} value={level}>{trn(userLanguage, level)}</option>)

    const topicOptionItems = self.state.topics
      .map((topic) => <option key={topic.code} value={topic.code}>{topic.local_name}</option>)

    let trainBlock
    let contestBlock
    let challengeBlock
    let exploreBlock

    if (self.state.challenge) {
      challengeBlock = (
        <div className="row">
          {self.state.challenge.user.name} is challenging you!
          <button onClick={self.onAcceptClick}>Accept</button>
          (ignore to decline) ({self.state.challenge.timeout})
        </div>)
    }

    if (self.state.mode === 'contest') {
      contestBlock = (
        <button onClick={self.leave} title={trn(userLanguage, 'Leave')}>
          {trn(userLanguage, 'Leave')}
        </button>)
    } else if (self.state.modeOpened === 'contest') {
      contestBlock = (
        <button id='contest' onClick={self.onContestClick}>
          {trn(userLanguage, 'Start contest')}
        </button>)
    } else if (self.state.mode === 'train') {
      trainBlock = (
        <button onClick={self.leave} title={trn(userLanguage, 'Leave')}>
          {trn(userLanguage, 'Leave')}
        </button>)
    } else if (self.state.modeOpened === 'train') {
      trainBlock = (
        <button id='train' onClick={self.onTrainClick}>
          {trn(userLanguage, 'Start train')}
        </button>)
    } else if (self.state.mode === 'contest_enqueued') {
      contestBlock = (
        <button onClick={self.leave} title={trn(userLanguage, 'Leave')}>
          {trn(userLanguage, 'Leave')}<img src={spinner} alt="Spinner" />
        </button>)
    } else if (self.state.mode === 'explore_requested') {
      exploreBlock = (
        <button id="explore" onClick={self.leave} title={trn(userLanguage, 'Leave')}>
          {trn(userLanguage, 'Leave')}<img src={spinner} alt="Spinner" />
        </button>)
    } else if (self.state.modeOpened === 'explore') {
      exploreBlock = (
        <button id="explore" onClick={self.leave} title={trn(userLanguage, 'Leave')}>
          {trn(userLanguage, 'Leave')}
        </button>)
    } else {
      trainBlock = (
        <button id="train" onClick={self.onTrainClick}>
          {trn(userLanguage, 'Train')}
        </button>)
      contestBlock = (
        <button id="contest" onClick={self.onContestClick}>
          {trn(userLanguage, 'Contest')}
        </button>)
      exploreBlock = (
        <button id="explore" onClick={self.onExploreClick} title={trn(userLanguage, 'Explore')}>
          {trn(userLanguage, 'Explore')}
        </button>)
    }

    let helpButton
    let roundDetails
    if (self.state.mode != null && currentRoundNotEmpty) {
      roundDetails = (
        <span id='round-details' style={{ fontSize: '24px', marginTop: '10px', float: 'left' }}>
          Round #{self.state.currentRound} of {self.state.rounds.length}
        </span>)
      if (currentRound.solutions[self.state.user.id].hints.length < 3 && !isSolved) {
        helpButton = (
          <button onClick={self.getHelp}
                  title='(-1 to current game score)'
                  style={{ fontSize: '16px', float: 'left', margin: '5px', width: '165px', height: '45px' }}>
                  { trn(userLanguage, 'Help') } ({3 - currentRound.solutions[self.state.user.id].hints.length})
          </button>
        )
      } else {
        helpButton = (
          <button onClick={self.getHelp}
                  disabled='disabled'
                  title='(-1 to current game score)'
                  style={{ fontSize: '16px', float: 'left', margin: '5px', width: '165px', height: '45px' }}>
            { trn(userLanguage, 'Help') } (0)
          </button>
        )
      }
    }

    const disabled = self.state.mode != null ? 'disabled' : ''

    let currentRoundTimeoutBlock = (
        <h3 style={{ fontSize: '45px', float: 'left', marginLeft: '15px' }}>
          {pointsBlock}
        </h3>)

    if (!isSolved) {
      currentRoundTimeoutBlock = (
        <h3 style={{ fontSize: '45px', float: 'left', marginLeft: '15px' }}>
          {currentRound.timeout}
        </h3>)
    } else if (currentRound.timeout <= 10 && !isSolved) {
      currentRoundTimeoutBlock = (
        <h3 style={{ color: 'red', fontSize: '45px', float: 'left', marginLeft: '15px' }}>
          {currentRound.timeout}
        </h3>)
    }

    let gameWidgetElems
    let gameColumn
    if (currentRoundNotEmpty) {
      if (self.state.method === 'image-selection') {
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
        gameColumn = <div className="column">{gameWidgetElems}</div>
      } else if (self.state.method === 'letters-selection') {
        gameWidgetElems = <SelectLettersGameWidget currentRound={currentRound} isSolved={isSolved}/>
        gameColumn = <div className="column image-wrapper">{gameWidgetElems}</div>
      } else {
        // console.log('Warning: Game is running but method is unknwon. method: ', self.state.method)
        ;
      }
    }

    let progressRows = ''
    if (self.state.modeOpened === 'explore' && self.state.progress.simple) {
      progressRows = (
        <table>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                {trn(userLanguage, 'Simple')}
              </td>
              <td>
                <ProgressWidget games={self.state.progress.simple || []} />
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                {trn(userLanguage, 'Normal')}
              </td>
              <td>
                <ProgressWidget games={self.state.progress.normal || []} />
              </td>
            </tr>
            <tr>
              <td style={{ verticalAlign: 'top' }}>
                {trn(userLanguage, 'Hard')}
              </td>
              <td>
                <ProgressWidget games={self.state.progress.hard || []} />
              </td>
            </tr>
          </tbody>
        </table>
      )
    }

    let methodSelectBox
    let levelSelectBox
    let topicSelectBox
    let usernameInput
    let finishedRoundsTable

    if (self.state.modeOpened === 'train') {
      methodSelectBox = <select id="method" style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.method} onChange={self.handleMethodChange}>
        {methodOptionItems}
      </select>

      levelSelectBox = <select id="level" style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.level} onChange={self.handleLevelChange}>
        {levelOptionItems}
      </select>

      topicSelectBox = <select id="topic" style={{ backgroundColor: '#282c34' }} disabled={disabled} value={self.state.user.topic} onChange={self.handleTopicChange}>
        <option value="">---</option>
        {topicOptionItems}
      </select>
    } else if (self.state.modeOpened === 'contest') {
      usernameInput = (
        <input type="text" placeholder="Username"
               value={self.state.user.name}
               onChange={self.handleNameChange}
               style={{ color: 'white' }}>
        </input>)
    }

    if (self.state.mode === 'contest') {
      finishedRoundsTable = <FinishedRoundsTable players={self.state.players} user={self.state.user} finishedRounds={finishedRounds} rounds={self.state.rounds} />
    }

    if (currentRound.voice_path && currentRound.voice_path.src && self.state.autoplayEnabled && self.state.soundVolume > 0 && !self.state.voicePlayed) {
      self.playSound(currentRound.voice_path.src, self.state.soundVolume)
    }

    let voiceButton
    if (currentRound.voice_path && currentRound.voice_path.src) {
      voiceButton = (
        <button onClick={() => self.playSound(currentRound.voice_path.src, self.state.soundVolume)}
                title={trn(userLanguage, 'Tell again')}
                style={{ fontSize: '20px', float: 'left', margin: '5px', width: '145px', height: '45px' }}>
          {trn(userLanguage, 'What?')}
        </button>
      )
    }

    return (
    <>
      <header className="App-header">
        {header}
      </header>
      <div className="container">
        <br />
        {finishStatusBlock}
        <div className="row">
          <div className="column">
            {gameErrorBlock}
            {gameWarningBlock}
            <div>
              {usernameInput}
            </div>
          </div>
          <div className="column">
            {methodSelectBox}
          </div>
          <div className="column">
            {levelSelectBox}
          </div>
          <div className="column">
            {topicSelectBox}
          </div>
          <div className="column">
            {trainBlock}
          </div>
          <div className="column">
            {contestBlock}
          </div>
          <div className="column">
            {exploreBlock}
          </div>
        </div>
        <div className="row">
          {finishedRoundsTable}
        </div>
        <div className="row">
          {gameColumn}
        </div>
        <div className="row">
          <div className="column">
            {helpButton}&nbsp;
            {voiceButton}
            {roundDetails}&nbsp;&nbsp;&nbsp;
            {currentRoundTimeoutBlock}
          </div>
        </div>
        {challengeBlock}
        {contextBlock}
        <div className="row">
          {replyLetterItems}
        </div>
        <div className="row">
          <div id="letters">
            {splittedLettersItems}
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
