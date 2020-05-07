<template>
    <div class="main-wrapper">
        <div class="label">{{ l.MINERTITLE }}</div>
        <div class="avenue-info">
            <ul class="avenue-ul">
                <!-- 矿机数量 -->
                <li>
                    <div class="icon icon-miners"></div>
                    <p class="text">{{ l.MINERCOUNT }}</p>
                    <p class="focus">{{ tableData.length }}</p>
                </li>
                <!-- 在线矿机 -->
                <li>
                    <div class="icon icon-miners-online"></div>
                    <p class="text">{{ l.ONLINEMINER }}</p>
                    <p class="focus">{{ totalMinerOnline }}</p>
                </li>
                <!-- 矿机总容量 -->
                <li>
                    <div class="icon icon-miners-capacity"></div>
                    <p class="text">{{ l.MINERCAPACITY }}</p>
                    <p class="focus">{{ totalMinerCapacity | toPb }}</p>
                </li>
            </ul>
        </div>
        <div class="label">
            {{ l.MINERDETAIL }}
            <span class="add-miner" @click="addMiner">{{ l.ADDMINER }}</span>
        </div>
        <el-table v-if="tableData.length" :data="tableData" style="width: 100%">
            <!-- 矿机名称 -->
            <el-table-column prop="name" :label="l.MINERNAME" width="200"></el-table-column>
            <!-- 容量 -->
            <el-table-column
                prop="capacity"
                :formatter="(row, column, cell) => _f('toPb')(cell)"
                :label="l.CAPACITY"
                width="200"
            ></el-table-column>
            <!-- 状态 -->
            <el-table-column :label="l.STATUS" width="200">
                <template slot-scope="scope">
                    <p>
                        {{ {
                        unbined: l.NOTBINDED,
                        binded: l.BINDED,
                        plotting: l.PLOTTING.replace(/<%.+%>/g, scope.row.progress / 100 + '%'),
                        minning: l.MINING,
                        waiting: l.READY
                        }[scope.row.status] || l.GETTING }}
                    </p>
                </template>
            </el-table-column>

            <el-table-column :label="l.ACTION">
                <template slot-scope="scope">
                    <!-- 设置 -->
                    <el-button
                        @click.native.prevent="setMiner(scope.$index)"
                        type="text"
                        size="small"
                    >{{ l.SETTING }}</el-button>

                    <el-popover
                        placement="top"
                        width="160"
                        trigger="click"
                        v-model="restartVisible"
                    >
                        <p style="font-size: 12px;margin-bottom: 16px;">{{ l.RESTARTMINERCONFIRM }}</p>
                        <div style="text-align: right; margin: 0">
                            <el-button
                                size="mini"
                                type="text"
                                @click="restartVisible = false"
                            >{{ l.CANCEL }}</el-button>
                            <el-button
                                type="warning"
                                size="mini"
                                @click.native.prevent="restartMiner(scope.$index)"
                            >{{ l.CONFIRM }}</el-button>
                        </div>
                        <!-- 重启 -->
                        <el-button
                            type="text"
                            size="small"
                            slot="reference"
                            @click.native.prevent="restartMiner(scope.$index)"
                        >{{ l.RESTART }}</el-button>
                    </el-popover>
                    <!-- 原版解绑（打包后才生效） -->
                    <!-- <el-popover placement="top" width="160" trigger="click" v-model="unbindVisible">
                        <p style="font-size: 12px;margin-bottom: 16px;">{{ l.UNBINEMINERCONFIRM }}</p>
                        <div style="text-align: right; margin: 0">
                            <el-button
                                size="mini"
                                type="text"
                                @click="unbindVisible = false"
                            >{{ l.CANCEL }}</el-button>
                            <el-button
                                type="danger"
                                size="mini"
                                @click.native.prevent="unbindMiner(scope.$index)"
                            >{{ l.CONFIRM }}</el-button>
                        </div>
                        <el-button slot="reference" type="text" size="small" @click.native.prevent="unbindMiner(scope.$index)">{{ l.UNBIND }}</el-button>
                    </el-popover>-->
                    <!-- 更改后的解绑 -->
                    <el-button
                        slot="reference"
                        type="text"
                        size="small"
                        @click.native.prevent="unbindMiner(scope.$index)"
                    >{{ l.UNBIND }}</el-button>
                    <!-- 删除 -->
                    <el-button
                        slot="reference"
                        type="text"
                        size="small"
                        @click.native.prevent="delMiner(scope.$index)"
                    >{{l.DELETE}}</el-button>
                </template>
            </el-table-column>
        </el-table>
        <p class="no-data" v-else>{{ l.NOMINER }}</p>
        <!-- 搜索矿机（并绑定） -->
        <div class="poc-dialog add-dialog" v-show="ifShowAddDialog">
            <div class="dialog-wrapper">
                <div class="title">
                    {{ l.ADDMINER }}
                    <div class="close" @click="closeAddDialog"></div>
                </div>

                <div class="input-component">
                    <div class="input-wrapper">
                        <input type="text" v-model="macAddr" :placeholder="l.MINERMACPLACEHOLDER" />
                    </div>
                    <p class="error-text" v-if="addMacError">{{ addMacError }}</p>
                </div>

                <div
                    class="confirm-button"
                    @click="searchMiner"
                >{{ [l.SEARCHMINER, l.SEARCHING, l.RESEARCH][searchProcess] }}</div>

                <div class="miner-result" v-if="searchProcess == 2">
                    <div class="input-component">
                        <div class="item-label">{{ l.SEACHRESULT }}</div>
                        <div class="miner-list" v-if="minerList.length > 0">
                            <div class="miner-item" v-for="(miner,index) in minerList" :key="index">
                                <div class="icon"></div>
                                <div class="info">
                                    <!-- 矿机硬盘地址 -->
                                    <p class="miner-name">{{ miner.device.serialNumber }}</p>
                                    <div class="detail">
                                        <!-- 硬盘数量 -->
                                        <p class="disk">
                                            {{ l.DISKS }}:
                                            <span>{{ miner.device.diskInfo.count }}</span>
                                        </p>
                                        <!-- 硬盘容量 -->
                                        <p class="capacity">
                                            {{ l.CAPACITY }}:
                                            <span>{{ miner.device.diskInfo.used | toTb }}/{{ miner.device.diskInfo.all | toTb }} TB</span>
                                        </p>
                                    </div>
                                </div>
                                <!-- 绑定按钮 -->
                                <div
                                    class="button"
                                    v-if="miner.device.bindUser == '****' || miner.isMe"
                                    @click="bindMiner(miner)"
                                >{{ miner.isMe ? l.ADD : l.BIND }}</div>
                                <!-- 绑定用户 -->
                                <div class="binded" v-else>{{ miner.device.bindUser }}</div>
                            </div>
                        </div>

                        <div class="no-miner" v-else>{{ l.NOLOCALMINER }}</div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 设置菜单 -->
        <div class="poc-dialog miner-dialog" v-show="ifShowMiningSetting">
            <div class="dialog-wrapper">
                <div class="title">
                    {{ l.MINERSETTINGS }}
                    <div class="close" @click="closeMinerDialog"></div>
                </div>

                <div class="input-component">
                    <div class="item-label">{{ l.MINERNAME }}</div>
                    <div class="input-wrapper">
                        <input
                            type="text"
                            v-model="currentMiner.name"
                            :placeholder="l.PLEASEINPUTNAME"
                        />
                    </div>
                    <p class="error-text" v-if="minerNameError">{{ minerNameError }}</p>
                </div>

                <div class="input-component">
                    <div class="item-label">{{ l.MACADDRESS }}</div>
                    <div class="input-wrapper">
                        <input
                            type="text"
                            disabled
                            :value="currentMiner.mac"
                            :placeholder="l.MINERMACPLACEHOLDER"
                        />
                    </div>
                    <p class="error-text" v-if="minerMacError">{{ minerMacError }}</p>
                </div>

                <div class="input-component">
                    <div class="disk-select">
                        <div class="item-label">
                            {{ l.DISKSETTING }}
                            <div class="select-all" @click="selectAll" v-show="!ifSelectAll">
                                <div class="text">{{ l.SELECTALL }}</div>
                                <div class="icon"></div>
                            </div>

                            <div class="select-all" @click="unselectAll" v-show="ifSelectAll">
                                <div class="text">{{ l.SELECTALL }}</div>
                                <div class="icon select"></div>
                            </div>
                        </div>

                        <div class="disk-list">
                            <div
                                class="disk"
                                v-for="(disk,index) in currentMiner.disks"
                                @click="selectDisk(index)"
                                :key="index"
                            >
                                <div class="info">
                                    <div class="name">
                                        <p class="disk-name">{{ disk.name }}</p>
                                        <p
                                            class="capacity"
                                        >{{(disk.disksize-disk.freesize) | toGb(0)}}/{{disk.disksize | toGb(0)}} GB</p>
                                    </div>
                                    <div class="progress">
                                        <el-progress
                                            :percentage="(disk.disksize-disk.freesize)/disk.disksize*100"
                                            color="#00b000"
                                            :stroke-width="strokeWidth"
                                            :show-text="ifShowText"
                                        ></el-progress>
                                    </div>
                                </div>
                                <div class="selector" :class="{'active': !!disk.selected}"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    class="confirm-button"
                    @click="updateMinerSetting"
                    style="margin-top: 40px;"
                >{{ l.SAVE }}</div>
            </div>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");
