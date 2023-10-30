function loadHint (hint: ChallengeHint): HTMLElement {
  // ... existing code ...

  const textBox = document.createElement('span')
  textBox.style.flexGrow = '2'
  textBox.textContent = snarkdown(hint.text) // use textContent instead of innerHTML

  // ... existing code ...
}