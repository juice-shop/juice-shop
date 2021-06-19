
const getVerdict = (vulnLines: number[], selectedLines: number[]) => {
  let verdict: boolean = true
  vulnLines.sort((a, b) => a - b)
  selectedLines.sort((a, b) => a - b)
  if (vulnLines.length !== selectedLines.length) {
    verdict = false
  }
  for (let i = 0; i < vulnLines.length; i++) {
    if (vulnLines[i] !== selectedLines[i]) {
      verdict = false
    }
  }

  return verdict
}

exports.checkVulnLines = () => (req, res, next) => {
  const vulnLines: number[] = req.body.vulnLines
  const selectedLines: number[] = req.body.selectedLines
  if (getVerdict(vulnLines, selectedLines)) {
    res.status(200).json({
      verdict: true
    })
  } else {
    res.status(200).json({
      verdict: false
    })
  }
}
