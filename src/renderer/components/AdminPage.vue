<template>
    <el-container class="menu-wrapper">
        <el-aside class="menu">
            <poc-menu :index="menuIndex" @menu-changed="toggleMenu"></poc-menu>
        </el-aside>
        <el-container class="column-content">
            <poc-header :address="address"></poc-header>
            <el-main class="main">
                <poc-mining v-if="menuIndex == '1'"></poc-mining>
                <poc-miner v-if="menuIndex == '2'"></poc-miner>
                <poc-setting v-if="menuIndex == '3'"></poc-setting>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
const { ipcRenderer } = require("electron");

import Common from "../../Common";
import Web3 from "web3";

import PocMenu from "./Menu";
import RightHeader from "./Header";

import MiningComponent from "./MiningPage";
import MinerComponent from "./MinerPage";
import SettingComponent from "./SettingPage";

export default {
    name: "miner",
    computed: {},
    created() {},
    components: {
        "poc-menu": PocMenu,
        "poc-header": RightHeader,
        "poc-mining": MiningComponent,
        "poc-miner": MinerComponent,
        "poc-setting": SettingComponent
    },
    data() {
        return {
            address: "",
            menuIndex: "1"
        };
    },
    mounted() {
        this.wallet = ipcRenderer.sendSync("get-wallet");
        console.log(this.wallet);
        this.address = "poc" + this.wallet.addr.toLowerCase().replace("0x", "");
    },
    methods: {
        toggleMenu(index) {
        if (index != this.menuIndex) {
          this.menuIndex = index;
        }
      }
    }
};
</script>

<style lang="less" scoped>
.main {
    background: #f8f8f8;
}
</style>