
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

	function ThreeLevel(options) {
		this.init(options);		
	}

	var t = ThreeLevel.prototype;
	
	t.init = function (options) {
		
		//初始化默认配置
		this.defaults = {
			level: 1, //联动的层级
			callBack: null
		};		

		Object.keys(options).forEach(function(key){			
			this.defaults[key] = options[key];
		}.bind(this));

		this.target = this.defaults.target;
		this.idName = this.target.replace(/#/g,'');
		this.nextLevel = this.defaults.level;
		this.targetDom = $Id(this.idName);
		this.toValue = this.targetDom;
		this.data = this.transformData(this.defaults.data);

		var domContainer = this.insertContainer();

		//渲染容器到页面
		this.dialog = this.targetDom.parentNode.appendChild(domContainer);

		this.initData();
	
		this.container = $Id(this.secContainerId);

		var scrollerIndicator = this.container.querySelector('.scroller-indicator');

		var top = this.INIT_TOP =this.__initTop = getComputedStyle(scrollerIndicator,'top').replace(/px/,'');
		
		this.__itemHeight = parseFloat(getComputedStyle(scrollerIndicator,'height').replace(/px/,''));

		//初始化位置
		this.initSecPostion(this.container, top);

		var domA;
		(!!$Id('vux-popup-mask')) || (domA = document.createElement("div"),
			domA.className ='vux-popup-mask', 
			domA.id='vux-popup-mask', 
			doc.body.appendChild(domA));
		
		this.initEvent();
	};

	t.initData = function (){

		var key = 'parent';
		key = this.initSecDom(key, !0);

		while(--this.nextLevel){	
			key = this.initSecDom(key, !1);
		}
	};

	t.initSecDom = function (key, one){

		one = one || !1;
		//通过 键 判断是否属于 省/一级列表数据
		var allProvince = this.getKeyData(key, one);
		
		//获取数据的模板 并转化为dom节点
		var secTemObj = this.getSectionTem(allProvince);
		
		var secTem = secTemObj.secTem;

		//dom 节点绑定事件
		var dom = this.setSelected(this.bindSecEvent(secTem),0);
		
		//插入到相应的位置
		this.insertSecDom(dom);

		return this.getValue(dom, 0);
	};
	t.getKeyData = function (key, one) {

		//通过 key 来查找对应的数据
		//此数据结构有点特殊
		//查找一级数据，条件是 one 为 ture
		//查找一级之后的数据，one 为 false
		var province = [];

		if(one){
			this.data.forEach(function (obj) {
				if(!obj.hasOwnProperty(key)){
					province.push(obj);
				}		
			});
		}else{
			this.data.forEach(function (obj) {
				if(obj['parent'] == key){
					province.push(obj);
				}		
			});
		}
		return province;
	};

	t.getSectionTem = function (data) {

		var str = '';
		if(data.length === 0){
			data = [{
				value: '--',
				name: '--'
			}]
		}
		data.forEach(function(obj){
			str += "<div class='scroller-item' data-value='"+ obj.value +"'>"+ obj.name +"</div>"
		});

		var id = this.getId();

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
			secTem: this.strToDom(secStr),
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

	t.updateDom = function(container, key){

		var next = container.nextSibling;

		do{			
			var str = '';
			var data = this.getKeyData(key);

			if(data.length === 0){
				data = [{
					value: '--',
					name: '--'
				}];
			}

			data.forEach(function(obj){
				str += "<div class='scroller-item' data-value='"+ obj.value +"'>"+ obj.name +"</div>"
			});
			
			var content, item, className;
			if(next){
				content = next.querySelector('.scroller-content');
				content.innerHTML = str;
				this.srollTo(next, this.INIT_TOP);
				item = content.querySelector('.scroller-item');
				className = item.getAttribute('class');
				item.setAttribute('class', className + ' scroller-selected');
				key = this.getValue(next, 0);
			}
			
		}while(next && (next = next.nextSibling));
		
	}
	t.initSecPostion = function(container, top){

		t.makeArray(container.querySelectorAll('.scroller-content')).forEach(function(dom){
			dom.style.webkitTransform = "translate3d(0px, " + top + "px, 0px)";
		});		
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
				_this.toValue.innerHTML = _this.values.toString();
				_this.hideDialog(_this.dialog, mask);
				if(_this.defaults.callBack){
					_this.defaults.callBack(_this.values, values);
				}			
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

	t.transformData = function(data){
		return data;
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
	t.toggleClass = function(obj, cls){
		if(this.hasClass(obj,cls)){  
        	this.removeClass(obj, cls);  
	    }else{  
	        this.addClass(obj, cls);  
	    } 
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
					console.log('加速运动')
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
					console.log('减速运动');
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
				_this.updateDom(_this.containerT, value);
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
	
	win.ThreeLevel = ThreeLevel;
})(window, document);
