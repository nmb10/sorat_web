import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'

import spinner from './spinner1.png'
import iconMicrophoneOff from './icon-microphone-off.png'
import iconMicrophoneOn from './icon-microphone-on.png'
import { warningMessage, sorted } from './utils'

// Initialize recording state
let mediaRecorder = null
let recordedBlobs = []

async function stopRecording () {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()

    // Wait for final data event
    await new Promise(resolve => {
      mediaRecorder.addEventListener('stop', () => resolve())
    })

    // Clean up stream
    // if (audioStream) {
    //   audioStream.getTracks().forEach(track => track.stop())
    // }

    // Create WAV blob from recorded chunks
    const audioBlob = new Blob(recordedBlobs, { type: 'audio/wav' })
    return audioBlob
  }
}

async function encodeWavToBase64 (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = btoa(
        new Uint8Array(reader.result)
          .reduce((data, byte) => data + String.fromCharCode(byte), '')
      )
      resolve(base64String)
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

async function uploadAudio (language, wordLetters) {
  // Create WAV blob from recorded chunks
  const blob = new Blob(recordedBlobs, { type: 'audio/wav' })

  const base64Wav = await encodeWavToBase64(blob)

  // const formData = new FormData()
  // formData.append('audio_data', blob, 'recording.wav')
  const jsonData = {
    audioData: base64Wav,
    language: language,
    fileType: 'wav'
  }
  const jsonString = JSON.stringify(jsonData)

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: jsonString
  }
  // const url = 'http://127.0.0.1:8000/items/' // python app
  const url = '/api/v1/transcription' // erlang app

  document.getElementById('root').dispatchEvent(
    new CustomEvent('transcription.start', { detail: {} }))
  fetch(url, requestOptions)
    .then(response => response.json())
    .then(data => {
      // compare transcriptions and report most similar.
      const wordLettersSorted = sorted(wordLetters)

      let sortedResult
      let exactMatch
      let noMatch
      for (const result of data.results) {
        sortedResult = sorted(result)
        if (sortedResult === wordLettersSorted) {
          // Exact match. Looks like transcription was success.
          exactMatch = result
        } else {
          noMatch = result || 'not clear'
        }
      }
      const detail = {
        exactMatch: exactMatch,
        noMatch: noMatch
      }
      document.getElementById('root').dispatchEvent(
        new CustomEvent('transcription.done', { detail: detail }))
    })
}

SelectLettersGameComponent.propTypes = {
  round: PropTypes.node.isRequired,
  isSolved: PropTypes.bool,
  language: PropTypes.str
}

