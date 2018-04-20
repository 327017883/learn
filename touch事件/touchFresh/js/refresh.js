;(function(win, doc){
	"use strict";

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

	var Refresh = function(container, options){
		return new Refresh.init(container, options);
	};

	var o = Refresh.prototype;

	o.bindEvent = function(){

		this.scrollDom.addEventListener('touchstart', this, !1);

		this.scrollDom.addEventListener('touchmove', this, !1);

		this.scrollDom.addEventListener('touchend', this, !1);
		this.scrollDom.addEventListener('touchcancel', this, !1);
	};

	o.status = {
		startPosX: 0,
		loadData: !1, //是否可以加载数据
		hasData: !0//请求成功，是否有数据
	};

	o.handleEvent = function(e){
		var p = this.status, touches = e.touches, _this = this;
		switch(e.type){
			case 'touchstart':
				e.preventDefault();

				var isSingle = 1 === touches.length;				
				p.startPosX = isSingle ? touches[0].pageY : Math.abs(touches[0].pageY + touches[1].pageY)/2;

				p.initTop = _this.getTop();
				_this.setDimensions();
				
				_this.refreshDown = _this.conainer.querySelector('.refresh-down');

				p.isStart = !0;
				p.positions = [];							
				break;
			case 'touchmove':
				console.log()
				var pos, i = p.positions;				
				if(p.isStart){
					pos = 1 === touches.length ? touches[0].pageY : Math.abs(touches[0].pageY + touches[1].pageY)/2;
					
					var dis = pos - p.startPosX;
					var top = p.initTop;
					top += dis;

					var refreshDown = _this.refreshDown;
					var ht = refreshDown.offsetHeight;

					if(top > _this.__limitedTop){

						_this.scroll(top);

						i.length > 40 && i.splice(0, 20);
	            		i.push(top, e.timeStamp);

						if(!p.hasData){
							p.loadData = !1;
							return;
						}

						if(top <= _this.__maxScrollTop && top >= _this.__maxScrollTop - ht){
							//console.log('在范围内移动');
						}
						_this.isDown && (top < _this.__maxScrollTop - ht) ? (p.loadData = !0, refreshDown.innerHTML = '松开手开始加载数据') : (p.loadData = !1, refreshDown.innerHTML = '上拉加载更多数据');						
					}										
				}
				break;
			case 'touchend':
			case 'touchcancel':
				var top = this.getTop();
				
				if(p.isStart){

					for (var n = p.positions, o = n.length - 1, r = o, i = o; i > 0 && n[i] > e.timeStamp - 100; i -= 2){
                        r = i;                               
                     }
					
					if(r !== o){
                     	var u = n[o] - n[r],s = top - n[r - 1];
                        _this.__decelerationVelocityY = s / u * (1e3 / 60);
                     }
					if(!p.loadData){
						if(top < _this.__maxScrollTop){
							_this.srollTop(top, _this.__maxScrollTop);
						}
						else if(top > _this.__minScrollTop){
							_this.srollTop(top, 0);
						}else{

						}										
					}
					if(_this.refreshDown.getAttribute('class').indexOf('refresh-loading') == -1){
						if(top < _this.__maxScrollTop){
							_this.srollTop(top, _this.__maxScrollTop - _this.refreshDown.offsetHeight);
						}
						else if(top > _this.__minScrollTop){
							_this.srollTop(top, 0);
						}
						_this.refreshDown.innerHTML = '暂无更多数据';
						p.hasData = !1;
					}
					if(p.loadData && p.hasData){
						_this.refreshDown.innerHTML = '数据加载中...';
						_this.options.pullDown && _this.options.pullDown();
						setTimeout(function(){
							_this.refreshDown.innerHTML = '上拉加载更多数据';
						}, 1000);
							
						p.loadData = !1;
					}
					p.isStart = !1;
				}
				break;
			default:
				return;
		}
	};
	o.setDimensions = function(){

		var heght = this.resultsDom.offsetHeight;
		var winH = win.innerHeight;

		this.__minScrollTop = 0;
		this.__maxScrollTop = winH - heght - this.initTop;
		this.__limitedTop = this.__maxScrollTop - winH/2;
	};
	o.srollToAnimate = function(){
		var _this = this;
		var speed = 1;
		var ani = _this.ani;
		var top = Tween.Quad.easeOut(ani.t, ani.b, ani.c - ani.b, ani.d);
		_this.scroll(top);

		if(ani.t < ani.d){ 
	    	ani.t += speed; 
	    	requestAnimationFrame(_this.srollToAnimate.bind(_this)); 
	    }  
	};
	o.srollTop = function(start, end){

		this.ani = {
			t: 0,
			d: 20,
			b: start,
			c: end
		};
		this.srollToAnimate();
	};
	o.scroll = function(top){
		this.scrollDom.style.webkitTransform = "translate3d(0px, " + top + "px, 0px)";
	};
	o.getTop = function(){
		var scrollTop = this.getComputedStyle(this.scrollDom, 'webkitTransform');
		var reg = /\,\s*(\-?\d+[.\d]*)\)$/;
		var results = reg.exec(scrollTop)[1];

		return results ? parseFloat(results) : 0;
	};
	o.getComputedStyle = function(el, attr){
		var n;
		return n = win.getComputedStyle(el), n[attr];
	};
	o.htmlToDom = function(html){
		var div = doc.createElement('div');
		div.innerHTML = html;
		return div.firstElementChild;
	};

	Refresh.init = function(container, options){

		this.options = {
			direction: 'down',
			pullDown: null,
			pullUp: null
		};

		for(var i in options){
			this.options[i] = options[i];
		}

		this.conainer = doc.querySelector(container);
		this.scrollDom = this.conainer.querySelector('.refresh-scroll');
		this.resultsDom = this.scrollDom.querySelector('ul');
		this.initTop = this.resultsDom.getBoundingClientRect().top;
		var directionHtml = {
			up: "<div class='refresh-up refresh-loading'>下拉加载更多数据</div>",
			down : "<div class='refresh-down refresh-loading'>上拉加载更多数据</div>"
		}

		var direction = this.options.direction;
		var directionDOm =  this.htmlToDom(directionHtml[direction]);
		var wH = win.outerHeight;

		if(direction == 'up'){
			this.isUp = !0;
			this.scrollDom.insertBefore(directionDOm, this.resultsDom);
		}else if(direction == 'down'){
			this.isDown = !0;
			this.scrollDom.appendChild(directionDOm);
			// var ht = this.resultsDom.offsetHeight;
			// var dh = directionDOm.offsetHeight;
			// if(ht + dh < wH){
			// 	directionDOm.innerHTML = '暂无更多数据';
			// }					
		}

		this.bindEvent();

	};
	Refresh.init.prototype = o;
		
	win.lib = win.lib || {};
	win.lib.Refresh = Refresh;
})(window, document);