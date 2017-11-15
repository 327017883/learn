
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
			callBack: null
		};		

		Object.keys(options).forEach(function(key){			
			this.defaults[key] = options[key]
		}.bind(this));

		this.initDate();		

		//开始日期限制
		if(this.defaults.startTimeLimite !== ''){
			this.startTimeLimite();
		}

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

	t.initDate = function(){
		var currentTime = new Date();
		var curYear = currentTime.getFullYear();
		this.initMinHour = 0;
		this.initMaxHour = 23;
		this.initMinMinute = 0;
		this.initMaxMinute = 59;

		this.YAER = setTimeValue([], curYear - 10 , curYear + 5, '年');
		this.MONTH = setTimeValue([], 1, 12, '月');

		if(this.defaults.hoursRange !== ''){

			var hoursRange = this.defaults.hoursRange.match(/\d+/g);
			this.initMinHour = parseInt(hoursRange[0]);
			this.initMaxHour = parseInt(hoursRange[1]);
			this.HOURS = setTimeValue([], this.initMinHour, this.initMaxHour , '时');			
		}else{
			this.HOURS = setTimeValue([], 0, 23, '时');
		}
		
		this.MINUTES = setTimeValue([], 0, 59, '分');
		this.SECOND = setTimeValue([], 0, 59, '秒');
	};
	t.initData = function (){

		for(var i = 1; i <= this.nextLevel; i++){
			this.initSecDom(i, i === 3);
		}

	};

	t.initSecDom = function (key, day){

		var data;

		if(day){//为天，进行判断
			data = this.timeBranch[key].bind(this)(this.delTimeText(this.YAER[0]), this.delTimeText(this.MONTH[0]), this.defaults.startTimeLimite !== '' && this.isMinDay);
	
		}else{
			data = this.timeBranch[key].bind(this)();
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
		3: function(year, month, isLimite){
			return this.getDaysData(year, month, isLimite);
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
	t.getDaysData = function(year, month, isLimite){
		
		var start = 1;

		isLimite && (start = this.minDay);

		switch(month){
			case '01':
			case '03':
			case '05':
			case '07':
			case '08':
			case '10':
			case '12':
				return setTimeValue([], start, 31, '日');
			case '04':
			case '06':
			case '09':
			case '11':
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
		return this.SECOND;
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

		switch(this._index){
			case 1:
				next = next.nextSibling;
				nextDom(this._index);
				break;
			case 2:
			case 3:
			case 4:
				nextDom(this._index);	
				break;		
			default:
				return false;
		}

		function nextDom(curIndex){

			var year, month, day, hour, minite, second;
			var item = _this.container.querySelectorAll('.vux-flexbox-item');

			_this.makeArray(item).forEach(function(dom, index){
				_this.makeArray(dom.querySelectorAll('.scroller-item')).forEach(function(m){
					if(m.getAttribute('class').indexOf('scroller-selected') > -1){

						var val = m.getAttribute('data-value');
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

			if(_this.minYear){
				switch(curIndex){
					case 1:
						if(parseInt(year) === _this.minYear && parseInt(month) === _this.minMonth &&  parseInt(day) === _this.minDay){
							if(!_this.isMinHour){
									data = setTimeValue([], _this.minHour, _this.initMaxHour, '时');
									updateNextDom(data, next.nextSibling);
									_this.isMinHour = !0;
							}
						}
						else if(parseInt(year) === _this.minYear){

								if(_this.isMinMonth){

									if(parseInt(month) === _this.minMonth){
										data = _this.timeBranch[3].bind(_this)(year, _this.minMonth, !0);
										if(data.length === 0){return !1;}
										updateNextDom(data, next);
										_this.isMinDay = !0;
										data = setTimeValue([], _this.initMinHour, _this.initMaxHour, '时');
										if(data.length === 0){return !1;}
										updateNextDom(data, next.nextSibling);
										_this.isMinHour = !1;
									}else{
										data = _this.timeBranch[3].bind(_this)(year, month, !1);
										if(data.length === 0){return !1;}
										updateNextDom(data, next);
										_this.isMinDay = !1;
									}

								}else{
									data = setTimeValue([], _this.minMonth, 12, '月');
									if(data.length === 0){return !1;}
									updateNextDom(data, next.previousSibling);
									_this.isMinMonth = !0;

									data = _this.timeBranch[3].bind(_this)(year, month, !0);
									if(data.length === 0){return !1;}
									updateNextDom(data, next);
									_this.isMinDay = !0;

									data = setTimeValue([], _this.minHour, _this.initMaxHour, '时');
									if(data.length === 0){return !1;}
									updateNextDom(data, next.nextSibling);
									_this.isMinHour = !0;

									data = setTimeValue([], _this.minMinute, _this.initMaxMinute, '分');
									if(data.length === 0){return !1;}
									updateNextDom(data, next.nextSibling.nextSibling);
									_this.isMinMinute = !0;
								}
						}else{
								if(_this.isMinMonth){
									data = setTimeValue([], 1, 12, '月');
									if(data.length === 0){return !1;}
									updateNextDom(data, next.previousSibling);
									_this.isMinMonth = !1;
								}

								if(_this.isMinDay){
									data = _this.timeBranch[3].bind(_this)(year, '01', !1);
									if(data.length === 0){return !1;}
									updateNextDom(data, next);
									_this.isMinDay = !1;
								}else{
									data = _this.timeBranch[3].bind(_this)(year, month, !1);
									if(data.length === 0){return !1;}
									updateNextDom(data, next);
								}

								if(_this.isMinHour){
									data = setTimeValue([], _this.initMinHour, _this.initMaxHour, '时');
									if(data.length === 0){return !1;}
									updateNextDom(data, next.nextSibling);
									_this.isMinHour = !1;
								}
							
								if(_this.isMinMinute){
									data = setTimeValue([], _this.initMinMinute, _this.initMaxMinute, '分');
									if(data.length === 0){return !1;}
									updateNextDom(data, next.nextSibling.nextSibling);
									_this.isMinMinute = !1;
								}
						}

						break;
					case 2:

						if(parseInt(year) === _this.minYear && parseInt(month) === _this.minMonth &&  parseInt(day) === _this.minDay){
							
							if(!_this.isMinHour){
								data = setTimeValue([], _this.minHour, _this.initMaxHour, '时');
								if(data.length === 0){return !1;}
								updateNextDom(data, next.nextSibling);
								_this.isMinHour = !0;
							}
						}else if(parseInt(year) === _this.minYear && parseInt(month) === _this.minMonth){
							
							if(!_this.isMinDay){						
								data = _this.timeBranch[3].bind(_this)(year, month, !0);
								if(data.length === 0){return !1;}
								updateNextDom(data, next);
								_this.isMinDay = !0;
							}

							if(!_this.isMinHour){
								data = setTimeValue([], _this.minHour, _this.initMaxHour, '时');
								if(data.length === 0){return !1;}
								updateNextDom(data, next.nextSibling);
								_this.isMinHour = !0;
							}
							if(!_this.isMinMinute){
								data = setTimeValue([], _this.minMinute, _this.initMaxMinute, '分');
								if(data.length === 0){return !1;}
								updateNextDom(data, next.nextSibling.nextSibling);
								_this.isMinMinute = !0;
							}	
							
						}else if(parseInt(year) === _this.minYear){
														
							data = _this.timeBranch[3].bind(_this)(year, month, !1);
							if(data.length === 0){return !1;}
							updateNextDom(data, next);
							_this.isMinDay = !1;

							if(_this.isMinHour){
								data = setTimeValue([], _this.initMinHour, _this.initMaxHour, '时');
								if(data.length === 0){return !1;}
								updateNextDom(data, next.nextSibling);
								_this.isMinHour = !1;	
							}
							if(_this.isMinMinute){
								data = setTimeValue([], _this.initMinMinute, _this.initMaxMinute, '分');
								if(data.length === 0){return !1;}								
								updateNextDom(data, next.nextSibling.nextSibling);
								_this.isMinMinute = !1;
							}
													

						}else{

							if(_this.isMinDay){
								data = _this.timeBranch[3].bind(_this)(year, month, !1);
								if(data.length === 0){return !1;}
								updateNextDom(data, next);	
								_this.isMinDay = !1;
							}else{
								data = _this.timeBranch[3].bind(_this)(year, month, !1);
								if(data.length === 0){return !1;}
								updateNextDom(data, next);	
							}
							
							if(_this.isMinHour){
								data = setTimeValue([], _this.initMinHour, _this.initMaxHour, '时');
								if(data.length === 0){return !1;}
								updateNextDom(data, next.nextSibling);
								_this.isMinHour = !1;
							}
							
						}
						break;
					case 3:
						if(parseInt(year) === _this.minYear && parseInt(month) === _this.minMonth &&  parseInt(day) === _this.minDay){

							if(!_this.isMinHour){
									data = setTimeValue([], _this.minHour, _this.initMaxHour, '时');
									if(data.length === 0){return !1;}
									updateNextDom(data, next);
									_this.isMinHour = !0;
							}
							if(!_this.isMinMinute){
								data = setTimeValue([], _this.minMinute, _this.initMaxMinute, '分');
								if(data.length == 0){return;}
								updateNextDom(data, next.nextSibling);
								_this.isMinMinute = !0;
							}

						}else if(parseInt(year) === _this.minYear && parseInt(month) === _this.minMonth){

							if(parseInt(day) !== _this.minDay){
								if(_this.isMinHour){
									data = setTimeValue([], _this.initMinHour, _this.initMaxHour, '时');
									if(data.length === 0){return !1;}
									updateNextDom(data, next);
									_this.isMinHour = !1;
								}
								if(_this.isMinMinute){
									data = setTimeValue([], _this.initMinMinute, _this.initMaxMinute, '分');
									if(data.length === 0){return !1;}									
									updateNextDom(data, next.nextSibling);
									_this.isMinMinute = !1;
								}								
							}					
						}
						break;
					case 4:
						
						if(parseInt(year) === _this.minYear && parseInt(month) === _this.minMonth &&  parseInt(day) === _this.minDay && parseInt(hour) === _this.minHour){
							if(!_this.isMinMinute){
								data = setTimeValue([], _this.minMinute, _this.initMaxMinute, '分');
								if(data.length === 0){return !1;}
								updateNextDom(data, next);
								_this.isMinMinute = !0;
							}
						}else{
							data = setTimeValue([], _this.initMinMinute, _this.initMaxMinute, '分');
							if(data.length === 0){return !1;}
							updateNextDom(data, next);
							_this.isMinMinute = !1;
						}
					default:
						return;
				}
			}else{
				if(curIndex !== 3){
					data = _this.timeBranch[3].bind(_this)(year, month);
					if(data.length === 0){return !1;}
					updateNextDom(data, next);
				}
				return;						
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
			
				if(d.getAttribute('data-value') === cur){
					_this.setSelected(_dom, i);
					_this.srollTo(_dom.parentNode, -_this.__itemHeight * i + parseInt(_this.INIT_TOP));
				}
				
			});
		});
	};
	t.startTimeLimite = function(){

		var _this = this;
		var dateStr = _this.defaults.startTimeLimite.match(/\d+/g);
		var initTime;

		if(_this.defaults.initTime){
			initTime =   _this.defaults.initTime.match(/\d+/g);
		}

		dateStr.forEach(function(date, index){

			switch(index){
				case 0:
					_this.minYear = parseInt(date);
					_this.isMinYear = !0;
					_this.YAER = setTimeValue([], _this.minYear, _this.minYear + 5, '年');								
					break;
				case 1:
					_this.minMonth = parseInt(date);
					
					if(initTime && parseInt(initTime[0]) === _this.minYear && parseInt(initTime[1]) === _this.minMonth){
						_this.MONTH = setTimeValue([], _this.minMonth, 12, '月');
						_this.isMinMonth = !0;
					}else{
						_this.MONTH = setTimeValue([], 1, 12, '月');
						_this.isMinMonth = !1;
					}
					break;
				case 2:
					_this.minDay = parseInt(date);
					if(initTime && _this.isMinMonth && parseInt(initTime[2]) === _this.minDay ){
						_this.isMinDay = !0;					
					}else{
						_this.isMinDay = !1;
					}				
					break;
				case 3:
					// 8
					_this.minHour = parseInt(date) ;
					//console.log(_this.minHour)
					if(initTime && _this.isMinDay && parseInt(initTime[3]) >= _this.minHour ){						
						_this.HOURS = setTimeValue([], _this.minHour, _this.initMaxHour, '时');
						_this.isMinHour = !0;
					}else{
						_this.HOURS = setTimeValue([], _this.initMinHour, _this.initMaxHour, '时');
						_this.isMinHour = !1;
					}
					break;
				case 4:
					_this.minMinute = parseInt(date);
					if(initTime && _this.isMinHour && parseInt(initTime[4]) >= _this.minMinute){
						_this.MINUTES = setTimeValue([], _this.minMinute, _this.initMaxMinute, '分');
						_this.isMinMinute = !0;
					}else{
						_this.MINUTES = setTimeValue([], _this.initMinMinute, _this.initMaxMinute, '分');
						_this.isMinMinute = !1;
					}							
					break;
				case 5:
					_this.minSecond = parseInt(date);
					_this.isMinSecond = !0;
					_this.SECOND = setTimeValue([], _this.minSecond, 59, '秒');
					break;
			}
		});
	},
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
