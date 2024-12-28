const { app, BrowserWindow, shell } = require('electron')
const { Menu } = require('electron')

//自定义菜单栏
const menu = Menu.buildFromTemplate([
    {
        label: '文件',
        submenu: [
            {
                label: '关闭',
                accelerator: 'Cmd+q', // 快捷键 (macOS: Command+S, Windows/Linux: Ctrl+S)
                role: 'quit'
            },
        ],
    },
    {
        label: '官网',
        submenu: [
            {
                label: '官方网站',
                click: () => {
                    shell.openExternal('https://micropue.com.cn/')
                }
            }
        ]
    }
]);
Menu.setApplicationMenu(menu)
const createWindow = () => {
    const win = new BrowserWindow({
        width: 1100,
        height: 700,
        titleBarStyle: 'hidden',
        transparent: true,
        fullscreen: true, //自动全屏
        frame: false,
        trafficLightPosition: { x: 10, y: 10 },
        webPreferences: {
            nodeIntegration: true, // 启用 Node.js 集成
            contextIsolation: false,// 关闭上下文隔离
            devTools: false,
        },
        minWidth: 1000,
        minHeight: 626
    })

    win.loadFile('./src/index.html')
    win.on('enter-full-screen', () => {
        win.setMenuBarVisibility(false)
    })

    win.on('leave-full-screen', () => {
        win.setMenuBarVisibility(true)
    })
}
app.whenReady().then(() => {
    createWindow()
})