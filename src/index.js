const { exec } = require('child_process')
const si = require('systeminformation')
//获取系统电量
function getbattery() {
    const promise = new Promise((resolve, rejects) => {
        exec('pmset -g batt | grep -Eo "\\d+%" | cut -d% -f1', (error, stdout) => {
            resolve(stdout.trim())
        })
    })
    return promise
}
//电池电量自定义元素
class __battery extends HTMLElement {
    constructor() {
        super()
    }
    update(value) {
        this.style.setProperty(`--value`, `${value}%`)
        this.style.setProperty(`--rocate`, `${value / 100 * 360 - 90}deg`)
        this.querySelector("p").innerHTML = `${value}`
    }
}
customElements.define("m-battery", __battery)
const ele = {
    time: {
        big: document.querySelector("#time #big"),
        small: document.querySelector("#time #small")
    },
    date: document.querySelector("#date"),
    battery: document.querySelector("#battery"),
    clip: document.querySelector("#clip"),
    memory: document.querySelector(".memory"),
    system: document.querySelector("#system")
}
const battery = {
    init() {
        setInterval(() => {
            getbattery().then((resolve) => {
                ele.battery.update(resolve)
                ele.battery.classList.add("show")
            })
        }, 1000)
    }
}


const time = {
    init() {
        setInterval(() => {
            const now = new Date()
            const hour = now.getHours()
            const minute = now.getMinutes()
            const second = now.getSeconds()
            ele.time.big.innerHTML = `${this.format(hour)}:${this.format(minute)}`
            ele.time.small.innerHTML = `${this.format(second)}`
            ele.time.big.classList.add("show")
            ele.time.small.classList.add("show")
        }, 1000)
    },
    format(time) {
        return time < 10 ? "0" + time : time
    }
}
const date = {
    init() {
        const { month, day, week } = this.get()
        ele.date.innerHTML = `${month}-${day} ${this.formatweek(week)}`
        ele.date.classList.add("show")
        setInterval(() => {
            const { month, day, week } = this.get()
            ele.date.innerHTML = `${month}-${day} ${this.formatweek(week)}`
        }, 1000)
    },
    get() {
        const now = new Date()
        const month = now.getMonth() + 1
        const day = now.getDate()
        const week = now.getDay()
        return { month, day, week }
    },
    formatweek(day) {
        const week = [ "Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return week[day]
    }
}

class __mRang extends HTMLElement {
    constructor() {
        super()
        this.value = undefined
    }
    connectedCallback() {
        const ele = document.createElement("m-value")
        this.value = this.innerHTML
        ele.style.setProperty("--value", `${this.innerHTML}`)
        this.innerHTML = ""
        this.append(ele)
    }
    show() {
        this.querySelector("m-value").classList.add("show")
    }
}
customElements.define("m-rang", __mRang)
function getSystemInfor() {
    var cpu, fssize = { total: 0, used: 0 }
    return new Promise((res) => {
        si.cpu().then(res => cpu = `${res.vendor} ${res.brand}`).then(() => {
            si.mem().then(res => cpu += ` ${res.total / 1024 / 1024 / 1024}GB`).then(() => {
                si.fsSize().then(res => {
                    fssize.total = res[0].size / 1024 / 1024 / 1024
                    fssize.used = (res[0].size - res[0].available) / 1024 / 1024 / 1024
                }).then(()=>{
                    res({ cpu, fssize })
                })
            })
        })
    })
}
setTimeout(() => {
    ele.clip.classList.add("hide")
    date.init()
    battery.init()
    time.init()
    getSystemInfor().then(res => {
        const s = res
        ele.system.querySelector(".cpu").innerHTML = res.cpu
        ele.memory.querySelector("p").innerHTML = `${parseInt(s.fssize.used)}GB / ${parseInt(s.fssize.total)}GB`
        const rang = document.createElement("m-rang")
        rang.innerHTML = `${s.fssize.used / s.fssize.total * 100}%`
        ele.memory.append(rang)
        ele.system.classList.add("show")
        setTimeout(()=>{
            rang.querySelector("m-value").classList.add("show")
        },500)
    })
}, 5000)