function SelectLettersGameComponent ({ round, isSolved, language }) {
  const correctChoice = round.correct_choice
  const correctImage = [null, round.img1, round.img2, round.img3, round.img4][correctChoice]
  const wordLetters = round.question[0]

  const [status, setStatus] = useState('transcription-finished')
  const isTouchHolding = useRef(false)
  const hasMoveEvent = useRef(false)

  const recordingRef = useRef(false)
  const transcriptionRef = useRef(false)
  const wordLettersRef = useRef(null)
  wordLettersRef.current = wordLetters

  const startHold = () => {
    if (recordingRef.current) {
      return
    }

    if (transcriptionRef.current) {
      return
    }

    navigator.mediaDevices.getUserMedia({ audio: true, echoCancellation: true })
      .then(stream => {
        // Media stream obtained successfully

        // Create MediaRecorder instance
        mediaRecorder = new MediaRecorder(stream)
        recordedBlobs = []

        // Collect audio chunks during recording
        mediaRecorder.ondataavailable = event => {
          if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data)
          }
        }

        // Start recording
        mediaRecorder.start(3000) // 100ms chunks
        document.getElementById('root').dispatchEvent(
          new CustomEvent('recording.start', { detail: {} }))
        setStatus('recording-started')
        recordingRef.current = true
      })
      .catch(error => {
        if (error.name === 'NotAllowedError') {
          // Inform the user that access was denied and how to grant it
          warningMessage('Getting media is not allowed (disabled by browser or by user).', true)
        } else {
          warningMessage('Looks like your browser does not allow to use media.', true)
        }
      })
  }

  const endHold = useCallback(() => {
    if (recordingRef.current) {
      recordingRef.current = false
      stopRecording()
      document.getElementById('root').dispatchEvent(
        new CustomEvent('recording.stop', { detail: {} }))
      setStatus('recording-stopped')
      transcriptionRef.current = true
      setTimeout(uploadAudio, 100, language, wordLettersRef.current)
    }
  }, [wordLetters])

  const handleTouchMove = useCallback(() => {
    hasMoveEvent.current = true
  })

  const handleTouchStart = useCallback((event) => {
    event.preventDefault()
    isTouchHolding.current = true
    const checkHolding = () => {
      if (isTouchHolding.current && !hasMoveEvent.current) {
        startHold()
      }
    }
    setTimeout(checkHolding, 200)
  })

  const handleTouchEnd = useCallback((event) => {
    event.preventDefault()
    isTouchHolding.current = false
    hasMoveEvent.current = false
    endHold()
  })

  useEffect(() => {
    // Cleanup on component unmount
    return () => endHold()
  }, [])

  useEffect(() => {
    function handleTranscriptionStart () {
      setStatus('transcription-started')
      transcriptionRef.current = true
    }
    document
      .getElementById('root')
      .addEventListener('transcription.start', handleTranscriptionStart)

    function handleTranscriptionFinish () {
      setStatus('transcription-finished')
      transcriptionRef.current = false
    }
    document
      .getElementById('root')
      .addEventListener('transcription.done', handleTranscriptionFinish)

    function handleKeydown (event) {
      if (event.code === 'Space') {
        event.preventDefault()
        if (status !== 'transcription-started') {
          startHold()
        }
      }
    }
    document.addEventListener('keydown', handleKeydown)

    function handleKeyup (event) {
      if (event.code === 'Space') {
        event.preventDefault()
        if (status !== 'transcription-started') {
          endHold()
        }
      }
    }
    document.addEventListener('keyup', handleKeyup)

    return () => {
      // unsubscribe event
      document
        .getElementById('root')
        .removeEventListener('transcription.done', handleTranscriptionFinish)
      document
        .getElementById('root')
        .removeEventListener('transcription.start', handleTranscriptionStart)
      document
        .removeEventListener('keydown', handleKeydown)
      document
        .removeEventListener('keyup', handleKeyup)
    }
  }, [])

  let spinnerElem
  const spinnerStyle = {
    position: 'absolute',
    height: '90px',
    zIndex: 99,
    left: '180px',
    pointerEvents: 'none',
    top: '20px'
  }

  let microphoneIcon

  if (status === 'transcription-started') {
    spinnerElem = <img src={spinner} alt="Spinner" style={ spinnerStyle } />
  } else if (status === 'recording-started') {
    microphoneIcon = iconMicrophoneOn
  } else {
    microphoneIcon = iconMicrophoneOff
  }
  const handleContextMenu = (event) => {
    event.preventDefault()
  }

  const buttonDisabled = status === 'transcription-started'

  if (isSolved) {
    return (
      <img id="select-letters-image"
           className="word-image  word-image-letters-selection word-image-solved"
           src={correctImage.src}/>
    )
  } else {
    // Didn't find a way to disable image save popup on touch and hold on
    // iphone. So using this trick to overcome that - display an image
    // as background. Also it requires `nbsp` to work well.
    return (
      <div style={{ position: 'relative' }}>
        <img src={microphoneIcon}
             style={{ pointerEvents: 'none', zIndex: 99, padding: 0, height: '90px', position: 'absolute', left: '180px', top: '20px' }} />
        {spinnerElem}
        <div id="select-letters-image"
             title="Hold image or hold whitespace button when ready to tell"
             onMouseDown={startHold}
             onMouseUp={endHold}
             onMouseLeave={endHold}
             onTouchStart={handleTouchStart}
             onTouchEnd={handleTouchEnd}
             onTouchMove={handleTouchMove}
             onContextMenu={handleContextMenu}
             disabled={buttonDisabled}
             style={{
               backgroundSize: 'contain',
               backgroundImage: 'url("' + correctImage.src + '")',
               padding: '0 16px',
               width: '100%',
               backgroundRepeat: 'no-repeat',
               position: 'absolute',
               webkitUserSelect: 'none',
               msUserSelect: 'none',
               userSelect: 'none'
             }}
             className="word-image word-image-letters-selection">
          &nbsp;&nbsp;
        </div>
      </div>
    )
  }
}

export default SelectLettersGameComponent
