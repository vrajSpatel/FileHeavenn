const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, "..", 'uploads')

// check if folder is there if not then it will create one

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
}

module.exports = { dir }