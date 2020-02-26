<template>
    <div class="main-wrapper">
        <div class="label">{{ l.MININGAVENUE }}</div>
        <div class="avenue-info">
            <ul class="avenue-ul clear">
                <li>
                    <div class="icon icon-avenue"></div>
                    <p class="text">{{ l.TOTALAVENUE }}({{ unit }})</p>
                    <p class="focus">{{ totalRewards | toPoc | formatNumber }}</p>
                </li>
                <li>
                    <div class="icon icon-avenue-day"></div>
                    <p class="text">{{ l.DAYAVENUE }}({{ unit }})</p>
                    <p class="focus">{{ lastXRewards | toPoc | formatNumber }}</p>
                </li>
                <li>
                    <div class="icon icon-avenue-other"></div>
                    <p class="text">{{ l.OTHERAVENUE }}</p>
                    <p class="focus">{{ otherRewards | toPoc | formatNumber }}</p>
                </li>
                <li>
                    <div class="icon icon-pledge"></div>
                    <p class="text">{{ l.PLEDGECOUNT }}({{ unit }})</p>
                    <p class="focus">{{ pledgeCount | toPoc | formatNumber }}</p>
                </li>
                <li class="relative">
                    <div class="helper-wrapper">
                        <div class="helper-icon"></div>

                        <div class="content">
                            <p class="title">{{ l.WTFCOEFFIENT }}</p>
                            <p class="desc">{{ l.WTFCOEFFIENTDETAIL }}</p>
                        </div>
                    </div>

                    <div class="icon icon-pledge-times"></div>
                    <p class="text">{{ l.PLEDGETIMES }}({{ unit }}/TB)</p>
                    <p class="focus">{{ pledgeTimes | toFixed(6) }}</p>
                </li>
                <li>
                    <div class="icon icon-pledge-contract"></div>
                    <p class="text">{{ l.PLEDGECONTRACT }}</p>
                    <a
                        :href="pledgeContractAddr | getPocScanLink('address')"
                        class="focus green"
                    >{{ pledgeContractAddr | toAddr }}</a>
                </li>
            </ul>
        </div>
        <div class="label date-wrapper">
            {{ l.AVENUERECORD }}
            <div class="block date-picker">
                <el-date-picker
                    v-model="selectedDate"
                    type="daterange"
                    align="right"
                    unlink-panels
                    :range-separator="l.TO"
                    :start-placeholder="l.STARTDATE"
                    :end-placeholder="l.ENDDATE"
                    @change="confirmSelectDate"
                    :picker-options="pickerOptions"
                ></el-date-picker>
            </div>
        </div>
        <el-table v-if="tableData.length" style="width: 100%" :data="tableData" border>
            <el-table-column prop="date" :label="l.DATE"></el-table-column>
            <el-table-column prop="count" :label="l.BLOCKCOUNT"></el-table-column>
            <el-table-column prop="reward" :label="l.MININGREWARD"></el-table-column>
            <el-table-column prop="fees" :label="l.OTHERAVENUE"></el-table-column>
        </el-table>
        <p class="no-data" v-else>{{ l.NOAVENUE }}</p>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");

import Common from "../../Common";
import Web3 from "web3";
const axios = require("axios");
import * as filters from "../filter";
import md5 from "md5";
import common from "./common";
import * as Web3PocMinedev from "web4minedev";