import Common from "../../Common";
import Web3 from "web3";
import * as filters from "../filter";
import common from "./common";
import md5 from "md5";
import * as Web3PocMinedev from "web4minedev";

export default {
    name: "miner",
    computed: {},
    created() {},

    data() {
        return {
            address: "",
            tableData: [], //矿机列表数据
            totalMiner: 0,
            totalMinerOnline: 0,
            totalMinerCapacity: 0,
            ifShowAddDialog: false,
            ifShowMiningSetting: false,
            ifSelectAll: false,
            strokeWidth: 12,
            ifShowText: false,
            minerMacError: "",
            minerNameError: "",
            macAddr: "",
            addMacError: "",
            web3: null,
            minerList: [], //搜索到的矿机列表
            searchProcess: 0, //搜索过程 0未搜索 1开始搜索 2搜索出结果了
            testp: 20,
            unbindVisible: false,
            restartVisible: false,
            currentMiner: {},
            l: {}
        };
    },
    created() {
        this.toggleLanguage = this.toggleLanguage.bind(this);
        this.toggleLanguage();
    },
    beforeDestroy() {
        console.log("Destroy minerpage..."); // 销毁当前页面信息
        ipcRenderer.removeListener("lang-changed", this.toggleLanguage);
    },
    mounted() {
        this.wallet = ipcRenderer.sendSync("get-wallet");
        console.log(this.wallet);
        this.address = this.wallet.addr.toLowerCase();
        if (!this.address.startsWith("0x")) {
            this.address = "0x" + this.address;
        }
        this.initWeb3();
        this.tableData = ipcRenderer.sendSync("get-global", "minerList") || [];
        this.setMyMiners();

        ipcRenderer.on("lang-changed", (event, lang) => {
            console.log("Lang changed to " + JSON.stringify(lang));
            this.toggleLanguage();
        });
    },
    methods: {
        toggleLanguage() {
            //获取语言文件
            let lang = ipcRenderer.sendSync("get-lang");
            this.l = lang;
        },
        async setMyMiners() {
            if (!this.tableData.length) {
                this.totalMinerOnline = 0;
                this.totalMinerCapacity = 0;
                return;
            }
            //获取在线矿机列表
            await this.searchMiner(true);
            //过滤已添加的矿机
            let minerList = [];
            for (let i = 0; i < this.tableData.length; i++) {
                let miner = this.minerList.find(
                    item => this.tableData[i].mac == item.device.serialNumber
                );
                if (miner) {
                    this.tableData[i].ip = miner.URLBase;
                    minerList.push(miner);
                }
            }
            let amount = 0;
            for (let i = 0; i < minerList.length; i++) {
                amount += parseInt(minerList[i].device.diskInfo.all);
            }

            this.totalMinerCapacity = amount;
            //查看是否在线....
            this.totalMinerOnline = minerList.length;
            this.setMyMinersInfo(this.tableData);
        },
        initWeb3() {
            this.web3 = new Web3();
            let provider = new this.web3.providers.HttpProvider(
                Common.web3Provider
            );
            this.web3.setProvider(provider);
        },
        async getMinerStatus(ip) {
            let mineWeb3 = new Web3PocMinedev(ip);
            let result = await mineWeb3.Status();
            // console.log("Miner Status:", result);
            return result;
        },
        selectAll() {
            this.ifSelectAll = true;
            this.currentMiner.disks.forEach(item => {
                item.selected = true;
            });
            this.$forceUpdate();
        },
        unselectAll() {
            this.ifSelectAll = false;
            this.currentMiner.disks.forEach(item => {
                item.selected = false;
            });
            this.$forceUpdate();
        },
        selectDisk(index) {
            this.currentMiner.disks[index].selected = !this.currentMiner.disks[
                index
            ].selected;
            this.ifSelectAll = !this.currentMiner.disks.find(
                item => !item.selected
            );
            this.$forceUpdate();
        },
        async updateMinerSetting() {
            let miner = this.currentMiner;
            this.minerNameError = false;
            if (!miner.name) {
                this.minerNameError = l.EMPTYNAMEERROR;
                return;
            }
            let ip = miner.ip;
            let mineWeb3 = new Web3PocMinedev(ip);
            let result = await mineWeb3.Setting("HOSTNAME", miner.name);
            if (result.err == "ok") {
                let data = miner.disks.map(item => {
                    return {
                        id: item.id,
                        path: item.path,
                        action: item.selected ? "SELECT" : "UNSELECT"
                    };
                });
                //开始设置矿机盘
                result = await mineWeb3.Setting(
                    "PLOTDIRS",
                    JSON.stringify(data)
                );
                if (result.err == "ok") {
                    this.$message({
                        message: this.l.SUCCESSSETMINER,
                        type: "success"
                    });
                } else {
                    this.$message({
                        message: this.l.FAILEDSETMINER,
                        type: "failure"
                    });
                }
                this.ifShowMiningSetting = false;
            } else {
                this.ifShowMiningSetting = false;
                this.$message({
                    message: this.l.FAILEDSETMINER,
                    type: "failure"
                });
            }
        },
        async setMiner(index) {
            this.currentMiner = this.tableData[index];
            this.minerNameError = "";
            this.ifSelectAll = false;
            this.ifShowMiningSetting = true;
            let ip = this.tableData[index].ip;
            let mineWeb3 = new Web3PocMinedev(ip);
            let result = await mineWeb3.Getting("PLOTDIRS");
            console.log("Miner current settings: ", result);
            if (result.err == "ok") {
                result.value.forEach(item => {
                    item.selected = !(item.status == 0 || item.status == 3);
                });
                this.ifSelectAll = !result.value.find(item => !item.selected);
                this.tableData[index].disks = result.value;
                this.$forceUpdate();
            }
        },
        async restartMiner(index) {
            this.restartVisible = false;
            let ip = this.tableData[index].ip;
            let mineWeb3 = new Web3PocMinedev(ip);
            let result = await mineWeb3.Restart();
            console.log("Miner restart result： ", result);
            if (result.err == "ok") {
                this.$message({
                    message: this.l.MINERRESTARTED,
                    type: "success"
                });
            } else {
                this.$message({
                    message: this.l.MINERRESTARTEDFAILED,
                    type: "failure"
                });
            }
        },
        // 解绑矿机
        async unbindMiner(index) {
            this.$confirm(this.l.UNBINEMINERCONFIRM, "", {
                confirmButtonText: this.l.CONFIRM,
                cancelButtonText: this.l.CANCEL,
                type: "warning"
            })
                .then(async () => {
                    this.unbindVisible = false;
                    let ip = this.tableData[index].ip;
                    console.log(ip);
                    let mineWeb3 = new Web3PocMinedev(ip);
                    let result = await mineWeb3.Unbind(this.address);
                    console.log("Unbind status:", result);
                    console.log(`当前add == ${this.address}`);
                    if (result.err == "ok") {
                        let data = ipcRenderer.sendSync("delete-miner", index);
                        console.log("get-miner", data);
                        //删除本地矿机
                        this.tableData.splice(index, 1);
                        this.$message({
                            message: this.l.MINERUNBINDED,
                            type: "success"
                        });
                        //需要更新矿机数量
                        this.setMyMiners();
                    } else {
                        this.$message({
                            message: this.l.MINERUNBINDEDFAILED,
                            type: "failure"
                        });
                    }
                })
                .catch(() => {
                    console.log("已取消");
                });
        },

        async delMiner(index) {
            this.$confirm(this.l.DELETEMINERCONFIRM, "", {
                confirmButtonText: this.l.CONFIRM,
                cancelButtonText: this.l.CANCEL,
                type: "warning"
            })
                .then(async () => {
                    this.unbindVisible = false;
                    let data = ipcRenderer.sendSync("delete-miner", index);
                    console.log("get-miner", data);
                    //删除本地矿机
                    this.tableData.splice(index, 1);
                    this.$message({
                        message: this.l.MINERDELETEFAILED,
                        type: "success"
                    });
                    //需要更新矿机数量
                    this.setMyMiners();
                })
                .catch(() => {
                    console.log("已取消");
                });
        },

        // 添加矿机
        addMiner() {
            console.log("Add miner..");
            this.addMacError = "";
            this.macAddr = "";
            this.minerList = [];
            this.searchProcess = 0;
            this.ifShowAddDialog = true;
        },

        closeAddDialog() {
            this.ifShowAddDialog = false;
        },

        closeMinerDialog() {
            this.ifShowMiningSetting = false;
        },

        setMyMinersInfo(tableData) {
            tableData.forEach(item => {
                item.status = this.l.GETTINGSTATUS;
                this.getMinerStatus(item.ip)
                    .then(res => {
                        console.log("在线矿机状态:", res.status);
                        item.status = res.status;
                        item.name = res.hostname || item.name;
                        item.plotsize = res.plotsize;
                        item.progress = res.progress;
                        this.$forceUpdate();
                    })
                    .catch(e => {
                        item.status = "不在线";
                    });
            });
        },
        bindMinerToUser(miner) {
            console.log("test add miner info...");
            ipcRenderer.sendSync("add-miner", miner);
            console.log(miner);
            this.ifShowAddDialog = false;
            // this.setMyMinersInfo(this.tableData);
            this.totalMiner++;
            this.totalMinerOnline++;
            this.totalMinerCapacity += miner.device.diskInfo.all;
            console.log("Add capacity:", miner.device.diskInfo.all);
            this.tableData = ipcRenderer.sendSync("get-global", "minerList");
            //获取状态
            this.setMyMinersInfo(this.tableData);
        },
        async bindMiner(miner) {
            //如果已经添加，则报错
            let tableData = ipcRenderer.sendSync("get-global", "minerList");
            if (tableData.find(item => item.mac == miner.device.serialNumber)) {
                this.$message({
                    message: this.l.MINERADDEDALREADY,
                    type: "warning"
                });
                return;
            }

            if (miner.isMe) {
                //直接添加到缓存
                this.bindMinerToUser(miner);
                this.$message({
                    message: this.l.MINERADDED,
                    type: "success"
                });
            } else {
                //执行绑定
                let ip = miner.URLBase;
                console.log(ip);
                let mineWeb3 = new Web3PocMinedev(ip);
                let result = await mineWeb3.Bind(this.address);
                if (result.err == "ok") {
                    this.bindMinerToUser(miner);
                    this.$message({
                        message: this.l.MINERADDED,
                        type: "success"
                    });
                } else {
                    this.$message({
                        message: this.l.MINERADDEDERROR,
                        type: "failure"
                    });
                }
            }
        },
        // 搜索矿机
        async searchMiner(allowNullMac = false) {
            console.log("MinePage Start to search......");
            this.addMacError = "";
            // if (this.macAddr == "") {
            //     this.addMacError = this.l.EMPTYMACERROR;
            //     return;
            // }
            if (this.searchProcess == 1) {
                console.log("Searching......");
                return;
            }
            this.searchProcess = 1;
            console.log("Miner Mac:" + this.macAddr);
            let minerList = await common.discovery(this.macAddr);
            let address = this.address.startsWith("0x")
                ? this.address
                : "0x" + this.address;
            let hash = "0x" + md5(address);
            //检查userHash
            minerList.forEach((item, index) => {
                if (!item) {
                    minerList.splice(index, 1);
                    return;
                }
                if (item.device.bindUser != "****") {
                    item.isMe = item.device.bindUserHash == hash;
                } else {
                    item.isMe = false;
                }
            });
            this.minerList = minerList;
            console.log("搜索后返回的结果👇");
            console.log(JSON.stringify(this.minerList));
            this.searchProcess = 2;
        }
    }
};
</script>

