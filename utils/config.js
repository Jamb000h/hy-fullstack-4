// Environment variables
if ( process.env.NODE_ENV !== 'production' ) {
  require('dotenv').config()
}

let mongoURL = process.env.MONGODB_URI

if (process.env.NODE_ENV === 'test') {
  mongoURL = process.env.TEST_MONGODB_URI
}

module.exports = {
  mongoURL
}