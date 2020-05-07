'use strict'

import { app, BrowserWindow, ipcMain, Menu, ipcRenderer } from 'electron'
import Common from '../Common';
import path from 'path';
const { shell } = require('electron') // deconstructing assignment
import Store from '../renderer/components/store';

// const LNDB = require('lndb')
// const db = new LNDB('your/path')
// 初始类型
// const pg = db.init('page')
const { dialog } = require('electron')
const { Tray } = require('electron');
var appTray = null;
import fs from 'fs';
const { download } = require("electron-dl");
import md5 from 'md5';
const url = require('url');


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

/**
 * 判断是否是开发模式，跳转到 #路由name 对应.vue页面中
 */

// 导入钱包 ImportPage.vue
const importURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080#import`
    : `file://${__dirname}/index.html#import`;

// 首页 AdminPage.vue
const adminURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080#admin`
    : `file://${__dirname}/index.html#admin`;

// const miningURL = process.env.NODE_ENV === 'development'
// 	? `http://localhost:9080#mining`
// 	: `file://${__dirname}/index.html`;

// const minerURL = process.env.NODE_ENV === 'development'
// 	? `http://localhost:9080#miner`
// 	: `file://${__dirname}/index.html`;

// const settingURL = process.env.NODE_ENV === 'development'
// 	? `http://localhost:9080#setting`
// 	: `file://${__dirname}/index.html`;

// const appIconPath = process.env.NODE_ENV === 'development'
// 	? `file://${__dirname}/../renderer/assets/images/icon.ico`
// 	: `file://${__dirname}/../renderer/assets/images/icon.ico`

const store = new Store({
    // We'll call our data file 'user-preferences'
    configName: 'storeinfo',
    defaults: {
        currLang: app.getLocale(),
        walletList: [],
        walletIndex: 0,
        minerList: [],
        minerIndex: 0,
    }
});

const langList = ['cn', 'en'];


class ElectronicPoc {
    constructor() {
        const appName = app.getName();
        const appPath = path.join(app.getPath("appData"), appName);
        this.mainWindow = null;

        // store.set('minerList', '[]')
        //获取缓存的钱包信息
        this.shareObjects = {
            walletList: [],
            walletIndex: 0,
            minerList: [],
            minerIndex: 0,
            projectName: 'EHD'
        }
        let walletList = store.get('walletList');
        try {
            walletList = JSON.parse(walletList);
        } catch (e) {
            walletList = [];
        }
        let walletIndex = store.get('walletIndex') || 0;

        if (walletList.length > 0) {
            //有钱包
            this.shareObjects.walletList = walletList;
            if (walletList[this.shareObjects.walletIndex]) {
                this.shareObjects.walletIndex = walletIndex;
            } else {
                this.shareObjects.walletIndex = 0;
            }
        } else {
            this.shareObjects.walletList = [];
            this.shareObjects.walletIndex = 0;
        }

        console.log("Start to get stored miners...")
        let minerList = store.get('minerList');
        if (minerList) {
            try {
                console.log("Get stored miner list...");
                this.shareObjects.minerList = JSON.parse(minerList);
                this.shareObjects.minerIndex = store.get('minerIndex') || 0;
            } catch (e) {
                console.log("Failed to parse miner list...");
            }
        }

        //初始化语言
        let lang = store.get('currLang');
        if (langList.indexOf(lang) == -1) {
            lang = 'en'
        }
        this.currLang = lang;
        this.langFile = {};
        this.setLanguage(lang);
    }

    init() {
        this.makeSingleInstance();
        this.initApp();
        this.initIPC();
    }

    makeSingleInstance(cb) {
        let self = this;
        if (app.makeSingleInstance) {
            app.makeSingleInstance((argv, cmd) => {
                cb && cb();
            })
        } else if (app.requestSingleInstanceLock) {
            let lock = app.requestSingleInstanceLock();
            if (!lock) {
                app.quit()
            } else {
                app.on('second-instance', (event, argv, cwd) => {
                    if (self.mainWindow) {
                        if (self.mainWindow.isMinimized()) {
                            self.mainWindow.restore();
                            self.mainWindow.focus();
                        }
                    }
                })
            }

        } else {
            cb && cb();
        }
    }

    initApp() {
        app.on('ready', () => {
            this.createMainWindow();
            this.setMenu();
        });

        app.on('activate', () => {
            this.makeSingleInstance();
        });
    }

