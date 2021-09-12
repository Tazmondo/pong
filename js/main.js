let canvas = document.querySelector('canvas')
let ctx = canvas.getContext('2d')

canvas.height = canvas.clientHeight
canvas.width = canvas.clientWidth

const PONGHEIGHT = 60
const PONGWIDTH = 10
const BALLSIZE = 5
const DEFAULTVELOCITY = 2
const VELINCREMENT = 0.2
const TICKRATE = 1000/300

function dtr(degrees) {
    return degrees * (Math.PI/180)
}

function rtd(radians) {
    return radians / (Math.PI / 180)
}

let pscore = 0

let scoreCounter = document.querySelector('.scores .score')
function incrementScore(){
    pscore += 1
    scoreCounter.textContent = pscore
}
function resetScore() {
    pscore = 0
    scoreCounter.textContent = pscore
}

/**
 * Check if two objects collide
 * @param object1 {[[number,number],[number,number]]} [[x1, y1], [x2, y2]]
 * @param object2 {[[number, number], [number, number]]} [[x1, y1], [x2, y2]]
 * @return boolean
 */
function collides(object1, object2) {
    return object1[0][0] < object2[1][0] &&
        object1[1][0] > object2[0][0] &&
        object1[0][1] < object2[1][1] &&
        object1[1][1] > object2[0][1];

}

function Pong(player1) {
    let height = PONGHEIGHT
    let width = PONGWIDTH
    let x = player1 ? 0 : canvas.width-width
    let y = canvas.height / 2 - height/2

    let touched = Date.now()

    let mouseY = y
    canvas.addEventListener('mousemove', e => {
        mouseY = e.offsetY
    })

    const MOVESPEED = 2
    let pressed = {}
    document.addEventListener('keydown', e => {
        pressed[e.key] = true
    })
    document.addEventListener('keyup', e => {
        pressed[e.key] = false
    })

    setInterval(() => {
        if (pressed['ArrowDown']) {
            mouseY += MOVESPEED
        } else if (pressed['ArrowUp']) {
            mouseY -= MOVESPEED
        }
    })

    function getColor() {
        let end = 255
        let start = 0

        let time = 0.5
        let difference = (Date.now() - touched) / 1000
        let result = end
        if (difference <= time) {
            let scale = difference / time
            result = (start+end) * scale
        }
        return `rgb(${result}, 255, ${result})`
    }

    return {
        getX() {
            return x
        },
        getY() {
            return y
        },
        height,
        width,
        getBBox() {
            if (player1) {
                return [
                    [-1000, y-20],
                    [x + width, y + height + 20]
                ]
            } else {
                return [
                    [x, y-5],
                    [10000, y+height+5]
                ]
            }
        },
        tick() {
            if (player1) {
                y = mouseY - height/2
                if (y < 0) y = 0
                else if (y > canvas.height-height) y = canvas.height-height
            } else {
                y = ball.getY() - height/2
                if (y < 0) y = 0
                else if (y > canvas.height-height) y = canvas.height-height
            }
            ctx.fillStyle = getColor()
            ctx.fillRect(x, y, width, height)
        },
        touched() {
            touched = Date.now()
        },
    }
}

const ball =(() => {
    let width = BALLSIZE
    let height = BALLSIZE

    let x = canvas.width - PONGWIDTH - BALLSIZE;
    let y = (canvas.height / 2) + (PONGHEIGHT / 2);
    let velocity = DEFAULTVELOCITY
    let angle = 240
    let allowance = true

    function getBBox() {
        return [
            [x, y],
            [x + width, y + height]
        ]
    }

    function resetPos() {
        // console.log("a2", x, velocity, angle)

        x = canvas.width - PONGWIDTH - BALLSIZE
        // console.log("a", x)
        y = (canvas.height / 2) + (PONGHEIGHT / 2)
        ctx.fillStyle = '#fff'
        ctx.fillRect(x, y, width, height)
    }

    function tick() {
        let yD = Math.cos(dtr(angle)) * velocity
        let xD = Math.sin(dtr(angle)) * velocity
        x += xD
        y += yD
        if (y < 0 || y > canvas.height) {
            // console.log("touched");
            angle = 180 - angle
            y < 0 ? y = 0 : y = canvas.height
        }
        if (collides(getBBox(), [[-1000,0], [PONGWIDTH-1, canvas.height]]) || x > canvas.width - PONGWIDTH) {
            if (x < PONGWIDTH) {
                if (collides(getBBox(), pong1.getBBox())) {
                    let middle = pong1.getY() + pong1.height/2
                    let offset = y - middle
                    let scale = (offset / ((pong1.height+40)/2))*-1
                    angle = (scale + 1) * 90
                    allowance = true
                    velocity += VELINCREMENT
                    incrementScore()
                    pong1.touched()
                } else {
                    if (allowance === true) {
                        allowance = false
                    } else{
                        gameOver()
                        resetPos()
                        resetScore()
                        velocity = DEFAULTVELOCITY
                    }
                }
            } else if (x > canvas.width - PONGWIDTH) {
                if (collides(getBBox(), pong2.getBBox())) { // remove me and add scoring
                    // console.log("a");
                    let middle = pong2.getY() + pong2.height/2
                    let offset = y - middle
                    let scale = (offset / (pong1.height/2))*-1
                    angle = 360 - (scale + 1) * 90
                    pong2.touched()
                }
                x = canvas.width - PONGWIDTH
            }
            // Angles that are too steep are annoying/unfun
            if (angle >= 0 && angle < 30) angle = 30
            if (angle > 160 && angle <= 180) angle = 160
            if (angle >= 180 && angle < 210) angle = 210
            if (angle <= 360 && angle > 330) angle = 330
            // if (angle >= 90 && angle < 120) angle = 120
        }
        ctx.fillStyle = '#f00'
        ctx.fillRect(x, y, width, height)
    }
    return {
        tick,
        getY() {
            return y
        }
    }
})()
let pong1 = Pong(true)
let pong2 = Pong(false)

let playing = false
let startDiv = document.querySelector('div.message.start')
let startButton = document.querySelector('button.start-game')
startButton.addEventListener('click', e => {
    startDiv.classList.toggle('hidden', true)
    setTimeout(() => playing = true, 500)
})

let gameOverDiv = document.querySelector('div.message.game-over')
let gameOverButton = document.querySelector('button.game-over')
let scoreText = document.querySelector('.message.game-over .score')
gameOverButton.addEventListener('click', e => {
    gameOverDiv.classList.toggle('hidden', true)
    setTimeout(() => playing = true, 500)
})
function gameOver() {
    playing = false
    scoreText.textContent = pscore
    gameOverDiv.classList.toggle('hidden', false)
    gameOverButton.focus()
}

setInterval(() => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#fff'
    pong1.tick()
    pong2.tick()
    if (playing) {
        ball.tick()
    }
}, TICKRATE)