<style lang="less" scoped>
.el-table {
    margin-top: 6px;
}
.el-table:before {
    height: 0;
}
.main-wrapper {
    margin-top: -10px;
}

.label {
    font-size: 18px;
    color: #344563;
    font-weight: bold;
    padding-top: 10px;
    line-height: 44px;
    position: relative;
    height: 54px;

    .add-miner {
        position: absolute;
        cursor: pointer;
        right: 0;
        box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.1);
        border-radius: 6px;
        color: #fff;
        background: #00b000;
        font-size: 14px;
        color: #feffff;
        font-weight: bolder;
        height: 34px;
        line-height: 34px;
        top: 15px;
        padding: 0 20px;
    }
}

.add-dialog {
    .title {
        margin-bottom: 36px;
    }
    .confirm-button {
        margin: 30px;
    }

    .miner-result {
        background: #fafafb;
        padding-bottom: 30px;

        .item-label {
            font-size: 16px;
            padding-top: 10px;
        }

        .miner-item {
            background: #fff;
            border-radius: 5px;
            display: flex;
            height: 90px;
            align-items: center;
            padding: 0 16px;

            .icon {
                width: 48px;
                height: 48px;
                background: url(../assets/images/miner-search.svg) center center
                    no-repeat;
                background-size: contain;
            }

            .info {
                flex: 1;
                margin-left: 14px;
                .miner-name {
                    font-size: 18px;
                    color: #4a4a4a;
                    font-weight: bold;
                    line-height: 30px;
                    margin-bottom: 4px;
                }
                .detail {
                    font-size: 12px;
                    color: #9b9b9b;
                    display: flex;
                    line-height: 18px;
                    .disk {
                        margin-right: 20px;
                    }
                    span {
                        color: #000;
                    }
                }
            }

            .binded {
                color: #999;
                font-size: 12px;
            }

            .button {
                background: #00b000;
                border-radius: 3px;
                color: #fff;
                line-height: 28px;
                padding: 0 16px;
                font-size: 12px;
                &:active {
                    background: #00a000;
                }
            }
        }

        .no-miner {
            font-size: 12px;
        }
    }
}