    initIPC() {
        ipcMain.on('log', (event, message) => {
            console.log(message);
        });

        ipcMain.on('set-lang', (event, lang) => {
            let self = this;
            if (this.currLang != lang) {
                self.currLang = lang
                self.setLanguage(lang);
                //通知渲染进程更新
                self.mainWindow.webContents.send("lang-changed", lang);
                self.setMenu();
                store.set('currLang', lang);
            }
        })

        ipcMain.on('get-lang-name', (event) => {
            event.returnValue = this.currLang;
        })

        ipcMain.on('go-page', (event, message) => {
            if (message == 'admin') {
                this.mainWindow.loadURL(adminURL);
            } else if (message == 'import') {
                this.mainWindow.loadURL(importURL);
            }
        });

        ipcMain.on('delete-wallet', (event, message) => {
            // console.warning("Start to delete wallet...")
            this.shareObjects.walletList.splice(this.shareObjects.walletIndex, 1);
            this.shareObjects.walletIndex = 0;
            store.set('walletList', JSON.stringify(this.shareObjects.walletList));
            store.set('walletIndex', JSON.stringify(this.shareObjects.walletIndex));
            event.returnValue = 0;
        });

        ipcMain.on('delete-miner', (event, index) => {
            if (this.shareObjects.minerList[index]) {
                this.shareObjects.minerIndex = 0;
                this.shareObjects.minerList.splice(index, 1);
                store.set('minerList', JSON.stringify(this.shareObjects.minerList));
                store.set('minerIndex', JSON.stringify(this.shareObjects.minerIndex));
            } else {
                console.error("矿机不存在:", index);
            }
            event.returnValue = this.shareObjects.minerList;
        })

        ipcMain.on('add-miner', (event, m) => {
            console.log("Start to add miner....");
            let minerList = this.shareObjects.minerList;
            let minerIndex = this.shareObjects.minerIndex;
            let name = md5(m.device.serialNumber).slice(-4);
            name = 'EHDMiner-' + name;
            if (minerList && minerList.length > 0) {
                if (minerList.find(item => item.mac == m.device.mac && item.bindUserHash == m.device.bindUserHash)) {
                    //旧钱包, 更新walletIndex;
                    for (let i = 0; i < minerList.length; i++) {
                        if (minerList[i].bindUserHash == m.device.bindUserHash) {
                            minerIndex = i;
                            break;
                        }
                    }
                    console.error("Miner is added.........");
                } else {
                    minerList.unshift({
                        capacity: m.device.diskInfo.all,
                        ip: m.URLBase,
                        UDN: m.device.UDN,
                        name: m.device.friendlyName || name,
                        mac: m.device.serialNumber,
                        bindUserHash: m.device.bindUserHash
                    });
                    console.log("Add miner to top...");
                }
            } else {
                this.shareObjects.minerList = [{
                    capacity: m.device.diskInfo.all,
                    UDN: m.device.UDN,
                    ip: m.URLBase,
                    name: m.device.friendlyName || name,
                    mac: m.device.serialNumber,
                    bindUserHash: m.device.bindUserHash
                }];
                minerList = this.shareObjects.minerList;
                minerIndex = 0;
                console.log("Add miner as the only miner...");
            }
            this.shareObjects.minerIndex = minerIndex;
            store.set('minerList', JSON.stringify(minerList));
            store.set('minerIndex', JSON.stringify(minerIndex));
            console.log("Add miner finished", JSON.stringify(minerList));
            event.returnValue = "";
        })

        ipcMain.on('update-wallet', (event, w) => {
            let walletList = this.shareObjects.walletList;
            let walletIndex = this.shareObjects.walletIndex;
            if (walletList) {
                if (walletList.find(item => item.addr == w.addr)) {
                    //旧钱包, 更新walletIndex;
                    for (let i = 0; i < walletList.length; i++) {
                        if (walletList[i].addr == w.addr) {
                            walletIndex = i;
                            break;
                        }
                    }
                } else {
                    walletList.unshift({
                        addr: w.addr,
                        keystore: w.keystore
                    });
                }
            } else {
                this.shareObjects.walletList = [{
                    addr: w.addr,
                    keystore: w.keystore
                }];
                walletIndex = 0;
            }
            this.shareObjects.walletIndex = walletIndex;
            console.info("Store wallet：" + JSON.stringify(this.shareObjects));
            store.set('walletList', JSON.stringify(walletList));
            store.set('walletIndex', JSON.stringify(walletIndex));
            event.returnValue = "";
        });

        ipcMain.on('update-global', (event, key, value) => {
            this.shareObjects[key] = value;
        })

        ipcMain.on('get-global', (event, key) => {
            // event.sender.send(this.shareObjects[key]);
            event.returnValue = this.shareObjects[key];
        })

        ipcMain.on('get-wallet', (event, key) => {
            // event.sender.send(this.shareObjects[key]);
            let wallet = this.shareObjects.walletList[this.shareObjects.walletIndex];
            event.returnValue = wallet;
        })

        ipcMain.on('get-lang', (event, key) => {
            // event.sender.send(this.shareObjects[key]);
            event.returnValue = this.langFile[this.currLang];
        })
    }


