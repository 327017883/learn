
;(function(win, doc){
	'use strict';
	/*
	 * Tween.js
	 * t: current time（当前时间）
	 * b: beginning value（初始值） 开始
	 * c: change in value（变化量） 最终值
	 * d: duration（持续时间）
	*/
	var Tween = {
	    Linear: function(t, b, c, d) { return c*t/d + b; },
	    Quad: {
	        easeIn: function(t, b, c, d) {
	            return c * (t /= d) * t + b;
	        },
	        easeOut: function(t, b, c, d) {
	            return -c *(t /= d)*(t-2) + b;
	        },
	        easeInOut: function(t, b, c, d) {
	            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
	            return -c / 2 * ((--t) * (t-2) - 1) + b;
	        }
	    }
	};
	function $Id(id){
		return doc.getElementById(id);
	}

	function getComputedStyle(el, attr){
		var n;
		return n = win.getComputedStyle(el), n[attr];
	}

	function setTimeValue(arr, start, end, type){

		start = parseInt(start);

		end = parseInt(end);
		for(; start <= end; start++){
			start = start < 10 ? '0' + start : '' + start;
			arr.push(start + type);
		}
		return arr;
	}

	function isLeapYear(year){
		year = parseInt(year);
		return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
	}

	function DateTime(options) {
		this.init(options);		
	}

	var t = DateTime.prototype;
	
	t.init = function (options) {
		
		//初始化默认配置
		this.defaults = {
			level: 1, //联动的层级
			initTime: '',//初始化时间
			startTimeLimite: '',//开始
			endTimeLimite: '',//截止
			hoursRange: '',//小时时间段
			sysTime: '', //服务器的时间
			callBack: null
		};		

		Object.keys(options).forEach(function(key){			
			this.defaults[key] = options[key]
		}.bind(this));

		this.initDate(this.defaults.sysTime);		

		this.target = this.defaults.target;
		this.idName = this.target.replace(/#/g,'');
		this.nextLevel = this.defaults.level;
		this.targetDom = $Id(this.idName);
		this.toValue = this.targetDom;

		var domContainer = this.insertContainer();

		//渲染容器到页面
		this.dialog = this.targetDom.parentNode.appendChild(domContainer);
		//this.dialog.style.display = 'none';

		this.initData();
	
		this.container = $Id(this.secContainerId);

		var scrollerIndicator = this.container.querySelector('.scroller-indicator');

		var top = this.INIT_TOP =this.__initTop = getComputedStyle(scrollerIndicator,'top').replace(/px/,'');
		
		this.__itemHeight = parseFloat(getComputedStyle(scrollerIndicator,'height').replace(/px/,''));

		//初始化位置
		this.initSecPostion(this.container, top);

		if(this.defaults.initTime !== ''){			
			this.setInitTime(this.container);
			//this.toValue.innerHTML = this.defaults.initTime;
		}
		
		var domA;
		(!!$Id('vux-popup-mask')) || (domA = document.createElement("div"),
			domA.className ='vux-popup-mask', 
			domA.id='vux-popup-mask', 
			doc.body.appendChild(domA));
		
		this.initEvent();
	};

	t.initDate = function(sysTime){

		var _this = this;
		var currentTime = (sysTime && new Date(sysTime) ) || new Date();
		var curYear = currentTime.getFullYear();

		var initTime;

		if(this.defaults.initTime){	
			initTime = this.defaults.initTime.match(/\d+/g);
			this.initYear = parseInt(initTime[0]);
			this.initMonth = parseInt(initTime[1]);
			this.initDay = parseInt(initTime[2]);
			this.initHour = parseInt(initTime[3] || 0);
			this.initMinute = parseInt(initTime[4] || 0);
			this.initSecond = parseInt(initTime[5] || 0);
		}

		this.initMinHour = 0;
		this.initMaxHour = 23;
		this.initMinMinute = 0;
		this.initMaxMinute = 59;
		this.initMinSecond = 0;
		this.initMaxSecond = 59;

		this.curYear = curYear;
		this.curMonth = currentTime.getMonth() + 1;
		this.curDay = currentTime.getDate();
		this.curHour = currentTime.getHours();
		this.curMinte = currentTime.getMinutes();
		this.curSecond = currentTime.getSeconds();		

		this.YAER = setTimeValue([], curYear - 30 , curYear + 5, '年');
		this.MONTH = setTimeValue([], 1, 12, '月');
		this.HOURS = setTimeValue([], 0, 23, '时');
		this.MINUTES = setTimeValue([], 0, 59, '分');
		this.SECONDS = setTimeValue([], 0, 59, '秒');

		this.minYear = this.minMonth = this.minDay = this.minHour = this.minMinute = this.minSecond = null;

		var defaults = this.defaults;

		var startArr;
		if(defaults.startTimeLimite){
			startArr = defaults.startTimeLimite.match(/\d+/g);
			this.minYear = parseInt(startArr[0]);
			this.minMonth = parseInt(startArr[1]); 
			this.minDay = parseInt(startArr[2]); 
			this.minHour = parseInt(startArr[3] || 0); 
			this.minMinute = parseInt(startArr[4] || 0);
			this.minSecond = parseInt(startArr[5] || 0);

			var minIndex = 0;
			this.YAER.forEach(function(item, index){
				if(parseInt(item) == _this.minYear){
					minIndex = index;
				}
			});
			this.YAER.splice(0, minIndex);			
		}

		var endArr;
		if(defaults.endTimeLimite){
			endArr = defaults.endTimeLimite.match(/\d+/g);
			this.maxYear = parseInt(endArr[0]);
			this.maxMonth = parseInt(endArr[1]); 
			this.maxDay = parseInt(endArr[2]); 
			this.maxHour = parseInt(endArr[3] || 59); 
			this.maxMinute = parseInt(endArr[4] || 59);
			this.maxSecond = parseInt(endArr[5] || 59);

			var maxIndex = 0;
			this.YAER.forEach(function(item, index){
				if(parseInt(item) == _this.maxYear){
					maxIndex = index;
				}
			});
			this.YAER.splice(maxIndex+1, this.YAER.length);	
		}

		// if(this.defaults.hoursRange !== ''){

		// 	var hoursRange = this.defaults.hoursRange.match(/\d+/g);
		// 	this.initMinHour = parseInt(hoursRange[0]);
		// 	this.initMaxHour = parseInt(hoursRange[1]);
		// 	this.HOURS = setTimeValue([], this.initMinHour, this.initMaxHour , '时');			
		// }
		
		
	};
	t.initData = function (){

		for(var i = 1; i <= this.nextLevel; i++){
			this.initSecDom(i);
		}

	};

	t.initSecDom = function (index){

		var data;
		var _this = this;

		switch(index){
			case 1:
				this.initYearArr = data = this.timeBranch[index].bind(this)();
				break;
			case 2:
				this.initMonthArr = data = this.timeBranch[index].bind(this)();

				if( this.initYear == this.minYear){

					this.initMonthArr = data = setTimeValue([], this.minMonth, 12, '月');
				}

				if( this.initYear == this.maxYear){	
					var maxIndex = 0;
					data.forEach(function(item, index){
						if(parseInt(item) == _this.maxMonth){
							maxIndex = index;
						}
					});
					this.initMonthArr = data = data.splice(0, maxIndex+1);
				}
				break;
			case 3:
				this.initDayArr = data = this.timeBranch[index].bind(this)(this.YAER[0] , this.MONTH[0]);
				if( this.minYear == this.initYear 
					&& this.minMonth == this.initMonth					
				){
					this.initDayArr = data = data.splice(this.minDay - 1);
				}
				if( this.maxYear == this.initYear
					&& this.maxMonth == this.initMonth			
				){					
					var maxIndex = 0;
					data.forEach(function(item, index){
						if(parseInt(item) == _this.maxDay){
							maxIndex = index;
						}
					});
					this.initDayArr = data = data.splice(0, maxIndex+1);
				}
				break;
			case 4:
				this.initHourArr = data = this.timeBranch[index].bind(this)();
				if( this.minYear == this.initYear
					&& this.minMonth == this.initMonth
					&& this.minDay == this.initDay					
				){
					this.initHourArr = data = data.splice(this.minHour);
				}
				if( this.maxYear == this.initYear 
					&& this.maxMonth == this.initMonth
					&& this.maxDay == this.initDay					
				){					
					var maxIndex = 0;
					data.forEach(function(item, index){
						if(parseInt(item) == _this.maxHour){
							maxIndex = index;
						}
					});
					this.initHourArr = data = data.splice(0, maxIndex+1);
				}
				break;
			case 5:
				this.initMinuteArr = data = this.timeBranch[index].bind(this)();
				if( this.minYear == this.initYear 
					&& this.minMonth == this.initMonth
					&& this.minDay == this.initDay
					&& this.minHour == this.initHour					
				){
					this.initMinuteArr = data = data.splice(this.minMinute);
				}
				if( this.maxYear == this.initYear 
					&& this.maxMonth == this.initMonth
					&& this.maxDay == this.initDay
					&& this.maxHour == this.initHour				
				){					
					var maxIndex = 0;
					data.forEach(function(item, index){
						if(parseInt(item) == _this.maxMinute){
							maxIndex = index;
						}
					});
					this.initMinuteArr = data = data.splice(0, maxIndex+1);
				}
				break;
			case 6:
				this.initSecondArr = data = this.timeBranch[index].bind(this)();
				if( this.minYear == this.initYear
					&& this.minMonth == this.initMonth
					&& this.minDay == this.initDay 
					&& this.minHour == this.initHour
					&& this.minMinute == this.initMinute					
				){
					this.initSecondArr = data = data.splice(this.minSecond);
				}
				if( this.maxYear == this.initYear 
					&& this.maxMonth == this.initMonth
					&& this.maxDay == this.initDay
					&& this.maxHour == this.initHour
					&& this.maxMinute == this.initMinute					
				){
					var maxIndex = 0;
					data.forEach(function(item, index){
						if(parseInt(item) == _this.maxSecond){
							maxIndex = index;
						}
					});
					this.initSecondArr = data = data.splice(0, maxIndex+1);					
				}
				break;					
		}	
		
		//获取数据的模板 并转化为dom节点
		var secTemObj = this.getSectionTem(data);

		var secTem = secTemObj.secTem;
		
		//dom 节点绑定事件
		var dom = this.setSelected(this.bindSecEvent(secTem),0);
		
		//插入到相应的位置
		this.insertSecDom(dom);
	};

	t.timeBranch = {
		1: function(){
			return this.getYearData();
		},
		2: function(){
			return this.getMonthData();
		},
		3: function(year, month){
			return this.getDaysData(year, month);
		},
		4: function(){
			return this.getHoursData();
		},
		5: function(){
			return this.getMinitesData();
		},
		6: function(){
			return this.getSecondsData();
		}
	};
	t.getYearData = function(){
		return this.YAER;
	};
	t.getMonthData = function(){
		return this.MONTH;
	};
	t.getDaysData = function(year, month){
		
		var start = 1;

		year = parseInt(year);
		month = parseInt(month);

		switch(month){
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				return setTimeValue([], start, 31, '日');
			case 4:
			case 6:
			case 9:
			case 11:
				return setTimeValue([], start, 30, '日');
			default:
				return isLeapYear(year) ? setTimeValue([], start, 29, '日') : setTimeValue([], start, 28, '日');
		}		
	};
	t.getHoursData = function(){
		return this.HOURS;
	};
	t.getMinitesData = function(){
		return this.MINUTES;
	};
	t.getSecondsData = function(){
		return this.SECONDS;
	};

	t.getSectionTem = function (data) {

		var str = '';
		var _this = this;

		data.forEach(function(value){
			str += "<div class='scroller-item' data-value='" + _this.delTimeText(value) +"'>"+ value +"</div>"
		});

		var id = _this.getId();

		var secStr =  ""
			 + "<div class='vux-flexbox-item'>"
			  + "<div class='vux-picker-item'>"
			    + "<div class='scroller-component' id='" + id + "'>"
			      + "<div class='scroller-mask'></div>"
			      + "<div class='scroller-indicator'></div>"
			      + "<div class='scroller-content'>"
			      + str
			      + "</div>"
			    + "</div>"
			  + "</div>"
			 + "</div>";
		return {
			secTem: _this.strToDom(secStr),
			id: id
		}
	};

	t.bindSecEvent = function (secTem){
		var _this = this;
		secTem.addEventListener('touchstart', function(e){
			e.preventDefault();
			_this.__doTouchStart(this,e.touches, e.timeStamp);
		}, !1);
		secTem.addEventListener('touchmove', function(e){
			_this.__doTouchMove(this, e.touches, e.timeStamp);
		}, !1);
		secTem.addEventListener('touchend', function(e){
			_this.__doTouchEnd(this, e.changedTouches, e.timeStamp);
		}, !1);
		return secTem;
	};

	t.setSelected = function(dom, index){

		var selected = 'scroller-selected';	
		var itemArr = dom.querySelectorAll('.scroller-item');
		
		this.makeArray(itemArr).forEach(function(item){
			var classArr = item.getAttribute('class');

			if(classArr.indexOf(selected)){
				classArr = classArr.replace(/scroller-selected/g, '').trim();
				item.setAttribute('class', classArr);			
			}			
		});
		
		var scrollerItem = itemArr[index];
		var className = scrollerItem.getAttribute('class');
		scrollerItem.setAttribute('class', (className + ' scroller-selected').trim());

		return dom;
	};
	t.insertSecDom  = function (dom) {
		$Id(this.secContainerId).appendChild(dom);
	};

	t.updateDom = function(container){

		var _this = this;
		var next = container.nextSibling;	
		var data;

		nextDom(this._index);

		function nextDom(curIndex){

			var year, month, day, hour, minite, second;
			var item = _this.container.querySelectorAll('.vux-flexbox-item');

			_this.makeArray(item).forEach(function(dom, index){
				_this.makeArray(dom.querySelectorAll('.scroller-item')).forEach(function(m){
					if(m.getAttribute('class').indexOf('scroller-selected') > -1){

						var val = parseInt(m.getAttribute('data-value'));
						switch(index){
							case 0:
								year = val;								
								break;
							case 1:
								month = val;
								break;
							case 2:
								day = val;
								break;
							case 3:
								hour = val;
								break;	
							case 4:
								minite = val;
								break;
							case 5:
								second = val;
								break;								
						}						
					}
				});
			});
			
			switch(curIndex){
				case 1:

					if(year == _this.minYear){

						data = setTimeValue([], _this.minMonth, _this.maxMonth || 12, '月');
						updateNextDom(data, next); //月

						next = next.nextSibling;
						data = _this.timeBranch[3].bind(_this)(year, month);
						data.splice(0, _this.minDay - 1);
						if(_this.maxDay){
							data.splice(Math.abs(_this.maxDay - _this.minDay) + 1);
						}
						updateNextDom(data, next); //天

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], _this.minHour, 23, '时');
						if(_this.maxHour){
							data.splice(Math.abs(_this.maxHour - _this.minHour) + 1);
						}
						updateNextDom(data, next); //时

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], _this.minMinute, 59, '分');
						if(_this.maxMinute){
							data.splice(Math.abs(_this.maxMinute - _this.minMinute) + 1);
						}
						updateNextDom(data, next); //分

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], _this.minSecond, 59, '秒');
						if(_this.maxSecond){
							data.splice(Math.abs(_this.maxSecond - _this.minSecond) + 1);
						}
						updateNextDom(data, next); //分

					}
					else if(year == _this.maxYear){

						data = setTimeValue([], 1, _this.maxMonth, '月');
						updateNextDom(data, next); //月

						next = next.nextSibling;
						if(parseInt(data[0]) == _this.maxMonth){
							data = _this.timeBranch[3].bind(_this)(year, parseInt(data[0]));
							data.splice(_this.maxDay)
						}else{
							data = _this.timeBranch[3].bind(_this)(year, parseInt(data[0]));
						}													
						updateNextDom(data, next);//天

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxDay){
							data = setTimeValue([], 0, _this.maxHour, '时');
						}else{
							data = setTimeValue([], 0, 23, '时');
						}													
						updateNextDom(data, next);//时

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxHour){
							data = setTimeValue([], 0, _this.maxMinute, '分');
						}else{
							data = setTimeValue([], 0, 59, '分');
						}													
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxMinute){
							data = setTimeValue([], 0, _this.maxSecond, '秒');
						}else{
							data = setTimeValue([], 0, 59, '秒');
						}													
						updateNextDom(data, next);//秒

					}
					else{

						data = setTimeValue([], 1, 12, '月');
						updateNextDom(data, next);//月

						next = next.nextSibling;
						data = _this.timeBranch[3].bind(_this)(year, 1);
						updateNextDom(data, next);//天

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 23, '时');
						updateNextDom(data, next);//时

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '分');
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '秒');
						updateNextDom(data, next);//秒

					}

					break;
				case 2:

					data = _this.timeBranch[3].bind(_this)(year, month);
					
					if(year == _this.minYear && month == _this.minMonth){										
						
						data.splice(0, _this.minDay - 1);
						if(_this.maxDay){
							data.splice(Math.abs(_this.maxDay - _this.minDay) + 1);
						}					
						updateNextDom(data, next); //天

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.minDay){
							data = setTimeValue([], _this.minHour, 23, '时');
						}else{
							data = setTimeValue([], 0, 23, '时');
						}
						if(_this.maxHour){
							data.splice(Math.abs(_this.maxHour - _this.minHour) + 1);
						}
						updateNextDom(data, next);//时

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.minHour){
							data = setTimeValue([], _this.minMinute, 59, '分');
						}else{
							data = setTimeValue([], 0, 59, '分');
						}
						if(_this.maxMinute){
							data.splice(Math.abs(_this.maxMinute - _this.minMinute) + 1);
						}
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.minMinute){
							data = setTimeValue([], _this.minSecond, 59, '秒');
						}else{
							data = setTimeValue([], 0, 59, '秒');
						}
						if(_this.maxSecond){
							data.splice(Math.abs(_this.maxSecond - _this.minSecond) + 1);
						}
						updateNextDom(data, next);//秒

					}
					else if(year == _this.maxYear && month == _this.maxMonth){

						
						data.splice(_this.maxDay);						
						updateNextDom(data, next);//天

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxDay){
							data = setTimeValue([], 0, _this.maxHour, '时');
						}else{
							data = setTimeValue([], 0, 23, '时');
						}
						updateNextDom(data, next);//时

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxHour){
							data = setTimeValue([], 0, _this.maxMinute, '分');
						}else{
							data = setTimeValue([], 0, 59, '分');
						}
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxMinute){
							data = setTimeValue([], 0, _this.maxSecond, '秒');
						}else{
							data = setTimeValue([], 0, 59, '秒');
						}
						updateNextDom(data, next);//秒

					}
					else{
						
						updateNextDom(data, next);//天

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 23, '时');
						updateNextDom(data, next);//时

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '分');
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '秒');
						updateNextDom(data, next);//秒
					}			

					break;
				case 3:

					if(year == _this.minYear && month == _this.minMonth && day == _this.minDay){

						if(!next){
							return;
						}
						data = setTimeValue([], _this.minHour, 23, '时');
						if(_this.maxHour){
							data.splice(Math.abs(_this.maxHour - _this.minHour) + 1);
						}
						updateNextDom(data, next); //时

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.minHour){
							data = setTimeValue([], _this.minMinute, 59, '分');
						}else{
							data = setTimeValue([], 0, 59, '分');
						}			
						if(_this.maxMinute){
							data.splice(Math.abs(_this.maxMinute - _this.minMinute) + 1);
						}										
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.minMinute){
							data = setTimeValue([], _this.minSecond, 59, '秒');
						}else{
							data = setTimeValue([], 0, 59, '秒');
						}
						if(_this.maxSecond){
							data.splice(Math.abs(_this.maxSecond - _this.minSecond) + 1);
						}													
						updateNextDom(data, next);//秒

					}
					else if(year == _this.maxYear && month == _this.maxMonth && day == _this.maxDay){

						if(!next){
							return;
						}
						data = setTimeValue([], 1, _this.maxHour, '时');
						updateNextDom(data, next); //时

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxHour){
							data = setTimeValue([], 0, _this.maxMinute, '分');
						}else{
							data = setTimeValue([], 0, 59, '分');
						}													
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxMinute){
							data = setTimeValue([], 0, _this.maxSecond, '秒');
						}else{
							data = setTimeValue([], 0, 59, '秒');
						}													
						updateNextDom(data, next);//秒
					}
					else{

						if(!next){
							return;
						}
						data = setTimeValue([], 0, 23, '时');
						updateNextDom(data, next);//时

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '分');
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '秒');
						updateNextDom(data, next);//秒
					}
					break;
				case 4:
					if(year == _this.minYear && month == _this.minMonth && day == _this.minDay && hour == _this.minHour){

						if(!next){
							return;
						}
						data = setTimeValue([], _this.minMinute, 59, '分');
						if(_this.maxMinute){
							data.splice(Math.abs(_this.maxMinute - _this.minMinute) + 1);
						}	
						updateNextDom(data, next); //分

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], _this.minSecond, 59, '秒');
						if(_this.maxSecond){
							data.splice(Math.abs(_this.maxSecond - _this.minSecond) + 1);
						}
						updateNextDom(data, next); //分
					}
					else if(year == _this.maxYear && month == _this.maxMonth && day == _this.maxDay && hour == _this.maxHour){

						if(!next){
							return;
						}
						data = setTimeValue([], 0, _this.maxMinute, '分');
						updateNextDom(data, next); //分

						next = next.nextSibling;
						if(!next){
							return;
						}
						if(parseInt(data[0]) == _this.maxMinute){
							data = setTimeValue([], 0, _this.maxSecond, '秒');
						}else{
							data = setTimeValue([], 0, 59, '秒');
						}													
						updateNextDom(data, next);//秒
					}
					else{

						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '分');
						updateNextDom(data, next);//分

						next = next.nextSibling;
						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '秒');
						updateNextDom(data, next);//秒
					}	
					break;
				case 5:
					if(year == _this.minYear && month == _this.minMonth && day == _this.minDay && hour == _this.minHour && minite == _this.minMinute){

						if(!next){
							return;
						}
						data = setTimeValue([], _this.minSecond, 59, '秒');
						if(_this.maxSecond){
							data.splice(Math.abs(_this.maxSecond - _this.minSecond) + 1);
						}
						updateNextDom(data, next); //秒

					}
					else if(year == _this.maxYear && month == _this.maxMonth && day == _this.maxDay && hour == _this.maxHour && minite == _this.maxMinute){

						if(!next){
							return;
						}
						data = setTimeValue([], 0, _this.maxSecond, '秒');
						updateNextDom(data, next); //秒

					}
					else{

						if(!next){
							return;
						}
						data = setTimeValue([], 0, 59, '秒');
						updateNextDom(data, next);//秒
					}
					break;		
			}

		}

		function updateNextDom(dataArr, nextEle){
			var str = '';
			dataArr.forEach(function(value){
				str += "<div class='scroller-item' data-value='"+ _this.delTimeText(value) +"'>"+ value +"</div>";
			});
			
			var content, item, className;

			if(nextEle){
				content = nextEle.querySelector('.scroller-content');
				content.innerHTML = str;
				_this.srollTo(nextEle, _this.INIT_TOP);
				item = content.querySelector('.scroller-item');
				className = item.getAttribute('class');
				item.setAttribute('class', className + ' scroller-selected');
			}
		}
		
	};
	t.initSecPostion = function(container, top){

		this.makeArray(container.querySelectorAll('.scroller-content')).forEach(function(dom){
			dom.style.webkitTransform = "translate3d(0px, " + top + "px, 0px)";
		});		
	};
	t.setInitTime = function(container){
	
		var _this = this;
		var results = this.defaults.initTime.match(/\d+/g);
		var time = [];		

		for(var i = 0, len = results.length; i < len; i++){
			time.push(results[i]);
		}
		
		this.makeArray(container.querySelectorAll('.scroller-content')).forEach(function(dom, index){

			var cur = time[index];
			var _dom = dom;
			_this.makeArray(dom.querySelectorAll('.scroller-item')).forEach(function(d, i){
			
				if( parseInt(d.getAttribute('data-value')) === parseInt(cur)){
					_this.setSelected(_dom, i);
					_this.srollTo(_dom.parentNode, -_this.__itemHeight * i + parseInt(_this.INIT_TOP));
				}
				
			});
		});
	};
	t.controlLimite = function(type){

		var _this = this;

		switch(type){
			case 'start':
				dateArr = _this.defaults.startTimeLimite.match(/\d+/g);
				_this.minYear = dateArr[0];
				_this.minMonth = dateArr[1];
				_this.minDay = dateArr[2];
				_this.minHour = dateArr[3];
				_this.minMinute = dateArr[4];				
			break;
			case 'end':
				dateArr = _this.defaults.endTimeLimite.match(/\d+/g);
				_this.maxYear = dateArr[0];
				_this.maxMonth = dateArr[1];
				_this.maxDay = dateArr[2];
				_this.maxHour = dateArr[3];
				_this.maxMinute = dateArr[4];
			break;
		}

		_this.YAER = setTimeValue([], _this.minYear, _this.maxYear, '年');
		_this.MONTH = setTimeValue([], _this.minMonth, _this.maxMonth, '月');
		_this.DAY = setTimeValue([], _this.minDay, _this.maxDay, '日');
		_this.HOURS = setTimeValue([], _this.minHour, _this.maxHour, '时');
		_this.MINUTES = setTimeValue([], _this.minMinute, _this.maxMinute, '分');

	};

	t.initEvent = function(){
		var _this = this;
		var mask = $Id('vux-popup-mask');

		var startX, startY, startTime;

		_this.targetDom.addEventListener('touchstart', function(e){
				
				startTime = e.timeStamp;
				var touches = e.changedTouches[0];
				startX = touches.pageX;
				startY = touches.pageY;
		}, !1);

		_this.targetDom.addEventListener('touchend', function(e){
			
			var touches = e.changedTouches[0];
			var endX = touches.pageX;
			var endY = touches.pageY;
			var pos = Math.sqrt(Math.pow((endY - startY ), 2), Math.pow((endX - startX ), 2));

			if(pos <= 2 && e.timeStamp - startTime < 200){
				_this.showDialog(_this.dialog, mask);	
			}		
		}, !1);

		mask.addEventListener('touchstart', function(e){
			e.preventDefault();
			_this.hideDialog(_this.dialog, mask);
			
		}, !1);

		_this.values = [];
		var values = [];

		//完成 获取选中的省份
		_this.dialog.querySelector('.vux-complete').addEventListener('touchstart', function(e){
			e.preventDefault();
			var flexboxItem = _this.container.querySelectorAll('.vux-flexbox-item');
			_this.values.length = values.length = 0;
			_this.makeArray(flexboxItem).forEach(function(item){
				var scrollerItem = item.querySelectorAll('.scroller-item');
				_this.makeArray(scrollerItem).forEach(function(dom){
					if(_this.hasClass(dom, 'scroller-selected')){
						if(dom.textContent !== '--'){
							values.push(dom.getAttribute('data-value'));
							_this.values.push(dom.textContent);
						}						
					}
				});
			});

			_this.toValue.innerHTML = _this.values.toString().replace(/\,/g,'');

			_this.hideDialog(_this.dialog, mask);
			if(_this.defaults.callBack){
					_this.defaults.callBack(_this.values, values);
				}	
			return false;
		}, !1);

		//取消
		_this.dialog.querySelector('.vux-cancle').addEventListener('touchstart', function(){
			_this.hideDialog(_this.dialog, mask);
		}, !1);
	};
	t.showDialog = function(dialog, mask){
		
		this.addClass(dialog, 'vux-animated');
		this.addClass(mask, 'vux-popup-show');
	};
	t.hideDialog = function(dialog, mask){

		this.removeClass(dialog, 'vux-animated');
		this.removeClass(mask, 'vux-popup-show');
	};

	t.makeArray = function (obj) {
		return Array.prototype.slice.call(obj,0);
	};
	t.getScrollTop = function (container) {

		var scrollTop = getComputedStyle(container.querySelector('.scroller-content'), 'webkitTransform');
		var reg = /\,\s*(\-?\d+[.\d]*)\)$/;
		var results = reg.exec(scrollTop)[1];

		return results ? parseFloat(results) : 0;
	};
	t.insertContainer = function (){

		var id = this.secContainerId = this.getId();

		var header = ""
			+ "<div class='vux-popup-picker-header'>"
				+ "<div class='vux-flexbox vux-flex-row'>"
			 	  + "<div class='vux-flexbox-item vux-head-left'>"
			 	    + "<div class='vux-cancle'>取消</div>"
			 	  + "</div>"
			 	  + "<div class='vux-flexbox-item vux-head-right'>"
			 	    + "<div class='vux-complete'>完成</div>"
			 	  + "</div>"
			 	+ "</div>"
		 	+ "</div>";
		 	
		var container = ""
			+"<div class='vux-popup-dialog'>"
			 + "<div class='vux-popup-picker-container'>"
			 + header
				 + "<div class='vux-picker'>"
					 + "<div class='vux-flexbox vux-flex-row' id='"+ id +"'>"
					 + "</div>"
				 + "</div>"
			 + "</div>"
			+"</div>";

		return this.strToDom(container);
	};

	//生成随机 id 
	t.getId = function(){
		return 'vux-picker-' + Math.random().toString(36).substring(2, 10);
	};
	t.strToDom = function(str){
		var div = doc.createElement("div");
		div.innerHTML  = str;

		return div.firstChild;
	};
	t.getValue = function(container, index){
			return container.querySelectorAll('.scroller-item')[index].getAttribute('data-value');
	};
	t.hasClass = function(obj, cls){
		return obj.className && obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	};
	t.addClass = function (obj, cls){
		if (!this.hasClass(obj, cls)) {
			obj.className += " " + cls; 
		}
	};
	t.removeClass = function (obj, cls) {
		 if (this.hasClass(obj, cls)) {  
	        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');  
	        obj.className = obj.className.replace(reg, ' ').trim();  
	    }  
	};
	t.delTimeText = function(time){
		return time.match(/^\d*/)[0];
	};

	var controllEvent = {

		__isStart: !1,
		__isDragging: !1,
		__initTop: 0,
		__enableScrollY: !1,
		__minScrollTop: 0,
		__maxScrollTop: 0,
		__maxPosInit: !1,
		__minPosInit: !1,
		__itemHeight: 0,
		__isSingleTouch: !1,
		__isDecelerating: !1,//减速
		__setDimensions: function (container) {
			var scrollerContent = container.querySelector('.scroller-content');
			var sHeight = scrollerContent.offsetHeight;

			var scrollerIndicator = container.querySelector('.scroller-indicator');
			var top = getComputedStyle(scrollerIndicator,'top').replace(/px/,'');
			var indicatorHeight = scrollerIndicator.offsetHeight;

			this.__minPosTop = parseFloat(top);
			this.__maxPosTop = sHeight - parseFloat(top) - indicatorHeight;
			this.__minScrollTop = parseFloat(top) + indicatorHeight/2 - .1;
			this.__maxScrollTop = sHeight - parseFloat(top) - indicatorHeight/2 - .5;

		},
		__doTouchStart: function (container, touches, time) {
			var _this = this;
			if(null == touches.length){
				return;
			}

			var top, isSingle = 1 === touches.length;
			top = isSingle ? touches[0].pageY : Math.abs(touches[0].pageY + touches[1].pageY) / 2;

			_this.__initTop = _this.getScrollTop(container);
			_this.__setDimensions(container);

			_this.__isDecelerating = !1;
			_this.__initialTouchTop = top;
			_this.__lastTouchTop = top;
			_this.__isStart = !0;
			_this.__isDragging = !isSingle;
			_this.__isSingleTouch = isSingle;
			_this.positions = [];

			
			_this.makeArray(_this.container.children).forEach(function(dom, index){
				(dom === container) && (_this._index = index + 1);				
			});
		},
		__doTouchMove: function (container, touches, time) {
			var _this = this;
			var pos;

			if(_this.__isStart){				
				pos = 2 === touches.length ? Math.abs(touches[0].pageY + touches[1].pageY) / 2 : touches[0].pageY;
			}
			var i = _this.positions;
			if(_this.__isDragging){
				var dis = pos - _this.__lastTouchTop;

	            var top = _this.__initTop;

	            if(_this.__enableScrollY){	            	
	            	top += dis;

	            	if(top < -_this.__maxScrollTop){
	            		top = -_this.__maxScrollTop;
	            		_this.__maxPosInit = !0;
	            	}
	            	if(top > _this.__minScrollTop){
	            		top = _this.__minScrollTop;
	            		_this.__minPosInit = !0;
	            	}

	            	i.length > 40 && i.splice(0, 20);
	            	i.push(top, time);

	            	_this.srollTo(container, top);
	            	_this.__initTop = top;
	            }

	            _this.__isDragging = !0;
	              
			}else{
				
				var maxMovePos = 5;
				var distance = Math.abs(pos - _this.__initialTouchTop);

				i.push(_this.__initTop, time);
	            _this.__enableScrollY = distance >= 0;	                     
	            _this.__isDragging = _this.__enableScrollY && distance > maxMovePos;	          
			}
			
			_this.__lastTouchTop = pos;
			_this.__lastTouchMove = time;
		},
		__doTouchEnd: function (container, touches, time) {		
			var _this = this;

			_this.containerT = container;
			if(_this.__isStart){				
				if(_this.__isStart = !1, _this.__isDragging && (_this.__isDragging = !1, time - _this.__lastTouchMove <= 100)){
					//加速运动
					//console.log('加速运动')
					 for (var n = _this.positions, o = n.length - 1, r = o, i = o; i > 0 && n[i] > _this.__lastTouchMove - 100; i -= 2){
                        r = i;                               
                     }
                     if(r !== o){
                     	var u = n[o] - n[r],s = _this.__initTop - n[r - 1];

                        _this.__decelerationVelocityY = s / u * (1e3 / 60);
                        var l = 4;
                        Math.abs(_this.__decelerationVelocityY) > l && (_this.__isDecelerating = !0);

                        var maxIndex = container.querySelectorAll('.scroller-item').length - 1;

                        var index = Math.round((_this.__decelerationVelocityY*Math.random(10)*10 + _this.__initTop - parseFloat(_this.INIT_TOP))/_this.__itemHeight);                       

                        if(index >= 0){
                        	index  = 0;
                        }else if(index < -maxIndex){
                        	index = -maxIndex;
                        }
                        _this.moveIndex = index;
                        
                        _this.srollTop(container, _this.__initTop);
                     }                                     
				}
				
				if(!_this.__isDecelerating){
					//减速运动
					//console.log('减速运动');
					_this.moveIndex = Math.round((_this.__initTop - parseFloat(_this.INIT_TOP))/ _this.__itemHeight);		
					_this.srollTop(container, _this.__initTop);
				}
				
			}
		},
		srollToAnimate: function(){
			var _this = this;
			var speed = 1;
			var ani = _this.ani;
			var top = Tween.Quad.easeOut(ani.t, ani.b, ani.c - ani.b, ani.d);
			_this.srollTo(_this.containerT, top);

			//动画结束后，开始更新数据
			if(top === _this.finalTop){
				var value = _this.getValue(_this.containerT, Math.abs(_this.moveIndex));
				_this.updateDom(_this.containerT);
			}

			if(ani.t < ani.d){ 
		    	ani.t += speed; 
		    	requestAnimationFrame(_this.srollToAnimate.bind(_this)); 
		    }  
		},
		srollTop: function(container, top){
			var _this = this;
			
			var index = _this.moveIndex;
			_this.finalTop = index * _this.__itemHeight + parseFloat(_this.INIT_TOP);
			
			_this.setSelected(container, Math.abs(index));

			_this.ani = {};
			_this.ani.b = Math.ceil(_this.__initTop);
			_this.ani.c = index * _this.__itemHeight + parseFloat(_this.INIT_TOP);
			_this.ani.d = 20;
			_this.ani.t = 0;			
			
			_this.srollToAnimate();
		},
		srollTo : function(container, top){
			container.querySelector('.scroller-content').style.webkitTransform = "translate3d(0px, " + top + "px, 0px)";
		}
	};

	//微信不支持此方法
	//Object.assign(t, controllEvent);
	Object.keys(controllEvent).forEach(function(key){			
			t[key] = controllEvent[key]
		}.bind(this));
	
	win.DateTime = DateTime;
})(window, document);
