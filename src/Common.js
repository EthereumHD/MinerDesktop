import * as pledge from './renderer/components/pledge.abi';
var Common = {

}

Common.WINDOW_SIZE = {
	width: 1026,
	height: 600
}
Common.ISMAX = false;

Common.projectName = 'poc';

Common.remoteUrl = "http://scan." + Common.projectName + ".com/api";

Common.URL = {
	"getRate"                  : `/${Common.projectName}/get_exchange_rate`,
	"getSummary"               : `/${Common.projectName}/get_summary`,
	"getRecentMiningByAddr"    : "/mining/get_mined_block_by_addr",
	"getAvenueByAddr"          : "/mining/get_mined_block_by_addr_and_date",
	"getAvenueByAddrCollected" : "/mining/get_addr_mining_rewards",
}

Common.pledgeContract = "0x0000000000000000000000000000000000000081";
Common.web3Provider = `http://gateway.${Common.projectName}.com/`;
Common.pledgeAbi = pledge.pledgeAbi;

Common.ERRORS = {
	// 中心错误码
	'20002': 'The current account is not registered',
	'20005': 'Failed to login. Please try again later',
	'20010': 'You have been signed out',
	'20011': 'Unusual activities detected. Please contact customer service.',
	'20080': 'Your password is incorrect. Please check again',
	// 盒子错误码
	'1001': 'Illegal parameter',
	'1101': 'The deveice does not belong to this account. Please use the correct account.',
	'1102': 'Enter the correct password',
	'1103': 'You have been signed out',
	'1104': 'Enter a valid email address',
	'1201': 'Device ID error',
	'1202': 'Please login the device with binding account.',

	'1401': 'The folder does not exist',
	'1402': 'The folder already exist',

	'1403': 'The file with the same name is already existed in folders',
	'1406': 'Invalid folder/file name',
	'1502': 'No disk detected, operation failed.'

}

export default Common
