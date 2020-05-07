// let Common = require('../Common');
import Common from '../Common'

let toAddr = (value) => {
	if (value == undefined) {
		return "";
	}
	value = value.toLowerCase();
	if (value.startsWith("0x")) {
		value = value.replace('0x', '0x');
	} else if (value.startsWith("0x")) {
		value = value.replace("0x", "0x");
	} else {
		value = "0x" + value;
	}
	return value.slice(0, 11) + "..." + value.slice(-8);
};

let replace0x = (value) => {
	if (value == undefined) {
		return "";
	}
	value = value.replace('0x', '0x');
	return value;
}

let getPocScanLink = (value, type) => {
    let url = `${Common.baseUrl}/#/`;
    console.log(url);
	if (value.startsWith('0x')) {
		value = value.replace('0x', '0x');
	}
	if (type == 'hash') {
		if (!value.startsWith('0x')) {
			value = '0x' + value;
		}   
		return url + 'txhash/' + value;
	} else if (type == 'height') {
		return url + 'block/' + value;
	} else if (type == 'address') {
		if (!value.startsWith('0x')) {
			value = '0x' + value;
		}
		return url + 'address/' + value;
	}
	return url;
}

let formatNumber = (value, ...args) => {
	//数字加逗号
	if (value == undefined) {
		return "";
	}
	let splitLen = 3,
		splitToken = ",";
	value = value.toString();
	if (args && args.length) {
		if (args[0]) {
			splitLen = args[0];
		}
		if (args[1]) {
			splitToken = args[1];
		}
	}
	let match = value.toString().match(/^(\d+)(\.\d+)?$/);
	let fragment = match && match[1] || "",
		fraction = (match && match[2]) || "";
	if (fragment.length <= splitLen) {
		return value;
	}
	let start = fragment.length % splitLen;
	let reg = new RegExp("(\\d{" + splitLen + "})(?=\\d)", "g");
	let ret =
		(start == 0 ? '' : fragment.slice(0, start) +
			splitToken) +
		fragment
			.slice(start)
			.replace(reg, "$1" + splitToken)
			.replace(/\s+$/, "");
	return ret + fraction.toString().replace(/^0\./, ".");
};

let toPb = (value) => {
	if (value == undefined) {
		return "0";
	}
	let t = Math.pow(2, 40),
		p = Math.pow(2, 50);
	if (value < p) {
		return (value / t).toFixed(3) + " TB";
	} else {
		return (value / p).toFixed(3) + " PB";
	}
};

let toTb = (value) => {
	if (value == undefined) {
		return "0";
	}
	let t = Math.pow(2, 40);
	return (value / t).toFixed(2);
};

let toGb = (value, len) => {
	if (value == undefined) {
		return "0";
	}
	let t = Math.pow(2, 30);
	return (value / t).toFixed(len);
};

let toDex = (value, m = 10) => {
	if (value == undefined) {
		return "";
	}
	value = parseInt(value, m);
	return value;
}

let toPoc = (value) => {
	if (value == undefined) {
		return "";
	}
	let n = Math.pow(10, 18);
	let v = (value / n).toFixed(4);
	return v;
};

let toFixed = (value, len) => {
	if (value == undefined) {
		return "";
	}
	if (!/^[0-9\.]+$/.test(value)) {
		return value;
	}
	let v = value.toFixed(len);
	return v;
};

let timeFormatter = (ts) => {
	var date = new Date(ts);
	var month = date.getMonth() + 1;
	var split = "-";
	var needHours = true;
	var Y = date.getFullYear(),
		M = ("00" + month).slice(-2),
		D = ("00" + date.getDate()).slice(-2),
		h = ("00" + date.getHours()).slice(-2),
		m = ("00" + date.getMinutes()).slice(-2),
		s = ("00" + date.getSeconds()).slice(-2);
	var hours = " " + [h, m, s].join(":");
	if (needHours == false) {
		hours = "";
	}
	return [Y, M, D].join(split) + hours;
}

export {
	toAddr,
	formatNumber,
	toPb,
	toPoc,
	toFixed,
	timeFormatter,
	replace0x,
	toDex,
	toTb,
	toGb,
	getPocScanLink
}