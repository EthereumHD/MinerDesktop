<template>
    <div class="main">
        <!-- <div class="bg1"></div> -->
        <div class="bg2"></div>
        <div class="box">
            <div class="phone">
                <div class="phone-bg"></div>
            </div>
            <div class="import">
                <div class="import-wrapper">
                    <p class="label">{{ l.SCANIMPORT }}</p>
                    <div class="qrcode">
                        <canvas id="canvas"></canvas>
                    </div>
                    <p class="label wallet">
                        {{ l.PLEASEUSE1 }}
                        <span>{{ l.POCWALLET }}</span>
                        {{ l.PLEASEUSE2 }}
                    </p>
                </div>
            </div>
        </div>

        <div class="version">v1.0.3</div>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");
import common from "./common";
import Web3 from "web3";
import qrcode from "qrcode";
import Store from "./store";

let WEBSERVERIP;
let WERBSERVERPORT = 18979;
let server;

export default {
    name: "import",
    data() {
        return {
            l: {
                SCANIMPORT: "",
                PLEASEUSE1: "",
                POCWALLET: "",
                PLEASEUSE2: ""
            }
        };
    },
    computed: {},
    created() {
        this.toggleLanguage = this.toggleLanguage.bind(this);

        this.toggleLanguage();
    },
    mounted() {
        console.log("Welcome to import page...");
        this.startWebserver();
        this.refreshQrcode();

        ipcRenderer.on("lang-changed", (event, lang) => {
            console.log("Lang changed to " + JSON.stringify(lang));
            this.toggleLanguage();
        });
    },
    destroyed() {
        server.close();
    },
    beforeDestroy() {
        console.log("Destroy importpage...");

        this.toggleLanguage = this.toggleLanguage.bind(this);
        ipcRenderer.removeListener("lang-changed", this.toggleLanguage);
    },
    methods: {
        toggleLanguage() {
            //获取语言文件
            let lang = ipcRenderer.sendSync("get-lang");
            for (let i in this.l) {
                this.l[i] = lang[i];
                // console.log(i, this.l[i]);
            }
        },
        startWebserver() {
            let http = require("http");
            let url = require("url");
            WEBSERVERIP = this.getIPAdress();
            server = http
                .createServer((req, res) => {
                    let { pathname, query } = url.parse(req.url, true);

                    if (pathname === "/import") {
                        res.setHeader(
                            "Access-Control-Allow-Origin",
                            "http://localhost"
                        );
                        res.setHeader(
                            "Access-Control-Allow-Credentials",
                            "true"
                        );
                        res.setHeader(
                            "Access-Control-Allow-Methods",
                            "GET,POST,PUT,DELETE,PATCH,OPTIONS"
                        );
                        res.setHeader(
                            "Access-Control-Allow-Headers",
                            "Origin,User-Agent,X-Requested-With,Content-Type,Accept,Authorization,Accept-Language,Accepth-Encoding"
                        );
                        res.writeHead(200, {
                            "Content-Type": "application/json"
                        });

                        let str = "";
                        req.on("data", data => {
                            console.log("收到数据：" + data);
                            str += data;
                        });
                        req.on("end", () => {
                            console.log("所有数据:" + str);
                            //导入钱包成功
                            try {
                                let wallet = JSON.parse(str);
                                let keystore = wallet.keystore;
                                let address = JSON.parse(keystore).address;
                                console.log("保存钱包数据:" + address);
                                ipcRenderer.sendSync("update-wallet", {
                                    keystore: keystore,
                                    addr: address
                                });
                                console.log("保存成功，前往首页");
                                //跳转首页
                                ipcRenderer.send("go-page", "admin");
                            } catch (e) {
                                console.log("导入钱包失败....");
                            }
                            console.log(req.method);
                            res.write("{err_no: 0}");
                            return res.end();
                        });
                    } else {
                        res.statusCode = 200;
                        res.write("{err_no: 0}");
                        return res.end();
                    }
                })
                .listen(WERBSERVERPORT, () => {
                    console.log(
                        "开启服务器 http://" +
                            WEBSERVERIP +
                            ":" +
                            WERBSERVERPORT
                    );
                });
        },
        getIPAdress() {
            let os = require("os");
            let interfaces = os.networkInterfaces();
            for (let devName in interfaces) {
                let iface = interfaces[devName];
                for (let i = 0; i < iface.length; i++) {
                    let alias = iface[i];
                    if (
                        alias.family === "IPv4" &&
                        alias.address !== "127.0.0.1" &&
                        !alias.internal
                    ) {
                        return alias.address;
                    }
                }
            }
        },
        refreshQrcode() {
            /////////////////
            //  QRCODE:
            //      POC://IMPORTACCOUNT/ENCODEDURL
            //  EXAMPLE:
            //      POC://ACCOUNT/IMPORT/https%3a%2f%2f192.168.0.3%3a8979%2fimport
            /////////////////

            let url = encodeURIComponent(
                "http://" + WEBSERVERIP + ":" + WERBSERVERPORT + "/import"
            );

            let codetext = "POC://ACCOUNT/IMPORT/" + url;

            let canvas = document.getElementById("canvas");
            qrcode.toCanvas(canvas, codetext, function(error) {
                if (error) console.error(error);
                console.log("二维码生成成功！");
            });
        }
    }
};
</script>

<style lang="less" scoped>
.main {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background: #f8f8f8;
    position: relative;

    .bg1 {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 200px;
        height: 100%;
        background: url(../assets/images/logo-bg.svg) right bottom no-repeat;
        background-size: 200px auto;
    }

    .bg2 {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 100%;
        height: 120px;
        background: url(../assets/images/logo-bg-1.svg) left bottom no-repeat;
        background-size: auto 120px;
    }

    .box {
        //居中
        background: #ffffff;
        border-radius: 12px;
        display: flex;
        width: 600px;
        height: 360px;
        position: relative;
        z-index: 9999;

        .phone {
            flex: 1;
            // padding-right: 60px;
            display: flex;
            align-items: flex-end;
            box-sizing: border-box;

            .phone-bg {
                background: url(../assets/images/phone@2x.png) right bottom
                    no-repeat;
                background-size: 220px auto;
                height: 100%;
                width: 230px;
                margin-left: auto;
            }
        }

        .import {
            flex: 1;
            display: flex;
            align-items: center;
            flex-direction: column;
            justify-content: center;
            box-sizing: border-box;

            .import-wrapper {
                text-align: center;
                margin-top: 30px;
            }
            .label {
                font-size: 14px;
                color: #4a4a4a;
                line-height: 20px;
                padding: 0 40px;

                span {
                    color: #00b000;
                }
            }

            .qrcode {
                width: 160px;
                height: 160px;
                margin: 20px auto;
                canvas {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }

    .version {
        position: absolute;
        bottom: 40px;
        font-size: 14px;
        color: #4a4a4a;
        line-height: 2;
        width: 100%;
        text-align: center;
    }
}
</style>