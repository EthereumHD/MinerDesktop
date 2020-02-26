<template>
    <div id="app" class="app">
        <router-view></router-view>
    </div>
</template>

<script>
const shell = require("electron").shell;
export default {
    name: "poc_desktop",
    mounted() {
        console.log(document.getElementById("app"));
        document.getElementById("app").addEventListener("click", event => {
            let target = event.srcElement || event.target;
            if (target.nodeName.toLowerCase() == "a") {
                let link = event.target.href;

                event.preventDefault();
                console.log("link", link);
                shell.openExternal(link);
            }
        });
    }
};
</script>

<style lang="less">
/* CSS */
@import "./assets/css/common.css";
.app {
    width: 100%;
    height: 100%;
    min-height: 400px;
    min-width: 600px;
}
.app .el-date-editor .el-range-separator {
    padding: 0;
}

.relative {
    position: relative;
}

.clear {
    &:after {
        content: "";
        display: block;
        clear: both;
    }
}

.menu-wrapper {
    height: 100%;
    box-sizing: border-box;

    .column-content {
        flex-direction: column;
    }
}

.capitalize {
    text-transform: capitalize;
}

.no-data {
    font-size: 12px;
    line-height: 2;
    color: #666;
}

.menu {
    width: 180px !important;
}

input {
    outline: none;
}

.poc-dialog {
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    width: 100%;
    height: 100%;

    .dialog-wrapper {
        width: 400px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #feffff;
        box-shadow: 0 25px 50px 0 rgba(0, 0, 0, 0.04);
        border-radius: 12px;
        overflow: hidden;
        padding-bottom: 20px;

        .title {
            height: 48px;
            line-height: 48px;
            border-bottom: 1px solid #e9edf0;
            position: relative;
            font-size: 16px;
            color: #344563;
            letter-spacing: 0.27px;
            font-weight: bold;
            padding: 0 30px;

            .close {
                position: absolute;
                cursor: pointer;
                right: 30px;
                top: 0;
                width: 30px;
                height: 100%;
                background: url(./assets/images/close.svg) right center
                    no-repeat;
                background-size: 18px auto;
            }
        }

        .input-component {
            margin: 4px 30px auto;

            .error-text {
                font-size: 12px;
                line-height: 30px;
                color: red;
            }
        }

        .input-wrapper {
            border: 1px solid #e8e8e8;
            border-radius: 6px;
            overflow: hidden;
            height: 44px;

            input {
                background: #f8f8f8;
                border: none;
                line-height: 44px;
                display: block;
                width: 100%;
                height: 100%;
                padding: 0 16px;
                font-size: 14px;
                color: #000;

                ::placeholder {
                    color: #4a4a4a;
                }
            }
        }

        .item-label {
            font-size: 14px;
            color: #4a4a4a;
            font-weight: bold;
            line-height: 44px;
        }

        .confirm-button {
            box-shadow: inset 0 -3px 0 0 rgba(0, 0, 0, 0.1);
            border-radius: 6px;
            color: #fff;
            font-size: 14px;
            color: #fefefe;
            text-align: center;
            font-weight: bold;
            line-height: 44px;
            height: 44px;
            background: #00b000;
            margin: 0 30px;
            cursor: pointer;
            &:active {
                background: #00a000;
                color: #f8f8f8;
            }
        }
    }
}
</style>
