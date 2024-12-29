//引入exec库
const { exec } = require('child_process')
//引入systeminformation库
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
//自定义元素
customElements.define("m-battery", __battery)
//对象为使用到的元素
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
//更新电量的封装1秒一次
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


//更新时间的封装包含init方法和格式化format方法
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
        //小于10的数就在数字前面补一个0
        return time < 10 ? "0" + time : time
    }
}
//更新日期包含init，get，formatweek方法
const date = {
    init() {
        //从get方法中获取月日周
        const { month, day, week } = this.get()
        //初始化，以免在加载完成时仍要等待一秒
        ele.date.innerHTML = `${month}-${day} ${this.formatweek(week)}`
        ele.date.classList.add("show")
        setInterval(() => {
            //1秒刷新一次
            const { month, day, week } = this.get()
            ele.date.innerHTML = `${month}-${day} ${this.formatweek(week)}`
        }, 1000)
    },
    get() {
        const now = new Date()
        const month = now.getMonth() + 1
        const day = now.getDate()
        const week = now.getDay()
        //返回月日周
        return { month, day, week }
    },
    //格式化星期，根据day参数的数字定位到数组的元素。
    formatweek(day) {
        const week = [ "Sunday","Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        return week[day]
    }
}
//自定义元素用来显示存储，继承HTMLElement原型
class __mRang extends HTMLElement {
    //类构造器
    constructor() {
        //继承属性
        super()
        //定义类的全局值，初始化是必须的规范。
        this.value = undefined
    }
    connectedCallback() {
        //自定义元素被添加到页面后的操作
        const ele = document.createElement("m-value")
        this.value = this.innerHTML
        //通过css变量为条条赋值
        ele.style.setProperty("--value", `${this.innerHTML}`)
        this.innerHTML = ""
        this.append(ele)
    }
    show() {
        //显示该元素
        this.querySelector("m-value").classList.add("show")
    }
}
//自定义元素
customElements.define("m-rang", __mRang)
//获取系统信息
//系统信息都是通过systeminformation获取的，但是返回的都是promise。都是异步的。
function getSystemInfor() {
    var cpu, fssize = { total: 0, used: 0 }//这段不要也罢在最后返回的时候直接返回也可。
    return new Promise((res) => {
        //返回promise。
        si.cpu().then(res => cpu = `${res.vendor} ${res.brand}`).then(() => {//等待执行完成后执行作用域内的操作
            si.mem().then(res => cpu += ` ${res.total / 1024 / 1024 / 1024}GB`).then(() => {
                si.fsSize().then(res => {
                    fssize.total = res[0].size / 1024 / 1024 / 1024
                    fssize.used = (res[0].size - res[0].available) / 1024 / 1024 / 1024
                }).then(()=>{
                    res({ cpu, fssize })
                })
            })//多层嵌套不是很好。
        })
    })
}
setTimeout(() => {
    ele.clip.classList.add("hide")
    date.init()
    battery.init()
    time.init()
    getSystemInfor().then(res => {
        //获取系统信息promise的返回
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
}, 5000)//在开屏动画执行结束后执行