// import React, { useState, useRef, useEffect, useCallback } from 'react'

import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'

import trn from './translations'
import spinner from './spinner1.png'

export const AuthComponent = ({ authenticatedUserEmail }) => {
  const isAuthenticated = authenticatedUserEmail !== null
  const userLanguage = 'en' // FIXME:
  const [step, setStep] = useState('') // Steps: 'EMAIL' | 'OTP' | 'SUCCESS' | 'FAILURE'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [waitingResponse, setWaitingResponse] = useState(false)

  // OTP State
  const otpLength = 6
  const [otp, setOtp] = useState(new Array(otpLength).fill(''))
  const otpRefs = useRef([])

  const handleStartAuth = (e) => {
    e.preventDefault()
    setStep('EMAIL')
  }

  const handleLogout = (e) => {
    e.preventDefault()
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'otp', command: 'logout', email: email })
    }
    setWaitingResponse(true)
    fetch('/api/v1/auth', requestOptions)
      .then((response) => {
        setWaitingResponse(false)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        window.location.reload()
        setStep('')
      })
      .catch((error) => {
        setError(`Could not logout. Error: ${error.message}`)
      })
  }

  // Auto-focus OTP fields when reaching that step
  useEffect(() => {
    if (step === 'OTP' && otpRefs.current[0]) {
      otpRefs.current[0].focus()
    }
  }, [step])

  const handleCloseAuth = (e) => {
    e.preventDefault()
    setStep('')
  }

  // Phase 1: Submit Email
  const handleEmailSubmit = (e) => {
    e.preventDefault()
    if (!email) {
      return
    }
    // Trigger API call to send OTP here

    setWaitingResponse(true)
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'otp', command: 'send', email: email })
    }
    fetch('/api/v1/auth', requestOptions)
      .then((response) => {
        setWaitingResponse(false)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        setStep('OTP')
      })
      .catch((error) => {
        setError(`Failed to send OTP code. Error: ${error.message}`)
      })
  }

  // Phase 2: Handle OTP Changes
  const handleOtpChange = (e, index) => {
    const value = e.target.value
    if (isNaN(Number(value))) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1)
    setOtp(newOtp)

    // Auto-advance focus
    if (value && index < otpLength - 1 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus()
    }

    // Automatically check completeness
    const combinedOtp = newOtp.join('')
    if (combinedOtp.length === otpLength) {
      handleOtpVerify(combinedOtp)
    }
  }

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus()
    }
    setError('')
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (isNaN(Number(pastedData)) || pastedData.length !== otpLength) {
      return
    }

    const newOtp = pastedData.split('')
    setOtp(newOtp)
    handleOtpVerify(pastedData)
  }

  const handleOtpVerify = (code) => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'otp', command: 'verify', code: code })
    }
    setWaitingResponse(true)
    fetch('/api/v1/auth', requestOptions)
      .then((response) => {
        setWaitingResponse(false)
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        if (data.is_verified) {
          setStep('SUCCESS') // authenticate instead.
          // FIXME: Try to authenticate without reload.
          setTimeout(() => window.location.reload(), 2000)
        } else {
          setError('Code is not valid. Try again.')
        }
      })
      .catch((error) => {
        setError(`Could not verify OTP code. Error: ${error.message}`)
      })
  }

  // Phase 3: Success verification (valid code given)
  const popupStyle = {
    backgroundColor: '#283c34',
    padding: '6px',
    right: '120px',
    top: '16px',
    zIndex: 9999
  }

  let spinnerImg
  if (waitingResponse) {
    spinnerImg = <img src={spinner} alt="Spinner" />
  }

  return (
    <div style={ popupStyle }>
      {/* User already authenticated */}
      {isAuthenticated && (
        <div>
          <span>
            {authenticatedUserEmail}&nbsp;|&nbsp;
          </span>
          <button
            disabled={waitingResponse}
            onClick={handleLogout}
            title={trn(userLanguage, 'Logout')}
            style={{ margin: 0, paddingLeft: '5px', paddingRight: '5px' }}>
              {trn(userLanguage, 'Logout')}
              {spinnerImg}
          </button>
        </div>
      )}

      {/* User is not authenticated, dialog is hidden */}
      {!isAuthenticated && step === '' && (
          <button
            disabled={waitingResponse}
            onClick={handleStartAuth}
            title={trn(userLanguage, 'Login')}
            style={{ float: 'left', margin: 0, paddingLeft: '5px', paddingRight: '5px' }}>
              {trn(userLanguage, 'Login')}
              {spinnerImg}
          </button>
      )}

      {/* PHASE 1: EMAIL INPUT */}
      {!isAuthenticated && step === 'EMAIL' && (
        <form onSubmit={handleEmailSubmit} className="space-y-6" style={{ backgroundColor: '#283c34', padding: '5px', border: '1px solid black' }}>
          <a href="#" title='Close' onClick={ handleCloseAuth } style={{ float: 'right', fontSize: '20px' }}>X</a>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{trn(userLanguage, 'Login')}</h2>
            <p className="text-sm text-gray-500 mt-2">
              {trn(userLanguage, 'Enter your email address to receive a verification code.')}
            </p>
            <p style={{ color: 'red' }}>{ error }&nbsp;</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {trn(userLanguage, 'Email Address')}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus
              style={{ color: 'white' }}
              className="w-full px-4 h-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <button
            disabled={waitingResponse}
            type="submit"
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-colors">
            Send Verification Code
            {spinnerImg}
          </button>
        </form>
      )}

      {/* PHASE 2: OTP VERIFICATION */}

      {!isAuthenticated && step === 'OTP' && (
        <div className="space-y-6">
          <a href="#" title='Close' onClick={ handleCloseAuth } style={{ float: 'right', fontSize: '20px' }}>X</a>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">{trn(userLanguage, 'Verify Code')}</h2>
            <p className="text-sm text-gray-500 mt-2">
              We sent a security code to <span className="font-medium text-gray-700">{email}</span>
            </p>
            <p style={{ color: 'red' }}>{ error }&nbsp;</p>
          </div>

          <div className="flex gap-2 justify-center my-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                ref={(el) => (otpRefs.current[index] = el)}
                onChange={(e) => handleOtpChange(e, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                onPaste={handleOtpPaste}
                style={{ width: '40px', color: 'white' }}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            ))}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep('EMAIL')}
              className="text-sm text-blue-600 hover:underline font-medium" >
              ← Change email address
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: PASSWORD CONFIRMATION */}
      {step === 'SUCCESS' && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Authenticated. Redirecting now...</h2>
          <p className="text-sm text-gray-500 mt-2">Your progress saved/restored.</p>
        </div>
      )}
    </div>
  )
}

AuthComponent.propTypes = {
  authenticatedUserEmail: PropTypes.string
}

export default AuthComponent
