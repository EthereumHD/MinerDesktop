<template>
    <div class="main-wrapper">
        <div class="tabs">
            <p
                class="tab label"
                :class="{focus: type == 'summary'}"
                @click="toggleSummary(true)"
            >{{ l.MININGSUMMARY }}</p>
            <p
                class="tab label"
                :class="{focus: type != 'summary'}"
                @click="toggleSummary(false)"
            >{{ l.MINERMONITOR }}</p>
        </div>
        <div class="tab-summary-content" v-if="type == 'summary'">
            <div class="mining-info">
                <ul class="mining-ul">
                    <li>
                        <div class="icon icon-power"></div>
                        <p class="text">{{ l.TOTALMINERCAPACITY }}</p>
                        <p class="focus">{{ miningInfo.capability | toPb }}</p>
                    </li>
                    <li>
                        <div class="icon icon-reward"></div>
                        <p class="text">{{ l.AVERAGEREWARD }}</p>
                        <p
                            class="focus"
                        >{{ miningInfo.pb_day_reward | toPoc | formatNumber }} {{ unit }}</p>
                    </li>
                    <li>
                        <div class="icon icon-total"></div>
                        <p class="text">{{ l.ALLREWARD }}</p>
                        <p
                            class="focus"
                        >{{ miningInfo.total_rewarded | toPoc | formatNumber }} {{ unit }}</p>
                    </li>
                    <li>
                        <div class="icon icon-boom"></div>
                        <p class="text">{{ l.DAYMINED }}</p>
                        <p class="focus">{{ miningInfo.block_count_last24h }}</p>
                    </li>
                    <li>
                        <div class="icon icon-difficulty"></div>
                        <p class="text">{{ l.DIFFICULTY }}</p>
                        <p class="focus">{{ miningInfo.difficulty | toFixed(0) | formatNumber }}</p>
                    </li>
                </ul>
            </div>

            <div class="recent-blocks">
                <div class="label">{{ l.RECENTBLOCK }}</div>
                <el-table v-if="tableData.length" :data="tableData" border style="width: 100%">
                    <el-table-column prop="block_number" :label="l.BLOCKHEIGHT" width="120"></el-table-column>
                    <el-table-column :label="l.TIME" width="160">
                        <template slot-scope="scope">
                            <p>{{ scope.row.timestamp * 1000 | timeFormatter }}</p>
                        </template>
                    </el-table-column>
                    <el-table-column prop="txn" :label="l.TRANSACTION" width="120"></el-table-column>
                    <el-table-column prop="times" :label="l.CONFIRMTIMES" width="120"></el-table-column>
                    <el-table-column prop="block_reward" :label="l.MININGREWARD" width="140"></el-table-column>
                    <el-table-column :label="l.HASH">
                        <template slot-scope="scope">
                            <a
                                class="focus"
                                :title="l.CLICKOPEN"
                                :href="scope.row.hash | getPocScanLink('hash')"
                            >{{ (scope.row.hash || '').replace('0x', 'poc') }}</a>
                        </template>
                    </el-table-column>
                </el-table>
                <p class="no-data" v-else>{{ l.NOMININGREWARD }}</p>
            </div>
        </div>
        <div class="tab-monitor-content" v-if="type == 'monitor'">
            <div class="wrapper">
                <div class="data-monitor">
                    <div class="item" v-for="block in blockList" :key="block.number">
                        <p>{{ block.timestamp }}: 🔨 new block mined, height {{ block.number | toDex }}</p>
                        <p>{{ block.timestamp }}:: block hash {{ block.hash | toAddr }}, minner {{ block.miner | toAddr }}, reward {{ block.reward | toPoc | formatNumber }} {{ unit }}</p>
                        <p>{{ block.timestamp }}:: nonce={{ block.nonce | replace0x }},dificulty={{ block.difficulty | formatNumber }},deadline={{ block.deadline | formatNumber }}</p>
                    </div>
                    <p>waiting...</p>
                </div>
            </div>

            <div class="info">
                <div class="title">
                    {{ l.RECENTBLOCKINFO }}
                    <span class="refresh" @click="refresh"></span>
                </div>
                <div class="item">
                    <div class="key">{{ l.BLOCKTIME }}</div>
                    <div class="value">{{ summary.timestamp }}</div>
                </div>

                <div class="item">
                    <div class="key">{{ l.TOTALMINERCAPACITY }}</div>
                    <div class="value">{{ summary.power | toPb }}</div>
                </div>

                <div class="item">
                    <div class="key">{{ l.RECENTBLOCKINFO }}</div>
                    <div class="value">{{ summary.number | formatNumber }}</div>
                </div>

                <div class="item">
                    <div class="key">{{ l.ALLREWARD }}</div>
                    <div
                        class="value"
                    >{{ miningInfo.total_rewarded | toPoc | formatNumber }} {{ unit }}</div>
                </div>

                <div class="item">
                    <div class="key">{{ l.DIFFICULTY }}</div>
                    <div class="value">{{ summary.difficulty | formatNumber}}</div>
                </div>

                <div class="item">
                    <div class="key">{{ l.MINER }}</div>
                    <a
                        :href="summary.miner | getPocScanLink('address')"
                        class="value focus"
                    >{{ summary.miner | toAddr }}</a>
                </div>

                <div class="item">
                    <div class="key">{{ l.BLOCKREWARD }}</div>
                    <div class="value">{{ summary.reward | toPoc }} {{ unit }}/{{ l.BLOCK }}</div>
                </div>

                <div class="item">
                    <div class="key">{{ l.HASH }}</div>
                    <a
                        :href="summary.hash | getPocScanLink('hash')"
                        class="value focus"
                    >{{ summary.hash | toAddr }}</a>
                </div>

                <div class="item">
                    <div class="key">{{ l.PARENTHASH }}</div>
                    <a
                        :href="summary.parentHash | getPocScanLink('hash')"
                        class="value focus"
                    >{{ summary.parentHash | toAddr }}</a>
                </div>

                <!-- <div class="item">
                    <div class="key">Target Deadline</div>
                    <div class="value">-</div>
                </div>-->

                <div class="item">
                    <div class="key">{{ l.DEADLINE }}</div>
                    <div class="value">{{ summary.deadline | toDex(16) }}s</div>
                </div>

                <div class="item">
                    <div class="key">{{ l.NONCE }}</div>
                    <div class="value">{{ summary.nonce | toDex(16) }}</div>
                </div>

                <div class="item">
                    <div class="key">{{ l.SCOOPNUMBER }}</div>
                    <div class="value">{{ summary.scoopNumber | toDex(16) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
const { ipcRenderer } = require("electron");
import Common from "../../Common";
import Web3 from "web3";
import * as Web3PocMinedev from "web4minedev";
import * as filters from "../filter";

const axios = require("axios");

export default {
    name: "mining",
    data() {
        return {
            // type: "monitor",
            type: "summary",
            unit: Common.projectName.toUpperCase(),
            wallet: {},
            miningInfo: {},
            tableData: [],
            pageno: 1,
            address: "",
            pageSize: 10,
            blockHeight: 0,
            web3: null,
            mineWeb3: null,
            summary: {},
            blockList: [],
            interval: null
        };
    },
    computed: {},
    created() {
        this.toggleLanguage = this.toggleLanguage.bind(this);

        this.toggleLanguage();
    },
    beforeDestroy() {
        console.log("Destroy miningpage...");
        ipcRenderer.removeListener("lang-changed", this.toggleLanguage);
    },
    async mounted() {
        // 这里获取扫码后的钱包数据
        this.wallet = ipcRenderer.sendSync("get-wallet");
        console.log(this.wallet);
        this.address = this.wallet.addr.toLowerCase();

        this.web3 = new Web3();
        let provider = new this.web3.providers.HttpProvider(
            Common.web3Provider
        );
        this.web3.setProvider(provider);
        this.mineWeb3 = new Web3PocMinedev(Common.web3Provider);

        this.getMiningInfo();
        this.getRecentMining();
        this.refreshSummaryInfo();

        this.blockHeight = await this.web3.eth.getBlockNumber();

        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.interval = setInterval(() => {
            this.refreshSummaryInfo();
        }, 120000);

        ipcRenderer.on("lang-changed", (event, lang) => {
            console.log("Lang changed to " + JSON.stringify(lang));
            this.toggleLanguage();
        });
    },
    onDestroy() {
        clearInterval(this.interval);
        this.interval = null;
    },
    methods: {
        toggleLanguage() {
            //获取语言文件
            let lang = ipcRenderer.sendSync("get-lang");
            this.l = lang;
            this.$forceUpdate();
        },
        refresh() {
            console.log("Refresh...");
            this.refreshSummaryInfo();
        },
        async refreshSummaryInfo() {
            let blockHeight = await this.web3.eth.getBlockNumber();
            if (
                blockHeight != this.blockHeight ||
                !this.blockList.find(
                    item => parseInt(item.number, 10) == blockHeight
                )
            ) {
                console.log(
                    "Add block:",
                    blockHeight,
                    this.blockHeight,
                    this.blockList
                );
                let promise1 = new Promise((resolve, reject) => {
                    this.mineWeb3.getPocBlock(blockHeight, (err, res) => {
                        console.log("getPocBlock returned...");
                        if (err) {
                            reject(err);
                        } else {
                            // for (let i in res) {
                            //     console.log("poc", i);
                            //     this.summary[i] = res[i];
                            // }
                            this.summary["deadline"] = res.deadline;
                            this.summary["nonce"] = res.nonce;
                            this.summary.scoopNumber = res.scoopNumber;
                            this.summary.baseTarget = res.baseTarget;
                            resolve();
                        }
                    });
                });

                let promise2 = new Promise((resolve, reject) => {
                    this.web3.eth.getBlock(blockHeight, (err, res) => {
                        console.log("getBlock returned..");

                        if (err) {
                            reject(err);
                        } else {
                            //计算算力
                            this.summary.power =
                                parseInt(res.difficulty, 10) * 1456;

                            for (let i in res) {
                                this.summary[i] = res[i];
                            }
                            this.summary.timestamp = filters.timeFormatter(
                                res.timestamp * 1000
                            );
                            console.log("getblock", this.summary);
                            console.log(this.summary.timestamp);

                            resolve();
                        }
                    });
                });

                Promise.all([promise1, promise2])
                    .then(res => {
                        //数据已齐全
                        this.blockList.push(this.summary);
                        this.blockHeight = blockHeight;
                    })
                    .catch(e => {
                        console.log("catch", e);
                    });
            }
        },
        toggleSummary(b) {
            if (b) {
                this.type = "summary";
            } else {
                this.type = "monitor";
            }
        },
        // 获取最近的挖矿地址
        async getRecentMining() {
            let addr = this.address.startsWith("0x")
                ? this.address
                : "0x" + this.address;
            axios
                .post(Common.remoteUrl + Common.URL["getRecentMiningByAddr"], {
                    addr: addr,
                    pageIndex: 1,
                    pageSize: 10
                })
                .then(res => {
                    let data = res.data;
                    console.log('这是getRecentMining=>'+JSON.stringify(data));
                    if (data.err_no == 0) {
                        let blocks = data.blocks || [];
                        blocks.forEach(item => {
                            //修改确认次数
                            item.times = this.blockHeight - item.block_number;
                            item.block_reward = (
                                item.block_reward / Math.pow(10, 18)
                            ).toFixed(4);
                        });
                        this.tableData = blocks;
                    }
                });
        },
        // 获取挖矿总览
        getMiningInfo() {
            axios.get(Common.remoteUrl + Common.URL["getSummary"]).then(res => {
                let data = res.data;
                if (data.err_no == 0) {
                    this.miningInfo = res.data;
                    console.log('挖矿总览'+JSON.stringify(res.data))
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
    // padding: 20px;
    display: flex;
    flex-direction: column;
    // height: calc(100% - 64px);

    .recent-blocks {
        .focus {
            color: #00b000;
        }
    }

    .tabs {
        .tab {
            margin-right: 30px;
            float: left;
            cursor: pointer;
        }
    }
    .label {
        font-size: 14px;
        color: rgba(52, 69, 99, 0.5);
        line-height: 44px;
        font-weight: bold;
        padding-top: 10px;

        &.focus {
            font-size: 16px;
            color: #344563;
        }
    }
    .mining-info {
        .mining-ul {
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
                    background: url(../assets/images/power.svg) center center
                        no-repeat;
                    background-size: contain;

                    &.icon-power {
                        background-image: url(../assets/images/power.svg);
                    }
                    &.icon-reward {
                        background-image: url(../assets/images/reward.svg);
                    }
                    &.icon-total {
                        background-image: url(../assets/images/total.svg);
                    }
                    &.icon-boom {
                        background-image: url(../assets/images/boom.svg);
                    }
                    &.icon-difficulty {
                        background-image: url(../assets/images/difficulty.svg);
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
                    white-space: nowrap;
                }
            }
        }
    }
}

.tab-monitor-content {
    background: #fff;
    padding: 20px;
    height: calc(100% - 54px);
    border-radius: 5px;
    display: flex;
    // overflow: hidden;

    .wrapper {
        background: #000000;
        border-radius: 5px;
        padding: 20px;
        font-size: 12px;
        line-height: 20px;
        color: #29fc14;
        word-break: break-all;
        width: 54%;
        max-height: 100%;
        overflow: auto;
        float: left;
    }
    .info {
        width: calc(46% - 26px);
        margin-left: 26px;
        float: left;
        .title {
            font-size: 14px;
            color: #344563;
            line-height: 40px;
            height: 40px;
            font-weight: bold;
            position: relative;
            .refresh {
                position: absolute;
                right: 0;
                width: 22px;
                height: 40px;
                top: 0;
                background: url(../assets/images/refresh.svg) center center
                    no-repeat;
                background-size: 22px 22px;
                cursor: pointer;
                animation: rotate 1s forwards;

                &:active {
                    animation: none;
                }
            }
        }

        .item {
            background: #f9f9fa;
            border-radius: 5px;
            height: 36px;
            line-height: 36px;
            padding: 0 10px;
            margin-bottom: 10px;
            display: flex;

            &:last-child {
                margin-bottom: 0;
            }

            .key {
                font-size: 12px;
                color: #999999;
            }
            .value {
                flex: 1;
                font-weight: bold;
                text-align: right;
                font-size: 12px;
                color: #344563;

                &.focus {
                    color: #00b000;
                }
            }
        }
    }

    @keyframes rotate {
        0% {
            transform: rotate(0);
        }
        100% {
            transform: rotate(720deg);
        }
    }
}
</style>