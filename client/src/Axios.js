import axios from 'axios'
import { toast } from 'react-toastify'

const HOST = process.env.REACT_APP_API || "http://localhost:5000"

function send({
  method = 'get',
  path,
  data = null,
  headers = {},
  newUrl,
}) {
  return new Promise((resolve) => {
    let url = HOST + `${path}`
    if (newUrl) {
      url = `${newUrl}`
    }
    const dataString = window.localStorage.getItem('data')
    if (dataString) {
      const newData = JSON.parse(dataString)
      headers["auth-token"] = `${newData.token}`
    }
    axios({
      method,
      url,
      data,
      headers,
    })
      .then((result) => {
        const data = result.data
        return resolve(data)
      })
      .catch((error) => {
        const { response = {} } = error

        const result = response.data ? response.data : null
        if (!result) {
        } else {
          const { statusCode, message: data } = result

          if (statusCode === 401) {
            toast.warn(data || 'Somethig was wrong')
            setTimeout(() => {
              window.localStorage.clear()
              window.location.href = '/'
            }, 1000)
          } else if (
            (statusCode === 401 && data === 'Unauthorized') ||
            (statusCode === 403 && data === 'InvalidToken')
          ) {
            window.localStorage.clear()
            window.location.href = '/'
          } else if (statusCode === 505) {
            window.localStorage.clear()
            window.location.href = '/'
          } else {
            return resolve(result)
          }
        }
      })
  })
}

export default {
  send,
}