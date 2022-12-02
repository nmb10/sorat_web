import logo from './logo.svg';
import React from 'react';
import './App.css';
import update from 'react-addons-update';


function questionLettersToTable(questionLetters, chosenQueryIndexes) {
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
        13: [1, 2],
        14: [3, 5],
        15: [4, 4],
        16: [4, 4],
        17: [4, 5],
        18: [4, 5],
        19: [4, 5],
        20: [4, 5],
    } // :)
    let tableRowsCount, tableColumnsCount, letterIndex, letter;
    [tableRowsCount, tableColumnsCount] = tableSizeMap[questionLetters.length];

    let tableRows = [];

    for (let i = 0; i < tableRowsCount; ++i) {
        let rowElems = [];
        for (let j = 0; j < tableColumnsCount; ++j) {
            if (questionLetters.length > 0) {
                [letterIndex, letter] = questionLetters.shift();
                let isChosen = chosenQueryIndexes.includes(pair(0, letterIndex));
                let questionLetter = <td style={{display: "inline-block", padding: 0}}><QuestionLetter letter={letter} wordIndex={0} letterIndex={letterIndex} isChosen={isChosen} /></td>;
                rowElems.push(questionLetter);
            }
        }
        tableRows.push(<tr>{rowElems}</tr>);
    }

    return (
        <table>
            <tbody>
                {tableRows}
            </tbody>
        </table>
    );
};


function userHasLeft(user, players) {
    for (let i=0; i < players.length; ++i) {
        if (players[i].id == user.id) {
            return players[i].left_at == "now";
        }
    }
    return false;
};


function pair(wordIndex, letterIndex) {
    return wordIndex + ',' + letterIndex;
}


function replyLettersToRow(words, isSolved) {
    let replyLetters = [];
    for (let j = 0; j < words.length; ++j) {
        replyLetters.push(
            <ReplyLetter isSolved={isSolved} letter={words[j]} wordIndex={0} letterIndex={j} />);
    }

    return (
        <div style={{whiteSpace: "nowrap"}}>
            {replyLetters}
        </div>
    );
};


function formatFloat(number) {
    return parseFloat(number.toFixed(2))
}


function userScoreToRow(score) {
    const totalPossible = 5 * score.all.length;
    const scorePercent = formatFloat((score.total / totalPossible) * 100);

    const allScores = score.all.slice(-3).map((score1) => <td>{score1}</td>);
    return (
        <tr>
            <td>{score.name}</td>
            <td><span className="user-total-score">{score.total}({scorePercent}%)</span></td>
            <td>...</td>
            {allScores}
        </tr>
    )
};


