const path = require('path')
const fs = require('fs')
const PDFDocument = require('pdfkit')
const utils = require('../lib/utils')
const insecurity = require('../lib/insecurity')
const config = require('config')
const db = require('../data/mongodb')
const PDFTable = require('voilab-pdf-table')

module.exports = function exportProfile () {
    return (req, res, next) => {
        const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token)
        if(loggedInUser && loggedInUser.data && loggedInUser.data.email) {
            const username = loggedInUser.data.username === '' ? 'n.a.' : loggedInUser.data.username
            const email = loggedInUser.data.email
            const updatedEmail = email.replace(/[aeiou]/gi, '*')
            const filename = insecurity.hash(email).slice(0, 10)
            const pdfFile = 'profile_' + filename + '.pdf'
            const doc = new PDFDocument()
            const date = new Date().toJSON().slice(0, 10)
            const fileWriter = doc.pipe(fs.createWriteStream(path.join(__dirname, '../ftp/', pdfFile)))
            
            const table = new PDFTable(doc, { topMargin: 10, bottomMargin: 10 });
            table
                .setColumnsDefaults({
                    align: 'center',
                    padding: [5, 5, 5, 5],
                    headerBorder: ['L','T','B','R'],
                    border: ['L','T','B','R']
                })
                .addColumns([
                    {
                        id: 'name',
                        header: 'Name',
                        align: 'center',
                        width: 150,
                        padding: [5, 5, 5, 5]
                    },
                    {
                        id: 'price',
                        header: 'Price',
                        align: 'center',
                        width: 100,
                        padding: [5, 5, 5, 5]
                    },
                    {
                        id: 'quantity',
                        header: 'Quantity',
                        align: 'center',
                        width: 100,
                        padding: [5, 5, 5, 5]
                    },
                    {
                        id: 'total',
                        header: 'Total',
                        align: 'center',
                        width: 100,
                        padding: [5, 5, 5, 5]
                    }
                ])

            db.orders.find({ $where: "this.email === '" + updatedEmail + "'" }).then(orders => {
                const result = utils.queryResultToJson(orders)
                const data = result.data
                
                doc.font('Times-Roman', 40).text(config.get('application.name'), { align: 'center' })
                doc.moveTo(70, 115).lineTo(540, 115).stroke()
                doc.moveTo(70, 120).lineTo(540, 120).stroke()
                doc.fontSize(20).moveDown()
                doc.font('Times-Roman', 20).text('Username: ' + username, {align: 'center'})
                doc.font('Times-Roman', 20).text('E-mail: ' + email, {align: 'center'})
                doc.fontSize(20).moveDown()
                doc.font('Helvetica-Bold', 25).text('Orders (' + data.length + ')', {align: 'center'})
                
                if(data.length > 0) {
                    data.map(order => {
                        doc.font('Times-Roman', 15).text('Order id: ' + order.orderId)
                        doc.font('Times-Roman', 15).text('Total amount: $' + order.totalPrice)

                        let tableBody = []
                        order.products.map(product => {
                            tableBody.push({
                                name: product.name, 
                                price: '$' + product.price, 
                                quantity: product.quantity, 
                                total: '$' + product.total
                            })
                        })
                        table.addBody(tableBody)
                        doc.x = doc.page.margins.left

                        doc.fontSize(20).moveDown()
                    })
                } else {
                    doc.font('Times-Roman', 20).text('No orders placed yet.', {align: 'center'})
                }
                doc.end()
                fileWriter.on('finish', () => {
                    const data = fs.readFileSync(path.join(__dirname, '../ftp/', pdfFile));
                    res.contentType("application/pdf");
                    res.send(data);
                })

            }, () => {
                next(new Error('Wrong param for finding orders'))
            })

        } else {
            next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
        }
    }
}