export default {
    name: "setting",
    computed: {},
    data() {
        return {
            address: "",
            unit: Common.projectName.toUpperCase(),
            tableData: [],
            pledgeCount: 0,
            pledgeContract: null,
            pledgeContractAddr: Common.pledgeContract,
            pledgeContractProvider: Common.web3Provider,
            web3: null,
            totalRewards: 0,
            lastXRewards: 0,
            otherRewards: 0,
            pledgeTimes: "",
            minerList: [], //搜索到的矿机
            myMinerList: [], //缓存数据
            searchProcess: 0,
            l: {},
            pickerOptions: {},
            selectedDate: "",
            defaultDate: []
        };
    },
    created() {
        this.toggleLanguage = this.toggleLanguage.bind(this);

        this.toggleLanguage();
        this.pledgeTimes = this.l.GETTING;
    },
    beforeDestroy() {
        console.log("Destroy settingpage...");

        ipcRenderer.removeListener("lang-changed", this.toggleLanguage);
    },
    mounted() {
        this.wallet = ipcRenderer.sendSync("get-wallet");
        this.address = this.wallet.addr.toLowerCase();

        this.initPledgeContract();
        this.getPledgeByAddr(this.address);

        let timeStamp = new Date(new Date().setHours(0, 0, 0, 0));
        let startDate, endDate;
        let start_time = filters.timeFormatter(timeStamp - 86400 * 9000),
            end_time = filters.timeFormatter(timeStamp + 86400 * 1000);
        startDate = new Date(timeStamp - 86400 * 9000);
        endDate = new Date(timeStamp + 86400 * 1000);
        // this.defaultDate = [startDate, endDate];
        //获取钱包收益记录
        this.getWalletAvenue(start_time, end_time);

        this.setMyMiners();

        ipcRenderer.on("lang-changed", (event, lang) => {
            console.log("Lang changed to " + JSON.stringify(lang));
            this.toggleLanguage();
        });
    },
    methods: {
        confirmSelectDate(date) {
            console.log(date);
            let start_date = filters.timeFormatter(+new Date(date[0])),
                end_date = filters.timeFormatter(+new Date(date[1]));
            this.getWalletAvenue(start_date, end_date);
        },
        toggleLanguage() {
            //获取语言文件
            let lang = ipcRenderer.sendSync("get-lang");
            this.l = lang;
            this.currLang = ipcRenderer.sendSync("get-lang-name");
            this.pickerOptions = {
                shortcuts: [
                    {
                        text: this.l.LASTWEEK,
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 7
                            );
                            picker.$emit("pick", [start, end]);
                        }
                    },
                    {
                        text: this.l.LASTMONTH,
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 30
                            );
                            picker.$emit("pick", [start, end]);
                        }
                    },
                    {
                        text: this.l.LASTTHREEMONTH,
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(
                                start.getTime() - 3600 * 1000 * 24 * 90
                            );
                            picker.$emit("pick", [start, end]);
                        }
                    }
                ]
            };
            this.$forceUpdate();
        },
        async searchMiner(allowNullMac = false) {
            console.log("SettingPage Start to search......");
            if (this.searchProcess == 1) {
                console.log("Searching......");
                return;
            }
            this.searchProcess = 1;
            let minerList = await common.discovery(this.macAddr);
            let address = this.address.startsWith("0x")
                ? this.address
                : "0x" + this.address;
            let hash = "0x" + md5(address);
            console.log(minerList);
            //检查userHash
            minerList.forEach((item, index) => {
                console.log(item);
                if (!item) {
                    minerList.splice(index, 1);
                    return;
                }
                if (item.device.bindUser) {
                    item.isMe = item.device.bindUserHash == hash;
                } else {
                    item.isMe = false;
                }
            });
            this.minerList = minerList;
            this.searchProcess = 2;
        },
        async setMyMiners() {
            let tableData =
                ipcRenderer.sendSync("get-global", "minerList") || [];
            //获取在线矿机列表
            await this.searchMiner(true);
            //过滤已添加的矿机
            let minerList = [];
            for (let i = 0; i < tableData.length; i++) {
                let miner = this.minerList.find(
                    item => tableData[i].mac == item.device.serialNumber
                );
                if (miner) {
                    tableData[i].ip = miner.URLBase;
                    minerList.push(miner);
                }
            }
            let amount = 0;
            for (let i = 0; i < minerList.length; i++) {
                amount += parseInt(minerList[i].device.diskInfo.all);
            }
            this.setMyMinersInfo(tableData);
        },
        async setMyMinersInfo(tableData) {
            let plotsize = 0;
            console.log("Miner exists? " + !!tableData.length);
            for (let i = 0; i < tableData.length; i++) {
                let result = await this.getMinerStatus(tableData[i].ip);
                plotsize += result.plotsize;
            }
            if (plotsize) {
                //根据plotsize计算质押系数
                let x =
                    (this.pledgeCount / Math.pow(10, 18) / plotsize) *
                    1024 *
                    1024 *
                    1024 *
                    1024;
                this.pledgeTimes = x;
            } else {
                this.pledgeTimes = 0;
            }
            this.$forceUpdate();
        },
        async getMinerStatus(ip) {
            let mineWeb3 = new Web3PocMinedev(ip);
            let result = await mineWeb3.Status();
            return result;
        },
        initPledgeContract() {
            this.web3 = new Web3();
            let provider = new this.web3.providers.HttpProvider(
                Common.web3Provider
            );
            this.web3.setProvider(provider);
            this.pledgeContract = new this.web3.eth.Contract(
                Common.pledgeAbi,
                this.pledgeContractAddr
            );
        },
        async getPledgeByAddr(addr) {
            //获取挖矿收益
            let result = await this.pledgeContract.methods
                .mortgageOf(addr)
                .call({ from: this.address });
            console.log("mortage:", result);
            this.pledgeCount = result;
        },
        // 获取钱包收益记录
        getWalletAvenue(start_time, end_time) {
            console.log(start_time, end_time);
            let addr = this.address.startsWith("0x")
                ? this.address
                : "0x" + this.address;

            // let timeStamp = new Date(new Date().setHours(0, 0, 0, 0));
            // if (!start_time) {
            //     start_time = filters.timeFormatter(timeStamp - 86400 * 9000);
            // }
            // if (!end_time) {
            //     end_time = filters.timeFormatter(timeStamp + 86400 * 1000);
            // }

            axios
                .post(
                    Common.remoteUrl + Common.URL["getAvenueByAddrCollected"],
                    {
                        addr: addr,
                        start_date: start_time,
                        end_date: end_time,
                        offset_time: new Date().getTimezoneOffset() * 60
                    }
                )
                .then(res => {
                    let data = res.data;
                    if (data.err_no == 0) {
                        this.totalRewards = data.total_reward;
                        this.lastXRewards = data.last_x_reward;
                        this.otherRewards = data.last_x_fees;
                        let avenue = data.day_info || [];
                        avenue.forEach(item => {
                            item.reward = filters.toPoc(item.reward);
                            item.fees = filters.toPoc(item.fees);
                        });
                        this.tableData = avenue.reverse();
                        console.log(this.tableData.length);
                    }
                });
        }
    }
};
</script>

