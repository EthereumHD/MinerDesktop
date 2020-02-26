<template>
    <div class="poc-menu">
        <h5 class="logo">POC</h5>
        <el-menu
            :default-active="index"
            class="el-menu-vertical-demo"
            @open="handleOpen"
            @close="handleClose"
            background-color="#fff"
            text-color="#5E6C84"
            active-text-color="#00b000"
        >
            <el-menu-item index="1" @click="goIndex('1')">
                <div class="menu-li-wrapper">
                    <i class="el-icon-menu"></i>
                    <span slot="title">{{ l.MININGSUMMARY }}</span>
                </div>
            </el-menu-item>
            <el-menu-item index="2" @click="goIndex('2')">
                <div class="menu-li-wrapper">
                    <i class="el-icon-document"></i>
                    <span slot="title">{{ l.MININGADMIN }}</span>
                </div>
            </el-menu-item>
            <el-menu-item index="3" @click="goIndex('3')">
                <div class="menu-li-wrapper">
                    <i class="el-icon-setting"></i>
                    <span slot="title">{{ l.ASSETSADMIN }}</span>
                </div>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");

export default {
    name: "poc-menu",
    data() {
        return {
            l: {
                ASSETSADMIN: "",
                MININGADMIN: "",
                MININGSUMMARY: ""
            }
        };
    },
    props: ["index"],
    created() {
        this.toggleLanguage = this.toggleLanguage.bind(this);

        this.toggleLanguage();
    },
    beforeDestroy() {
        console.log("Destroy menu...");

        ipcRenderer.removeListener("lang-changed", this.toggleLanguage);
    },
    methods: {
        toggleLanguage() {
            //获取语言文件
            let lang = ipcRenderer.sendSync("get-lang");
            for (let i in this.l) {
                this.l[i] = lang[i];
            }
            this.currLang = ipcRenderer.sendSync("get-lang-name");
            this.$forceUpdate();
        },
        handleOpen(key, keyPath) {
            console.log(key, keyPath);
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        },
        goIndex(index) {
            this.$emit("menu-changed", index);
        }
    },
    mounted() {
        console.log("Menu focus:" + this.index);
        ipcRenderer.on("lang-changed", (event, lang) => {
            console.log("Lang changed to " + JSON.stringify(lang));
            this.toggleLanguage();
        });
    }
};
</script>

<style lang="less" scoped>
.el-menu {
    border: none;
}
.poc-menu {
    height: 100%;
    padding: 24px 8px;
    box-shadow: 1px 0 25px 0 rgba(0, 0, 0, 0.04);
    .el-menu-item {
        padding: 12px 0 !important;
        height: 64px;
        &:focus,
        &:hover {
            background: #fff !important;
        }
    }
    .logo {
        height: 64px;
        background: url(../assets/images/logo.svg) left center no-repeat;
        background-size: auto 30px;
        line-height: 64px;
        width: 80px;
        margin: 0 auto;
        text-indent: 36px;
        color: #00b000;
        font-weight: bold;
        font-size: 18px;
    }
    .el-menu-item.is-active .menu-li-wrapper,
    .el-menu-item:hover .menu-li-wrapper,
    .el-menu-item:focus .menu-li-wrapper {
        background-color: rgba(0, 176, 0, 0.05);
        color: #00b000;
    }
}
</style>