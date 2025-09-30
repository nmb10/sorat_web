
export const setCookie = function (name, value) {
  document.cookie = name + '=' + value
}

export const getCookies = function () {
  const ret = {}
  let key, value
  for (const cookie of document.cookie.split('; ')) {
    [key, value] = cookie.split('=')
    ret[key] = value
  }
  return ret
}

export const copyToClipboard = function (text) {
  navigator.clipboard.writeText(text).then(
    function () {
      console.log('Async: Copying to clipboard was successful!')
    },
    function (err) {
      console.error('Async: Could not copy text: ', err)
    })
}
