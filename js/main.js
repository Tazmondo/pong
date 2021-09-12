let canvas = document.querySelector('canvas')
let ctx = canvas.getContext('2d')

canvas.height = canvas.clientHeight
canvas.width = canvas.clientWidth

const PONGHEIGHT = 60
const PONGWIDTH = 10
const BALLSIZE = 5

function dtr(degrees) {
    return degrees * (Math.PI/180)
}

function rtd(radians) {
    return radians / (Math.PI / 180)
}

let pscore = 0
let aiscore = 0

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

    let mouseY = y
    canvas.addEventListener('mousemove', e => {
        mouseY = e.offsetY
    })

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
            return [
                [x, y],
                [x + width, y + height]
            ]
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
            ctx.fillStyle = '#fff'
            ctx.fillRect(x, y, width, height)
        }
    }
}

const ball =(() => {
    let width = BALLSIZE
    let height = BALLSIZE

    let x = canvas.width - PONGWIDTH - BALLSIZE;
    let y = (canvas.height / 2) + (PONGHEIGHT / 2);
    let velocity = 7
    let angle = 240
    let allowance = true

    function getBBox() {
        return [
            [x, y],
            [x + width, y + height]
        ]
    }

    function resetPos() {
        console.log("a2", x)

        x = canvas.width - PONGWIDTH - BALLSIZE
        console.log("a", x)
        y = (canvas.height / 2) + (PONGHEIGHT / 2)
    }

    function tick() {
        let yD = Math.cos(dtr(angle)) * velocity
        let xD = Math.sin(dtr(angle)) * velocity
        x += xD
        y += yD
        if (y < 0 || y > canvas.height) {
            console.log("touched");
            angle = 180 - angle
        }
        if (collides(getBBox(), [[-1000,0], [PONGWIDTH-1, canvas.height]]) || x > canvas.width - PONGWIDTH) {
            if (x < PONGWIDTH) {
                if (collides(getBBox(), pong1.getBBox())) { // remove me and add scoring
                    let incidence = 180 - (360 - angle)
                    angle = 180 - incidence

                    let middle = pong1.getY() + pong1.height/2
                    let offset = y - middle
                    let scale = (offset / (pong1.height/2))*-1
                    angle = (scale + 1) * 90
                    allowance = true
                    velocity += 1
                } else {
                    if (allowance === true) {
                        allowance = false
                    } else{
                        pscore += 1
                        resetPos()
                    }
                }
                x = PONGWIDTH - 1
            } else if (x > canvas.width - PONGWIDTH) {
                x = canvas.width - PONGWIDTH
                if (collides(getBBox(), pong2.getBBox()) || true) { // remove me and add scoring
                    let incidence = 180 - angle
                    angle = 180 + incidence

                    let middle = pong2.getY() + pong2.height/2
                    let offset = y - middle
                    let scale = (offset / (pong1.height/2))*-1
                    angle = 360 - (scale + 1) * 90
                }
            }
            if (angle > 160 && angle <= 180) angle = 160
            if (angle >= 0 && angle < 30) angle = 30
            if (angle >= 180 && angle < 210) angle = 210
            if (angle >= 90 && angle < 120) angle = 120
        }
        ctx.fillStyle = '#fff'
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


setInterval(() => {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#fff'
    pong1.tick()
    pong2.tick()
    ball.tick()
}, 1000/60)