    setMenu() {
        let self = this;
        // Create the Application's main menu
        var template = [
            {
                label: app.getName(),
                submenu: [
                    {
                        label: self.__("ABOUT"), accelerator: "CmdOrCtrl+B", click: function () {
                            shell.openExternal(`${Common.website}`);
                        }
                    },
                    {
                        label: self.__("CHECKUPDATE"), accelerator: "CmdOrCtrl+U", click: function () {
                            console.log(`触发了`)
                            //TODO
                            // const appIcon = new Tray('assets/images/icon.png');

                            dialog.showMessageBox(self.mainWindow, {
                                title: self.__("CHECKUPDATE"),
                                message: self.__("NEWESTVERSION")
                            });
                            // shell.openExternal(`${Common.website}`);
                        }
                    },
                    {
                        label: self.__("DEVELOPERMODE"), accelerator: "Shift+CmdOrCtrl+Q", click: function () {
                            let isOpened = self.mainWindow.webContents.isDevToolsOpened();
                            if (isOpened) {
                                self.mainWindow.webContents.closeDevTools();
                            } else {
                                self.mainWindow.webContents.openDevTools();
                            }
                        }
                    },
                    {
                        label: self.__("QUIT"), accelerator: "CmdOrCtrl+Q", click: function () { app.quit(); }
                    }
                ]
            },
            {
                label: self.__("WINDOW"),
                submenu: [
                    { label: self.__("MINIMIZE"), accelerator: "CmdOrCtrl+M", role: "minimize" },
                    {
                        label: self.__("ZOOM"), accelerator: "Shift+CmdOrCtrl+Z", click: function () {
                            Common.ISMAX = !Common.ISMAX;
                            if (Common.ISMAX) {
                                self.mainWindow.maximize();
                            } else {
                                self.mainWindow.setSize(Common.WINDOW_SIZE.width, Common.WINDOW_SIZE.height);
                            }
                            self.mainWindow.center();
                        }
                    }
                ]
            },
            {
                label: self.__("BLOCKCHAINBROWSER"),
                submenu: [
                    {
                        label: self.__("BROWSER"), accelerator: "CmdOrCtrl+H", click() {
                            shell.openExternal(`${Common.baseUrl}/#/`);
                        }
                    },
                ]
            },
            {
                label: self.__("LANGUAGE"),
                submenu: [
                    {
                        label: "中文", accelerator: "Shift+CmdOrCtrl+L+1", click() {
                            if (self.currLang != 'cn') {
                                self.currLang = "cn"
                                self.setLanguage("cn");
                                //通知渲染进程更新
                                self.mainWindow.webContents.send("lang-changed", "cn");
                                self.setMenu();
                                store.set('currLang', 'cn')
                            }
                        }
                    },
                    {
                        label: "English", accelerator: "Shift+CmdOrCtrl+L+2", click() {
                            if (self.currLang != 'en') {
                                self.currLang = "en"
                                self.setLanguage("en");
                                self.mainWindow.webContents.send("lang-changed", "en");
                                self.setMenu();
                                store.set('currLang', 'en')
                            }
                        }
                    },
                ]
            },
        ];
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    }

    setLanguage(lang) {
        if (this.langFile[lang]) {
            return this.langFile[lang];
        }
        let thisPath = 'translations/'
        let myPath = path.join(__static, thisPath + lang + '.json');
        if (!fs.existsSync(myPath)) {
            console.log("Language file not exists!!", lang);
            this.currLang = "en";
            myPath = path.join(__static, thisPath + 'en.json');
        }
        this.langFile[lang] = JSON.parse(fs.readFileSync(myPath), 'utf8');
        return this.langFile[lang];
    }

    __(phrase, arr) {
        let translation = this.langFile[this.currLang][phrase]
        if (translation === undefined) {
            translation = phrase
        }
        let index = 0;
        while (translation.indexOf('{{') > 0) {
            translation = translation.replace(/{{([^}]+)}}/, arr[index++] || "$1");
        }
        return translation
    }

    createMainWindow() {
        console.log("start to create main window......");
        var self = this;
        this.mainWindow = new BrowserWindow({
            width: Common.WINDOW_SIZE.width,
            height: Common.WINDOW_SIZE.height,
            title: Common.FILES_TITLE,
            resizable: true,
            center: true,
            show: false,
            frame: true,
            movable: true,
            autoHideMenuBar: false,
            // fullscreen: true,
            // alwaysOnTop: true,
            backgroundColor: '#f8f8f8',
            titleBarStyle: 'hidden',
            fullscreenWindowTitle: true,
            webPreferences: {
                nodeIntegration: true,
                webSecurity: false,
                // devTools: false,
            },
            icon: path.join(__dirname, '/static/img/icon.ico')
            // titlebarAppearsTransparent: 'YES'
        });

        let wallet = this.shareObjects.walletList[this.shareObjects.walletIndex];
        if (wallet) {
            this.mainWindow.loadURL(adminURL);
        } else {
            this.mainWindow.loadURL(importURL);
        }

        this.mainWindow.webContents.closeDevTools();
        this.mainWindow.on('ready-to-show', function () {
            self.mainWindow.show();
            self.mainWindow.focus();
        });
        this.mainWindow.on('close', (event) => {
            console.log('close')
            app.quit();
        });
    }
}

new ElectronicPoc().init();

