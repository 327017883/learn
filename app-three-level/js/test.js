

new ThreeLevel({
	target: "#level1",
	data: AddressChinaData,	
	level: 1,
	callBack:function(innerHTML, value){
		console.log(innerHTML, value)
	}
});

new ThreeLevel({
	target: "#level2",
	data: AddressChinaData,
	level: 2,
	callBack:function(innerHTML, value){
		console.log(innerHTML, value)
	}
});

new ThreeLevel({
	target: "#level3",
	data: AddressChinaData,
	level: 3,
	callBack:function(innerHTML, value){
		console.log(innerHTML, value)
	}
});

var dateTime = new Date();
var year = dateTime.getFullYear();
var month = dateTime.getMonth() + 1 > 9 ? dateTime.getMonth() + 1 :'0' + (dateTime.getMonth() + 1);
var date = dateTime.getDate() > 9 ? dateTime.getDate() : '0'+ dateTime.getDate();
var hours = dateTime.getHours();


new DateTime({
	target: "#dateTime4",
	level: 6,
	startTimeLimite: "2012年8月8日10时10分10秒",
	initTime: "2012年8月8日10时10分10秒",
	endTimeLimite:"2012年8月8日10时10分12秒",
	callBack: function(innerHTML, value){
		console.log(innerHTML, value);
	}
});

// new DateTime({
// 	target: "#dateTime3",
// 	level: 4,
// 	startTimeLimite: "2012年8月10日 08时10分",
// 	initTime: '2012' + '年' + '08' +'月'+ '10' +'日08时10分',
// 	endTimeLimite: '2018' + '年' + '01' +'月'+ '17' +'日08时10分',
// 	callBack: function(innerHTML, value){
// 		console.log(innerHTML, value)
// 	}
// });

// new DateTime({
// 	target: "#dateTime2",
// 	level: 5,
// 	initTime: "2018年8月4日 08时10分8秒",
// 	startTimeLimite: "2018年2月3日 02时10分5秒",
// 	endTimeLimite: '2019' + '年' + '11' +'月'+ '17' +'日08时50分10秒',
// 	callBack: function(innerHTML, value){
// 		console.log(innerHTML, value)
// 	}
// });