function FinishedRoundsTable(props) {

    /* example of finishedRounds
     * FIXME: Add example.
     */

    let scores = {};

    for (let i = 0; i < props.finishedRounds.length; ++i) {
        for (const userId in props.finishedRounds[i].solutions) {
            if (userId in scores) {
                scores[userId]['total'] += props.finishedRounds[i].solutions[userId].score;
                scores[userId]['all'].push(props.finishedRounds[i].solutions[userId].score);
            } else {
                scores[userId] = {
                    name: props.finishedRounds[i].solutions[userId].name,
                    total: props.finishedRounds[i].solutions[userId].score,
                    all: [props.finishedRounds[i].solutions[userId].score]
                };
            }
        }
    }

    let imageRowElems = [];
    let wordRowElems = [];
    let pointsRowsElems = [];

    for (const userId in scores) {
        pointsRowsElems.push(userScoreToRow(scores[userId]));
    }

    if (props.finishedRounds.length > 0) {
        for (const round of props.finishedRounds.slice(-3)) {
            imageRowElems.push(
                <td><img src={round.img} style={{width:"30%", height:"auto"}} /></td>);
            wordRowElems.push(
                <td>{round.local_term}</td>);
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

function Language(props) {

    function onClick(e) {
        e.preventDefault();
        document.getElementById('root').dispatchEvent(
            new CustomEvent("game.create", {detail: { name: props.gameName }}))
    };
    return (
        <li>
            <a href="#" onClick={onClick}>{props.language}</a>
        </li>
    )
};


function Game(props) {
    const languageItems = props.languages.map((language) => <Language gameName={props.name} language={language}/>);
    return (
        <div>
            <h3 key="{this.props.name}">{props.name}</h3>
            <ul>
                {languageItems}
            </ul>
        </div>
    )
};

function GamePlayer(props){
    return (
        <div className="game-player">
            Name({props.player.name}) ({props.player.id.substring(0, 4)})
        </div>
    )
};


function QuestionLetter(props) {

    function onClick(e) {
        document.getElementById('root').dispatchEvent(
            new CustomEvent(
                "question-letter.click",
                {detail: { letter: props.letter, wordIndex: props.wordIndex, letterIndex: props.letterIndex}}))
    };

    const style = {fontSize:"40px", float:"left", marginLeft:"3px", width:"75px", height:"75px"};
    // FIXME: Move to css.

    if (props.isChosen || props.letter == " ") {
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


function ReplyLetter(props) {

    function onClick(e) {
        e.preventDefault();
        let eventDetail = {
            detail: {
                letter: props.letter,
                wordIndex: props.wordIndex,
                letterIndex: props.letterIndex}};
        document.getElementById('root').dispatchEvent(
            new CustomEvent('reply-letter.remove', eventDetail));
    };

    const borderStyle = 'solid gray 2px';

    let removeLink = <a href="#" onClick={onClick}>x</a>;
    if (props.isSolved || props.letter == " ") {
        removeLink = '';
    }

    return (
        <div
            className="reply-letter"
            style={{border:borderStyle}}>
            {removeLink}
            <span style={{fontSize:"40px"}}>
                {props.letter}
            </span>
        </div>
    )
};


class Main extends React.Component {

    constructor(props) {
        super(props);

        // Initial state
        this.state = {
            user: {
                name: null,
                id: null,
                language: null,  // selected language
                topic: null,  // selected topic.
            },
            challenge: null,
            connection: "",
            languages: [], // all languages.
            topics: [], // all topics of the selected language.
            mode: null,  // train_requested, train, contest_requested, contest_enqueued, contest_accepted
            rounds: [],
            replyMap: {},  // Question letters indexes clicked while replying.
            replyLetters: [],  // Letters user clicked while replying
            currentRound: null,
            players: {}  // current round players.
        }

        this.nameUpdateTimeout = null;
        this.onTrainClick = this.onTrainClick.bind(this);
        this.saveState = this.saveState.bind(this);
        this.onContestClick = this.onContestClick.bind(this);
        this.onAcceptClick = this.onAcceptClick.bind(this);
        this.onDeclineClick = this.onDeclineClick.bind(this);
        this.startWebsocket = this.startWebsocket.bind(this);
        this.stopWebsocket = this.stopWebsocket.bind(this);
        this.sendMessageByTimeout = this.sendMessageByTimeout.bind(this);
    }

    sendMessageByTimeout(message) {
        const self = this;
        if (self.state.connection == 'Opened') {
            if (self.websocket.readyState == self.websocket.OPEN) {
                self.websocket.send(JSON.stringify(message));
            } else {
                console.log('Websocket is not connected.');
            }
        } else {
            console.log('Not opened. Still waiting...');
            setTimeout(self.sendMessageByTimeout, 500, message);
        }
    }

    sendMessage(message) {
        const self = this;
        if (self.state.connection == 'Opened') {
            if (self.websocket.readyState == self.websocket.OPEN) {
                self.websocket.send(JSON.stringify(message));
            } else {
                console.log('Websocket is not connected.');
            }
        } else {
            self.startWebsocket();
            self.sendMessageByTimeout(message);
        }
    }

    startWebsocket() {

        console.log('Initializing WS now...');
        const self = this;
        // var wsHost = 'ws://127.0.0.1:8080/game.ws';
        // var wsHost = 'ws://' + window.location.host + '/game.ws';
        var wsHost = 'ws://' + window.location.host + '/game.ws';
        if (window.location.protocol == 'https:') {
            wsHost = 'wss://' + window.location.host + '/game.ws';
        }
        self.websocket = new WebSocket(wsHost);

        var onMessage = function(event) {
            var message = JSON.parse(event.data);
            // console.log('New message:', message);
            if (message.type == 'game') {
                // event.detail.state.rounds
                document.getElementById('root').dispatchEvent(
                    new CustomEvent(
                        'state.update',
                        {detail: {
                            state: {
                                mode: message.payload.mode,
                                players: message.payload.players,
                                rounds: message.payload.rounds,
                                currentRound: message.payload.current_round}}}));
            } else if (message.type == 'challenge') {
                document.getElementById('root').dispatchEvent(
                    new CustomEvent('challenge', {detail: {user: message.payload.user}}));
            } else if (message.type == 'contest_enqueued') {
                document.getElementById('root').dispatchEvent(
                    new CustomEvent('contest_enqueued', {detail: {}}));
            }
        };
        var intervalID = null;

        var sendPing = function() {
            if (self.websocket.readyState == WebSocket.OPEN) {
                console.log('Sending ping.');
                self.websocket.send(JSON.stringify({'command': 'ping', 'payload': ''}));
                // Send ping.
            } else {
                console.log('WS closed. Clear interval.');
                clearInterval(intervalID);
            }
        };

        self.websocket.onopen = function(evt) {
            sendPing();
            intervalID = setInterval(sendPing, 1000 * 30);
            document.getElementById('root').dispatchEvent(new CustomEvent('ws.opened'));
            // console.log('Opened');
        };

        self.websocket.onclose = function(evt) {
            // event.detail.state.rounds
            console.log('onclose! evt: ', evt);
            document.getElementById('root').dispatchEvent(new CustomEvent('ws.closed'));
            // console.log('Closed');
        };

        self.websocket.onerror = function(evt) {
            console.log('onerror! evt: ', evt);
            document.getElementById('root').dispatchEvent(new CustomEvent('ws.error'));
        };
        self.websocket.onmessage = onMessage;
    }

    stopWebsocket() {
        const self = this;
        console.log('Closing websocket now.');
        if (self.websocket != null) {
            self.websocket.close();
        }
    }

    sendChallengeTickEvent() {
        document.getElementById('root').dispatchEvent(
            new CustomEvent('tick-challenge', {detail: {}}));
    }

    saveState() {
        // Saves state to server side.
        const self = this;

        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(self.state || {})
        };
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
        });
    }

    componentDidMount() {
        const self = this;

        // console.log('Fetch categories.')
        fetch('/api/v1/state')
            .then(response => response.json())
            .then(json => {
                const newState = update(self.state, {});
                newState.languages = json.languages;
                newState.topics = json.topics;
                newState.user = json.user;
                newState.mode = json.mode;

                const finishedRounds = json.rounds.filter((round)=>round.timeout == 0);
                const gameFinished = finishedRounds.length == json.rounds.length && finishedRounds.length > 0;

                if (newState.mode == null) {
                    self.stopWebsocket();
                } else {
                    self.startWebsocket();
                }
                /*

                if (Object.entries(json.players).length == 0 || gameFinished) {
                    newState.mode = null;
                    if (gameFinished) {
                        self.stopWebsocket();
                    }
                } else if (Object.entries(json.players).length == 1) {
                    newState.mode = 'train';
                    self.startWebsocket();
                } else {
                    newState.mode = 'contest';
                    self.startWebsocket();
                }
                FIXME: Drop!
                */
                self.setState(newState);
        });

        // Start WS only on game start.
        // FIXME: Uncomment.
        //self.syncGame();

        // Events listeners.
        //
        document.getElementById('root').addEventListener('ws.error', function(event) {
            var newState = update(self.state, {});
            newState.connection = "error";
            console.log("Error");
            //newState.language = event.detail.state.language;
            //newState.mode = event.detail.state.mode;
            //FIXME:Add-other-fields.
            self.setState(newState);
        });

        document.getElementById('root').addEventListener('ws.closed', function(event) {
            var newState = update(self.state, {});
            newState.connection = "closed";
            console.log("Closed");
            //newState.language = event.detail.state.language;
            //newState.mode = event.detail.state.mode;
            //FIXME:Add-other-fields.
            self.setState(newState);
        });

        document.getElementById('root').addEventListener('ws.opened', function(event) {
            var newState = update(self.state, {});
            newState.connection = "Opened";
            //newState.language = event.detail.state.language;
            //newState.mode = event.detail.state.mode;
            //FIXME:Add-other-fields.
            self.setState(newState);
        });

        document.getElementById('root').addEventListener('game.help', function(event) {
            self.sendMessage({
                command: 'help',
                payload: {}});
        });

        document.getElementById('root').addEventListener('game.leave', function(event) {
            const newState = update(self.state, {});
            newState.mode = null;
            newState.rounds = [];
            newState.currentRound = -1;
            newState.replyLetters = [];
            self.setState(newState);
            self.sendMessage({
                command: 'leave',
                payload: {
                    language: self.state.user.language,
                    topic: self.state.user.topic}});
        });

        document.getElementById('root').addEventListener('challenge', function(event) {
            const newState = update(self.state, {});

            newState.challenge = {
                user: event.detail.user,
                timeout: 10
            };

            setTimeout(self.sendChallengeTickEvent, 1000);

            self.setState(newState);
        });

        document.getElementById('root').addEventListener('contest_enqueued', function(event) {
            const newState = update(self.state, {});
            newState.mode = 'contest_enqueued';
            self.setState(newState);
        });

        document.getElementById('root').addEventListener('tick-challenge', function(event) {
            const newState = update(self.state, {});
            const currentTimeout = newState.challenge.timeout;

            if (currentTimeout == 1) {
                newState.challenge = null;
            } else {
                newState.challenge.timeout -= 1;
                setTimeout(self.sendChallengeTickEvent, 1000);
            }

            self.setState(newState);
        });

        document.getElementById('root').addEventListener('state.update', function(event) {
            var newState = update(self.state, {});
            newState.players = event.detail.state.players;
            newState.rounds = event.detail.state.rounds;
            newState.currentRound = event.detail.state.currentRound;
            newState.mode = event.detail.state.mode;

            if (newState.currentRound == -1) {
                newState.replyLetters = [];
                newState.replyMap = {};
            } else if (self.state.currentRound != newState.currentRound) {
                // Round changed. Show ? for every letter of the question.
                let currentRound = newState.rounds[newState.currentRound - 1];
                let word = currentRound.question[0];  // FIXME: Use string instead of list of strings
                let replyLetters = word.split("").map(function(elem) {return elem == " " ? " " : "?";});
                newState.replyMap = {};
                newState.replyLetters = [replyLetters.join("")];
            } else {
                let currentRound = newState.rounds[newState.currentRound - 1];
                let stateUserHints = self.state.rounds[newState.currentRound - 1].solutions[newState.user.id].hints;
                let newStateUserHints = currentRound.solutions[newState.user.id].hints || [];
                let word = currentRound.question[0];  // FIXME: Use string instead of list of strings

                if (stateUserHints.length != newStateUserHints.length) {
                    newState.replyMap = {};
                    if (newStateUserHints.length > 0) {
                        // show hint.
                        let replyLetters = word.split("").map(function(elem) {return elem == " " ? " " : "?";});

                        let lastHintArray = newStateUserHints[newStateUserHints.length - 1];

                        for (let i = 0; i < currentRound.question.length; ++i) {
                            let mappedIndexes = [];
                            let questionWord = currentRound.question[i];
                            for (let j = 0; j < lastHintArray.length; ++j) {
                                // For every hint find appropriate letter and add to reply map.
                                for (let n = 0; n < questionWord.length; ++n) {
                                    if (questionWord[n] == lastHintArray[j][1] && !mappedIndexes.includes(n)) {
                                        // match found, add as reply
                                        newState.replyMap[pair(0, j)] = pair(0, n);
                                        replyLetters[lastHintArray[j][0]] = lastHintArray[j][1];
                                        mappedIndexes.push(n);
                                        break
                                    }
                                }
                            }
                        }
                        newState.replyLetters = [replyLetters.join("")];
                    }
                }
            }
            self.setState(newState);
        });

        document.getElementById('root').addEventListener('language-changed', function(event) {

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({user: {language: event.detail.language}})
            };
            fetch('/api/v1/state', requestOptions)
                .then(response => response.json())
                .then(data => {
                    const newState = update(self.state, {});
                    newState.topics = data.topics;
                    newState.user.language = data.user.language;
                    newState.user.name = data.user.name;
                    newState.user.topic = data.topics[0].code;
                    self.setState(newState);
                });

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
        });

        document.getElementById('root').addEventListener('name-changed', function(event) {
            // Updates username

            // Update state and send to server side.
            const newState = update(self.state, {});
            newState.user.name = event.detail.name;
            self.setState(newState);

            clearTimeout(self.nameUpdateTimeout);
            self.nameUpdateTimeout = setTimeout(self.saveState, 2000);
        });

        document.getElementById('root').addEventListener('contest-clicked', function(event) {
            // FIXME:
            var newState = update(self.state, {});
            newState.mode = 'contest_requested';
            self.setState(newState);

            self.sendMessage({
                command: 'contest',
                payload: {
                    name: self.state.user.name,
                    language: self.state.user.language,
                   topic: self.state.user.topic}});

        });

        document.getElementById('root').addEventListener('train-clicked', function(event) {
            var newState = update(self.state, {});
            newState.mode = 'train_requested';
            self.setState(newState);
            self.sendMessage({
                command: 'train',
                payload: {
                    name: self.state.user.name,
                    language: self.state.user.language,
                    topic: self.state.user.topic}});
        });

        // new CustomEvent('challenge-accepted', {detail: {}}));
        document.getElementById('root').addEventListener('challenge-accepted', function(event) {
            var newState = update(self.state, {});
            newState.challenge = null;
            self.setState(newState);
            self.sendMessage({
                command: 'challenge-accept',
                payload: {
                    language: self.state.user.language,
                    topic: self.state.user.topic}});
        });

        document.getElementById('root').addEventListener('challenge-declined', function(event) {
            var newState = update(self.state, {});
            // FIXME: Send decline command and change state.
            self.sendMessage({
                command: 'challenge-decline',
                payload: {}})
        });

        document.getElementById('root').addEventListener('topic-changed', function(event) {

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user: {
                        topic: event.detail.topic,
                        language: self.state.user.language}})
            };
            fetch('/api/v1/state', requestOptions)
                .then(response => response.json())
                .then(data => {
                    const newState = update(self.state, {});
                    newState.user.topic = data.user.topic;
                    self.setState(newState);
                });
        });

        document.getElementById('root').addEventListener('reply-letter.remove', function(event) {
            // FIXME: Send to server
            // update-state
            // console.log(event.detail.letter);

            const newState = update(self.state, {});
            let replyWordIndex = event.detail.wordIndex;
            let replyLetterIndex = event.detail.letterIndex;
            let replyWordLetters = newState.replyLetters[replyWordIndex];
            let replyWordArray = replyWordLetters.split('');
            replyWordArray[replyLetterIndex] = '?';
            newState.replyLetters[replyWordIndex] = replyWordArray.join('');

            // Drop removed indexes.
            newState.replyMap[pair(replyWordIndex, replyLetterIndex)] = null;
            self.setState(newState);
        });

        document.getElementById('root').addEventListener('question-letter.click', function(event) {
            const newState = update(self.state, {});
            // {topic: {$set: event.detail.topic}});
            // self.setState(newState);
            var wordIndex = event.detail.wordIndex;
            var letterIndex = event.detail.letterIndex;
            var letter = event.detail.letter;
            var replyWordLetters = newState.replyLetters[wordIndex];
            var indexToReplace = replyWordLetters.indexOf('?');
            var updatedReplyWordLetters = replyWordLetters.replace('?', letter);
            newState.replyLetters[wordIndex] = updatedReplyWordLetters;
            newState.replyMap[pair(wordIndex, indexToReplace)] = pair(wordIndex, letterIndex);
            self.setState(newState);

            // If all letters entered send to server side.
            var containsQuestionMark = false;
            for (var i = 0; i < newState.replyLetters.length; ++i) {
                var word = newState.replyLetters[i];
                if (word.includes('?')) {
                    containsQuestionMark = true;
                    break
                }
            }
            if (!containsQuestionMark) {
                self.sendMessage({
                    command: 'reply',
                    payload: newState.replyLetters});
            }
        });
    }

    componentWillUnmount() {
        ;
        // clearInterval(this.timerID);
    }

    handleLanguageChange(event) {
        document.getElementById('root').dispatchEvent(
            new CustomEvent('language-changed', {detail: {language: event.target.value}}));
    }

    handleNameChange(event) {
        document.getElementById('root').dispatchEvent(
            new CustomEvent('name-changed', {detail: {name: event.target.value}}));
    }

    onTrainClick(event) {
        const self = this;
        document.getElementById('root').dispatchEvent(
            new CustomEvent('train-clicked', {detail: {}}));
    }

    onContestClick(event) {
        const self = this;

        document.getElementById('root').dispatchEvent(
            new CustomEvent('contest-clicked', {detail: {}}));
    }

    onAcceptClick(event) {
        document.getElementById('root').dispatchEvent(
            new CustomEvent('challenge-accepted', {detail: {}}));
    }

    onDeclineClick(event) {
        document.getElementById('root').dispatchEvent(
            new CustomEvent('challenge-declined', {detail: {}}));
    }

    handleTopicChange(event) {
        document.getElementById('root').dispatchEvent(
            new CustomEvent('topic-changed', {detail: {topic: event.target.value}}));
    }

    getHelp(event) {
        document.getElementById('root').dispatchEvent(
            new CustomEvent('game.help', {detail: {}}))
    }

    leave(event) {
        document.getElementById('root').dispatchEvent(
            new CustomEvent('game.leave', {detail: {}}))
    }

    render() {
        const self = this;
        console.log('Before render.', self.state);
        if (self.state.connection == "closed") {
            return (
                <div className="container">
                    <br />
                    <div className="row">
                        <div className="column">
                            <div style={{fontSize: "45px"}}>Connection closed. Please refresh the page.</div>
                        </div>
                    </div>
                </div>
            )
        } else if (this.state.connection == "error") {
            return (
                <div className="container">
                    <br />
                    <div className="row">
                        <div className="column">
                            <div style={{fontSize: "45px"}}>Connection error. Please refresh the page.</div>
                        </div>
                    </div>
                </div>
            )
        }

        const finishedRounds = this.state.rounds.filter((round)=>round.timeout == 0);
        var splittedLettersItems = null;

        if (this.state.currentRound && this.state.currentRound != -1) {
            var currentRound = this.state.rounds[this.state.currentRound - 1];
            var isSolved = currentRound.solutions[this.state.user.id].is_solved;
        } else {
            var currentRound = {};
            var isSolved = false;
        }

        // FIXME: Implement term with multiple words.
        var currentRoundQuestion = currentRound.question || [];
        var questionLettersItems = [];
        var replyLetterItems = [];

        if (Object.keys(currentRound).length > 0) {
            // New responsive implementation
            // FIXME: handle currentRound.question as string instead of list of words.
            var splittedLetters = [[]];
            var words = currentRound.question[0];
            for (var letterIndex=0; letterIndex < words.length; ++letterIndex) {
                if (words[letterIndex] == ' ') {
                    splittedLetters.push([]);
                } else {
                    splittedLetters[splittedLetters.length - 1].push([letterIndex, words[letterIndex]]);
                }
            }
            var word = currentRound.question[0];

            const replyMap = this.state.replyMap || {};
            const chosenQueryIndexes = Object.values(replyMap);

            var questionLettersTables = [];

            for (var i = 0; i < splittedLetters.length; ++i) {
                questionLettersTables.push(questionLettersToTable(
                    splittedLetters[i], chosenQueryIndexes));
            }

            // var letterItems1 = letterItems.map((divGroup) => <td style={{display: "inline-block", borderBottom: 0}}>{divGroup}</td>);
            var letterItems1 = questionLettersTables.map((divGroup) => <td style={{verticalAlign: "top", display: "inline-block", borderBottom: 0}}>{divGroup}</td>);

            splittedLettersItems = (
                <table>
                    <tr>
                        {letterItems1}
                    </tr>
                </table>
            );
        };

        if (Object.keys(currentRound).length > 0) {
            replyLetterItems = replyLettersToRow(this.state.replyLetters[0], isSolved);
        }

        var pointsBlock = null;
        var points = 0;
        if (isSolved) {
            if (currentRound.solutions[this.state.user.id].hints.length == 3) {
                points = 0;
            } else {
                points = "+" + (5 - currentRound.solutions[this.state.user.id].hints.length);
            }
            pointsBlock = <span style={{color: "green"}}>{points}</span>;
        }

        // const languages = ['dig','os','ru','en'];
        // FIXME: Move to server side.
        const languageOptionItems = this.state.languages
            .map((language) => <option value={language.code}>{language.local_name}</option>);

        var topicOptionItems = this.state.topics
            .map((topic) => <option value={topic.code}>{topic.local_name}</option>);

        //console.log(this.state);
        var trainBlock = null;
        var contestButton = null;

        var challengeBlock = null;

        if (this.state.challenge) {
            challengeBlock = (
                <div>
                    {this.state.challenge.user.name} is challenging you!
                    <button onClick={this.onAcceptClick}>Accept</button>
                    (ignore to decline) ({this.state.challenge.timeout})
                </div>
            );
        }

        if (this.state.mode == 'contest' || this.state.mode == 'train') {
            trainBlock = (
                <button onClick={self.leave} title='Leave game'>
                    Leave
                </button>
            );
        } else if (this.state.mode == 'contest_enqueued') {
            trainBlock = (
                <button onClick={self.leave} title='Leave game'>
                    Leave <img src="/static/media/spinner1.png" alt="Spinner" /> <span>Looking for competitor</span>
                </button>
            );
        } else {
            trainBlock = <button onClick={this.onTrainClick}>Train</button>;
            contestButton = <button onClick={this.onContestClick}>Contest</button>;
        }

        var helpButton = null;
        if (this.state.mode != null
                && Object.keys(currentRound).length > 0) {

            if (currentRound.solutions[this.state.user.id].hints.length < 3 && !isSolved) {
                helpButton = (
                    <button onClick={self.getHelp}
                            title='(-1 to current game score)'
                            style={{fontSize:"20px", float:"left", margin:"5px", width:"145px", height:"45px"}}>
                        Help ({3 - currentRound.solutions[this.state.user.id].hints.length})
                    </button>
                )
            }
        }

        // FIXME: Optimize or cache somehow.
        var localLanguage = this.state.languages.filter(
            x => x.code == this.state.user.language);
        var localLanguageName = '';
        if (localLanguage.length > 0) {
            localLanguageName = localLanguage[0].local_name;
        }

        var languageBlock = (
            <span>{localLanguageName}&nbsp;|&nbsp;</span>
        );

        // FIXME: Optimize or cache somehow.
        var localTopic = this.state.topics.filter(
            x => x.code == this.state.user.topic);
        var localTopicName = '';
        if (localTopic.length > 0) {
            localTopicName = localTopic[0].local_name;
        }
        var topicBlock = (
            <span>{localTopicName}&nbsp;</span>
        );

        if (this.state.mode == null) {
            languageBlock = (
                <select value={this.state.user.language} onChange={this.handleLanguageChange}>
                    <option value="">---</option>
                    {languageOptionItems}
                </select>
            );

            topicBlock = (
                <select value={this.state.user.topic} onChange={this.handleTopicChange}>
                    <option value="">---</option>
                    {topicOptionItems}
                </select>
            );
        }

        var currentRoundTimeoutBlock = (<h3 style={{fontSize: "45px"}}>{currentRound.timeout}&nbsp;|&nbsp;{pointsBlock}</h3>);
        if (currentRound.timeout <= 10 && !isSolved) {
            currentRoundTimeoutBlock = <h3 style={{color: "red", fontSize: "45px"}}>{currentRound.timeout}</h3>;
        }

        return (
            <div className="container">
                <br />
                <div className="row">
                    <div className="column">
                        <div>
                            <input type="text" placeholder="Username"
                                   value={this.state.user.name}
                                   onChange={this.handleNameChange}
                                   style={{color: "white"}}>
                            </input>
                        </div>
                    </div>
                    <div className="column">
                        {languageBlock}
                    </div>
                    <div className="column">
                        {topicBlock}
                    </div>
                    <div className="column">
                        {trainBlock}
                    </div>
                    <div className="column">
                        {contestButton}
                    </div>
                </div>
                <div className="row">

                    <FinishedRoundsTable finishedRounds={finishedRounds} rounds={this.state.rounds} />
                </div>
                <div className="row">
                    <div className="column">
                        <img id="word-image"
                             src={currentRound.img}
                             style={{maxWidth: "400px", width: "100%", height: "auto", display: "inline-block", padding: "0px"}} />
                        <div>
                            {helpButton}
                            {currentRoundTimeoutBlock}
                        </div>
                    </div>
                </div>
                <div className="row">
                    {challengeBlock}
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
        );
    }
};

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <Main />
            </header>
        </div>
    );
}

export default App;
