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
 * @param object1 {[[x1,y1],[x2,y2]]}
 * @param object2 {[[x1,y1],[x2,y2]]}
 */
function collides(object1, object2) {
    console.log("yes")
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
                y = ball.y - height/2
                if (y < 0) y = 0
                else if (y > canvas.height-height) y = canvas.height-height
            }
            ctx.fillStyle = '#fff'
            ctx.fillRect(x, y, width, height)
        }
    }
}

const ball = {
    width: BALLSIZE,
    height: BALLSIZE,
    x: canvas.width - PONGWIDTH - BALLSIZE,
    y: (canvas.height / 2) + (PONGHEIGHT / 2),
    velocity: 7,
    angle: 240,
    allowance: true,
    getBBox() {
        return [
            [this.x, this.y],
            [this.x + this.width, this.y + this.height]
        ]
    },
    resetPos() {
        this.x = canvas.width - PONGWIDTH - BALLSIZE
        this.y = (canvas.height / 2) + (PONGHEIGHT / 2)
    },
    tick: function tick() {
        let yD = Math.cos(dtr(this.angle)) * this.velocity
        let xD = Math.sin(dtr(this.angle)) * this.velocity
        this.x += xD
        this.y += yD
        if (this.y < 0 || this.y > canvas.height) {
            console.log("touched");
            this.angle = 180 - this.angle
        }
        if (this.x < PONGWIDTH || this.x > canvas.width - PONGWIDTH) {
            if (this.x < PONGWIDTH) {
                if (collides(this.getBBox(), pong1.getBBox())) { // remove me and add scoring
                    let incidence = 180 - (360 - this.angle)
                    this.angle = 180 - incidence

                    let middle = pong1.getY() + pong1.height/2
                    let offset = this.y - middle
                    let scale = (offset / (pong1.height/2))*-1
                    this.angle = (scale + 1) * 90
                    this.allowance = true
                } else {
                    if (this.allowance === true) {
                        this.allowance = false
                    } else{
                        pscore += 1
                        this.resetPos()
                    }
                }
                this.x = PONGWIDTH - 1
            } else if (this.x > canvas.width - PONGWIDTH) {
                this.x = canvas.width - PONGWIDTH
                if (collides(this.getBBox(), pong2.getBBox()) || true) { // remove me and add scoring
                    console.log("touched pong2")
                    let incidence = 180 - this.angle
                    this.angle = 180 + incidence

                    let middle = pong2.getY() + pong2.height/2
                    let offset = this.y - middle
                    let scale = (offset / (pong1.height/2))*-1
                    this.angle = 360 - (scale + 1) * 90
                }
            }
            if (this.angle > 160 && this.angle <= 180) this.angle = 160
            if (this.angle >= 0 && this.angle < 30) this.angle = 30
            if (this.angle >= 180 && this.angle < 210) this.angle = 210
            if (this.angle >= 90 && this.angle < 120) this.angle = 120
        }
        ctx.fillStyle = '#fff'
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }
}

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