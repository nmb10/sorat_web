
export const setCookie = (name, value) => {
  document.cookie = name + '=' + value
}

export const getCookies = () => {
  const ret = {}
  let key, value
  for (const cookie of document.cookie.split('; ')) {
    [key, value] = cookie.split('=')
    ret[key] = value
  }
  return ret
}

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(
    function () {
      console.log('Async: Copying to clipboard was successful!')
    },
    function (err) {
      console.error('Async: Could not copy text: ', err)
    })
}

export const warningMessage = (text, clear) => {
  if (clear) {
    document.querySelector('#warning').innerText = text
  } else {
    document.querySelector('#warning').innerText += text
  }
}

export const sorted = (str1) => {
  const str1List = str1.replaceAll(' ', '').toLowerCase().split('')
  str1List.sort()
  return str1List.join('')
}

export const formatFloat = (number) => {
  return parseFloat(number.toFixed(2))
}