<style lang="less" scoped>
.el-table:before {
    height: 0;
}
.main-wrapper {
    margin-top: -10px;
}

.date-wrapper {
    position: relative;
    margin-bottom: 6px;

    .date-picker {
        position: absolute;
        top: 10px;
        right: 0;
    }
}

.label {
    font-size: 18px;
    color: #344563;
    font-weight: bold;
    padding-top: 10px;
    line-height: 44px;
}

.helper-wrapper {
    position: absolute;
    left: 206px;
    top: 11px;
    padding: 10px;

    .title {
        font-size: 12px;
        line-height: 16px;
        color: #344563;
        font-weight: bold;
        margin-bottom: 4px;
    }

    .desc {
        font-size: 11px;
        line-height: 16px;
        color: rgba(52, 67, 99, 0.8);
    }

    .helper-icon {
        width: 18px;
        height: 18px;
        padding: 0;
        display: block;
        // background: url(../assets/images/power.svg) center center no-repeat;
        background: url(../assets/images/help.svg) center center no-repeat;
        background-size: contain;
    }

    .content {
        position: absolute;
        display: none;
        top: 38px;
        left: -6px;
        background: #ffffff;
        box-shadow: 1px 0 25px 0 rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        width: 240px;
        padding: 10px;
    }

    &:hover {
        .content {
            display: block;
        }
    }
}

.avenue-info {
    margin-bottom: -10px;
}

.avenue-ul {
    margin-right: -20px;
    li {
        float: left;
        width: 250px;
        height: 120px;
        margin-right: 20px;
        margin-bottom: 20px;
        box-sizing: border-box;
        padding: 14px 20px;
        box-shadow: 1px 0 25px 0 rgba(0, 0, 0, 0.04);
        border-radius: 5px;
        background: #fff;

        .icon {
            width: 32px;
            height: 32px;
            background: url(../assets/images/power.svg) center center no-repeat;
            background-size: contain;

            &.icon-avenue {
                background-image: url(../assets/images/avenue.svg);
            }
            &.icon-avenue-day {
                background-image: url(../assets/images/avenue-day.svg);
            }
            &.icon-avenue-other {
                background-image: url(../assets/images/avenue-other.svg);
            }
            &.icon-pledge {
                background-image: url(../assets/images/pledge.svg);
            }
            &.icon-pledge-times {
                background-image: url(../assets/images/pledge-times.svg);
            }
            &.icon-pledge-contract {
                background-image: url(../assets/images/pledge-contract.svg);
            }
        }
        .text {
            font-size: 12px;
            color: #9b9b9b;
            line-height: 18px;
            margin-top: 10px;
        }
        .focus {
            font-size: 24px;
            color: #344563;
            font-weight: bold;
            line-height: 32px;

            &.green {
                color: #00b000;
                font-size: 16px;
            }
        }
    }
}
</style>