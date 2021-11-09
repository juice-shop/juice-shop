import confetti from 'canvas-confetti'

const timeout = (ms: number) => {
    return new Promise((resolve,reject) => {
        setTimeout(resolve,ms)
    })
}
export const shootConfetti = () => {
    const canvas = document.createElement('canvas')
    canvas.style.position = "fixed"
    canvas.style.left = "0"
    canvas.style.right = "0"
    canvas.style.width = "100%"
    canvas.style.height = "100%"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "2000"

    document.body.appendChild(canvas)

    const shoot = confetti.create(canvas,{
        resize: true
    })
    shoot({
        origin:{
            x:1,
            y:1
        },
        particleCount: 225
    })

    shoot({
        origin:{
            y:1,
            x:0
        },
        particleCount: 225
    })

    timeout(6000).then(() => {
        canvas.remove()
    })
}