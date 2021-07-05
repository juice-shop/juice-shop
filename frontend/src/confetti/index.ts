import confetti from 'canvas-confetti'

const timeout = (ms: number) => {
    return new Promise((resolve,reject) => {
        setTimeout(resolve,ms)
    })
}
export const shootConfetti = (message: string) => {
    const canvas = document.createElement('canvas')
    canvas.style.position = "fixed"
    canvas.style.left = "0"
    canvas.style.right = "0"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.backgroundColor = "rgba(62, 66, 62, 0.322)"

    const dialogBox = document.createElement('div')
    dialogBox.style.width = "40%"
    dialogBox.style.height = "20%"
    dialogBox.style.position = "fixed"
    dialogBox.style.left = "30%"
    dialogBox.style.top = "40%"
    dialogBox.style.backgroundColor = "rgb(58, 241, 12)"
    dialogBox.style.color = "black"
    dialogBox.innerText = message
    dialogBox.style.zIndex = "2001"
    canvas.style.zIndex = "2000"

    document.body.appendChild(canvas)
    document.body.appendChild(dialogBox)

    const shoot = confetti.create(canvas,{
        resize: true
    })
    shoot({
        origin:{
            x:1
        },
        particleCount: 225
    })

    shoot({
        origin:{
            x:0
        },
        particleCount: 225
    })

    timeout(6000).then(() => {
        canvas.remove()
        dialogBox.remove()
    })
}