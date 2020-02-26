<template>
    <el-header class="right-header">
        <div class="address">
            <div class="address-wrapper">
                <span class="icon-address"></span>
                <div class="label">
                    <p class="addr">{{ addr | toAddr }}</p>
                    <p>{{ l.COINBASE }}</p>
                </div>
            </div>
        </div>
        <div class="language">
            <div class="icon icon-language"></div>
            <div class="label">{{ currLang == 'cn' ? '简体中文' : 'en' }}</div>
            <div class="arrow"></div>
            <div class="language-list">
                <div class="lang" @click="toggleLang('cn')">简体中文</div>
                <div class="lang" @click="toggleLang('en')">English</div>
            </div>
        </div>
        <el-button type="text" class="quit" @click="quitLogin"></el-button>
    </el-header>
</template>

<script>
import { ipcRenderer } from "electron";
export default {
    data() {
        return {
            addr: "",
            currLang: "en",
            l: {}
        };
    },
    name: "poc-header",
    props: ["address"],
    created() {
        this.toggleLanguage = this.toggleLanguage.bind(this);
        this.toggleLanguage();
    },
    mounted() {
        this.addr = this.address;
        ipcRenderer.on("lang-changed", this.toggleLanguage);
        this.currLang = ipcRenderer.sendSync("get-lang-name");
    },
    beforeDestroy() {
        console.log("Destroy headerpage......");

        ipcRenderer.removeListener("lang-changed", this.toggleLanguage);
    },
    watch: {
        address(nv, ov) {
            this.addr = nv;
        }
    },
    methods: {
        toggleLanguage() {
            //获取语言文件
            let lang = ipcRenderer.sendSync("get-lang");
            this.l = lang;
            this.currLang = ipcRenderer.sendSync("get-lang-name");
            this.$forceUpdate();
        },
        toggleLang(lang) {
            ipcRenderer.send("set-lang", lang);
        },
        quitLogin() {
            this.$confirm(this.l.DELETEKEYSTORE, this.l.TIPS, {
                confirmButtonText: this.l.CONFIRM,
                cancelButtonText: this.l.CANCEL,
                type: "warning"
            })
                .then(() => {
                    //删除钱包
                    console.log("Start to delete wallet");
                    let result = ipcRenderer.sendSync("delete-wallet");
                    ipcRenderer.send("go-page", "import");
                })
                .catch(() => {});
        }
    }
};
</script>

<style lang="less" scoped>
.right-header {
    display: flex;
    height: 64px !important;
    box-shadow: 1px 0 25px 0 rgba(0, 0, 0, 0.04);

    .address {
        flex: 1;
        height: 100%;
    }

    .language {
        cursor: pointer;
        display: flex;
        height: 100%;
        position: relative;

        .icon-language {
            height: 100%;
            width: 24px;
            background: url(../assets/images/language.svg) left center no-repeat;
            background-size: 16px auto;
        }
        .label {
            font-size: 14px;
            color: #344563;
            line-height: 64px;
        }
        .arrow {
            height: 100%;
            width: 14px;
            background: url(../assets/images/arrow.svg) right center no-repeat;
            background-size: 10px auto;
        }

        &:hover {
            .language-list {
                display: block;
            }
        }

        .language-list {
            position: absolute;
            z-index: 9999;
            top: 54px;
            left: -16px;
            font-size: 12px;
            color: #344563;
            background: #fff;
            display: none;
            .lang {
                width: 124px;
                border: 1px solid #eee;
                height: 36px;
                line-height: 34px;
                padding: 0 20px;
                margin-bottom: -1px;
                cursor: pointer;
            }
        }
    }

    .quit {
        cursor: pointer;
        height: 100%;
        width: 80px;
        background: url(../assets/images/quit.svg) center center no-repeat;
        background-size: 18px auto;
    }
}

.address-wrapper {
    background: #f8f8f8;
    border: 1px solid #e8e8e8;
    border-radius: 6px;
    padding: 4px 16px;
    font-size: 10px;
    line-height: 14px;
    margin-top: 13px;
    display: inline-block;
    .icon {
        display: inline-block;
        vertical-align: middle;
    }
    .label {
        display: inline-block;
        vertical-align: middle;
    }
    .icon-address {
        background: url(../assets/images/address.svg) left center no-repeat;
        background-size: 14px auto;
        height: 28px;
        width: 20px;
        display: inline-block;
        vertical-align: middle;
    }
}
</style>