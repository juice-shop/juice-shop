// function loadInstructorModule (name: String) {
//   return ''
// }

export function init () {
  // loadInstructorModule('challenge_xss')
  console.log('Hacking Instructor Init')

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
  elem.innerText = 'Well, I prefer stripes, but let‘s do some cross site scripting! First, let‘s search for „wasp“ in the Search box at the top of the page!'

  const target = document.getElementById('searchQuery') as HTMLElement

  const relAnchor = document.createElement('div')
  relAnchor.style.position = 'relative'
  relAnchor.appendChild(elem)

  if (target.parentElement) {
    target.parentElement.appendChild(relAnchor)
  }
}