.miner-dialog {
    .item-label {
        position: relative;
        .icon {
            width: 18px;
            height: 44px;
            margin-left: 6px;
            background: url(../assets/images/unselect.svg) center center
                no-repeat;
            background-size: contain;

            &.select {
                background-image: url(../assets/images/select.svg);
            }
        }

        .select-all {
            position: absolute;
            right: 0;
            top: 0;
            color: #4a4a4a;
            font-weight: normal;
            font-size: 12px;
            line-height: 44px;
            display: flex;
            flex-direction: row;
            cursor: pointer;
        }
    }

    .disk-list {
        border-top: 1px solid #e9edf0;
        .disk {
            margin-bottom: 14px;
            display: flex;
            .info {
                line-height: 38px;
                flex: 1;
                .name {
                    display: flex;
                    font-size: 12px;
                    color: #4a4a4a;
                    .disk-name {
                        flex: 1;
                    }
                }
            }
            .selector {
                width: 28px;
                background: url(../assets/images/unselect.svg) right center
                    no-repeat;
                background-size: 18px auto;
                &.active {
                    background-image: url(../assets/images/select.svg);
                }
            }
        }
    }
}

.avenue-info {
    margin-bottom: -10px;
}
// 强制修改ele样式
.el-button + .el-button {
    margin: 0 !important;
}

.avenue-ul {
    overflow: hidden;
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
            background: url(../assets/images/miners.svg) center center no-repeat;
            background-size: contain;

            &.icon-miners {
                background-image: url(../assets/images/miners.svg);
            }
            &.icon-miners-online {
                background-image: url(../assets/images/miners-online.svg);
            }
            &.icon-miners-capacity {
                background-image: url(../assets/images/miners-capacity.svg);
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