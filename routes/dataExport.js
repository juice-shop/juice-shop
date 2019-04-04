module.exports = function dataExport () {
  return (req, res) => {
    res.status(200).json({ confirmation: 'Your data is being exported' })
  }
}
