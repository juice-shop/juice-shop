const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')
const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const config = require('config')
const db = require('../data/mongodb')

module.exports = function exportProfile () {
    return (req, res, next) => {
        const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
        if(loggedInUser && loggedInUser.data && loggedInUser.data.email) {
            const username = loggedInUser.data.username === '' ? 'n.a.' : loggedInUser.data.username
            const email = loggedInUser.data.email
            const filename = insecurity.hash(email).slice(0, 10)
            const pdfFile = 'profile_' + filename + '.pdf'
            const doc = new PDFDocument()
            const date = new Date().toJSON().slice(0, 10)
            const fileWriter = doc.pipe(fs.createWriteStream(path.join(__dirname, '../ftp/', pdfFile)))
            doc.font('Times-Roman', 40).text(config.get('application.name'), { align: 'center' })
            doc.moveTo(70, 115).lineTo(540, 115).stroke()
            doc.moveTo(70, 120).lineTo(540, 120).stroke()
            doc.fontSize(20).moveDown()
            doc.font('Times-Roman', 20).text('Username: ' + username, {align: 'center'})
            doc.font('Times-Roman', 20).text('E-mail: ' + email, {align: 'center'})
            doc.end()
            fileWriter.on('finish', () => {
                const data = fs.readFileSync(path.join(__dirname, '../ftp/', pdfFile));
                res.contentType("application/pdf");
                res.send(data);
            })
        } else {
            next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
        }

        // db.orders.find({ $where: "this.email === '" + req.params.email + "'" }).then(orders => {
        //     const result = utils.queryResultToJson(order)
        //     res.json(result)
        //   }, () => {
        //     res.status(400).json({ error: 'Wrong Param' })
        //   })
    }
}