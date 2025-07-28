// import React, { useState, useCallback } from 'react'
import React, { useState, useRef, useEffect } from 'react'
// import React, { useState, useRef, useEffect } from 'react'
// import _ from 'lodash'
// import trn from './translations'
import PropTypes from 'prop-types'
import iconShare from './icon-share.png'
import spinner from './spinner1.png'
// import { dispatch, CUSTOM_GAME_SAVE, CUSTOM_GAME_EDIT, CUSTOM_GAME_TOPIC_CHANGE, CUSTOM_GAME_WORD_CHANGE } from './events'

// Initialize recording state
let mediaRecorder = null
let recordedBlobs = []

const sorted = function (str1) {
  const str1List = str1.replaceAll(' ', '').toLowerCase().split('')
  str1List.sort()
  return str1List.join('')
}

// Start recording
async function startRecording () {
  try {
    // Request microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      echoCancellation: true
    })

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
    return stream
  } catch (error) {
    console.error('Error starting recording:', error)
    throw error
  }
}

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
  const url = 'http://127.0.0.1:8000/items/' // python app
  // const url = "/api/v1/issues"  // erlang app

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
          noMatch = result
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

TranscribeWordComponent.propTypes = {
  language: PropTypes.str,
  wordLetters: PropTypes.str
}

function TranscribeWordComponent ({ language, wordLetters }) {
  const [status, setStatus] = useState('transcription-finished')

  const intervalRef = useRef(null)

  const startHold = () => {
    if (intervalRef.isRecording) {
      return
    }
    startRecording()
    setStatus('recording-started')
    intervalRef.isRecording = true
  }

  const endHold = () => {
    if (intervalRef.isRecording) {
      intervalRef.isRecording = false
      stopRecording()
      setStatus('recording-stopped')
      setTimeout(uploadAudio, 100, language, wordLetters)
    }
  }

  useEffect(() => {
    // Cleanup on component unmount
    return () => endHold()
  }, [])

  useEffect(() => {
    function handleTranscriptionStart () {
      setStatus('transcription-started')
    }
    document
      .getElementById('root')
      .addEventListener('transcription.start', handleTranscriptionStart)

    function handleTranscriptionFinish () {
      setStatus('transcription-finished')
    }
    document
      .getElementById('root')
      .addEventListener('transcription.done', handleTranscriptionFinish)

    function handleKeydown (event) {
      if (event.code === 'Space') {
        event.preventDefault()
        startHold()
      }
    }
    document.addEventListener('keydown', handleKeydown)

    function handleKeyup (event) {
      if (event.code === 'Space') {
        event.preventDefault()
        endHold()
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
  if (status === 'transcription-started') {
    spinnerElem = <img src={spinner} alt="Spinner" />
  }

  let isRecordingElem
  if (status === 'recording-started') {
    isRecordingElem = <span style={{ color: 'red', fontSize: '30px' }}>!</span>
  }

  /*
      onTouchStart={startHold}
      onTouchEnd={endHold}
  */
  return (
    <button
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      title="Hold this button or hold whitespace button when ready to tell">
      <img src={iconShare} style={{ padding: 0, height: '35px' }} />
      {isRecordingElem}
      {spinnerElem}
    </button>
  )
}

export default TranscribeWordComponent
