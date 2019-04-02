// function loadInstructorModule (name: String) {
//   return ''
// }

interface HackingInstructorFileFormat {
  challenges: ChallengeInstruction[]
}

interface ChallengeInstruction {
  name: string
  hints: ChallengeHint[]
}

interface ChallengeHint {
  text: string,
  page: string,
  fixture: {
    type: string,
    value: string
  }
  position: string
  hideAfterHint?: boolean
}

const challengeInstructions: HackingInstructorFileFormat = {
  challenges: [
    {
      name: 'XSS Tier 1',
      hints: [
        {
          text: 'Well, I prefer stripes, but let‘s do some cross site scripting! First, let‘s search for „wasp“ in the Search box at the top of the page!',
          page: 'score-board',
          fixture: {
            type: 'id',
            value: 'searchQuery'
          },
          position: 'right'
        },
        {
          text: 'Irgendein Quatsch!',
          page: 'score-board',
          fixture: {
            type: 'id',
            value: 'search-result-heading'
          },
          position: 'right'
        }
      ]
    }
  ]
}

function loadHint (hint: ChallengeHint): HTMLElement {
  const elem = document.createElement('div')
  elem.id = 'hacking-instructor'
  elem.style.position = 'absolute'
  elem.style.zIndex = '20000'
  elem.style.backgroundColor = '#4472C4'
  elem.style.maxWidth = '300px'
  elem.style.minWidth = '250px'
  elem.style.padding = '8px'
  elem.style.borderRadius = '8px'
  elem.style.whiteSpace = 'initial'
  elem.style.lineHeight = '1.3'
  elem.style.overflow = ''
  elem.style.top = `8px`
  elem.innerText = hint.text

  const target = document.getElementById(hint.fixture.value) as HTMLElement

  const relAnchor = document.createElement('div')
  relAnchor.style.position = 'relative'
  relAnchor.appendChild(elem)

  if (target.parentElement) {
    target.parentElement.appendChild(relAnchor)
  }

  return relAnchor
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function init () {
  console.log('Hacking Instructor Init')

  for (const hint of challengeInstructions.challenges[0].hints) {
    const element = loadHint(hint)
    element.scrollIntoView()

    await sleep(5000)
    element.remove()
  }
}
