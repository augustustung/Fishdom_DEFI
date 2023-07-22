import axios from 'axios'
import { toast } from 'react-toastify'

const HOST = process.env.REACT_APP_API

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
    const dataString = window.localStorage.getItem('_u_u_u_u_u_u_')
    if (dataString) {
      const newData = JSON.parse(dataString)
      headers["authorization"] = `Bearer ${newData.token}`
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

        const { status: statusCode, msg: data } = response

        if (statusCode === 401) {
          toast.warn(data || 'Something was wrong')
          setTimeout(() => {
            window.localStorage.clear()
            window.location.reload()
          }, 1000)
        } else if (
          (statusCode === 401 && data === 'Unauthorized') ||
          (statusCode === 403 && data === 'InvalidToken')
        ) {
          window.localStorage.clear()
          window.location.reload()
        } else if (statusCode === 505) {
          window.localStorage.clear()
          window.location.reload()
        } else {
          return resolve(result)
        }
      })
  })
}

export default {
  send,
}