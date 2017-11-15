

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
	level: 3,
	startTimeLimite: "2012年8月8日",
	initTime: year + '年' + month +'月'+ date +'日',
	callBack: function(innerHTML, value){
		console.log(innerHTML, value)
	}
});

new DateTime({
	target: "#dateTime3",
	level: 4,
	hoursRange: '7-18',
	startTimeLimite: "2012年8月10日 08时10分",
	initTime: '2012' + '年' + '08' +'月'+ '10' +'日08时10分',
	callBack: function(innerHTML, value){
		console.log(innerHTML, value)
	}
});

new DateTime({
	target: "#dateTime2",
	level: 5,
	initTime: year + '年' + month +'月'+ date +'日08时00分',
	callBack: function(innerHTML, value){
		console.log(innerHTML, value)
	}
});

