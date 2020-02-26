const http = require('http');
import axios from 'axios';
const querystring = require("querystring");
var env = "test";
import Common from '../../Common';
import { ipcRenderer } from 'electron';
var upnp = require('node-upnp-utils');
import store from '../store';

var upnp = require('node-upnp-utils');
var common = {
	searching: false,

	log(...args) {
		console.log(Date.now() + " | " + args.join('==='));
	},

	stop() {
		return new Promise((resolve, reject) => {
			upnp.stopDiscovery(() => {
				resolve()
			});
		}).catch(e => {
			reject();
		})
	},

	discovery(mac) {
		console.log('这是传进来搜索的mac---- ' + mac)
		// if (this.searching) {
		// 	common.log("Searching.....");
		// 	reject('searching');
		// }
		// this.searching = true;
		if (common.timeout) {
			clearTimeout(common.timeout);
			common.timeout = null;
		}
		return this.stop().then(res => {
			return new Promise((resolve, reject) => {

				common.log("这里开始搜索矿机。。。");

				try {
					upnp.startDiscovery(

						{
							mx: 3,
							st: 'poc:minner'
							// st: 'upnp:rootdevice' //仅搜索网络中的根设备
							// st: 'ssdp:all' //搜索所有设备和服务
							// st: 'uuid:device-UUID' //查询UUID标识的设备
							// st: 'urn:schemas-upnp-org:device:device-Type:version' //查询device-Type字段指定的设备类型，设备类型和版本由UPNP组织定义
							// st: 'urn:schemas-upnp-org:service:service-Type:version' //查询service-Type字段指定的服务类型，服务类型和版本由UPNP组织定义
							// st: 'urn:schemas-upnp-org:device:InternetGatewayDevice:1'
						}

					);
					console.log('尝试发现矿机')

				} catch (e) {
					console.log("throw", e);
					throw e;
				}

				common.timeout = setTimeout(() => {
					upnp.stopDiscovery(() => {
						// this.searching = false;
						var device_list = upnp.getActiveDeviceList();
						console.info('获取到发现的列表(并对比过滤用户输入的mac地址)↓')
						console.log(JSON.stringify(device_list))



						if (mac) {
							mac = mac.toLowerCase();
							device_list = device_list.filter(item => {
								let serialNumber = item.device.serialNumber.toLowerCase();
								console.info('拿到设备的serialNumber👉 ' + serialNumber);

								return serialNumber.indexOf(mac) > -1;
							});
						}
						console.log('最后返回的结果👉 ' + device_list)
						common.log('有多少个被找到了👉 ' + device_list.length);
						resolve(device_list);
					});
				}, 3000);

				if (!common.addEventBinded) {
					common.addEventBinded = true;
					upnp.on('added', (device) => {
						common.log("Discovery device:", JSON.stringify(device));
					});
				}
			})
		}).catch(e => {
			// this.searching = false;
			return Promise.reject('search poc miner catch...', e);
		})
	},
};

export default common;
