;(function(win, doc){
	'use strict';

	var Tween = {
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

	function getComputedStyle(el, attr){
		var n;
		return n = win.getComputedStyle(el), n[attr];
	}

	function isCurrent(e){
		var id = '#scacle-image';
		var target = e.target;
		if('#' + target.getAttribute('id') === id){ 
			return !0;
		}
		return !1;
	}

	function getFingers(e){
		return e = e.touchEvent || e, e.changedTouches.length;	
	}

	function ScacleImage(options){
		this.init(options);
	}

	var s = ScacleImage.prototype;

	s.init = function(options){

		this.options = {

		}

		for(var i in options){
			this.options[i] = options[i]
		}
		
		this.targetDom = doc.querySelector(this.options.target);
		this.bindEvent();
	};

	s.bindEvent = function(){

		var _this = this;

		//绑定 目标图片 tap 事件
		var targetImage = new Hammer(this.targetDom);

		targetImage.on('tap', function(e){			
			_this.showMask(e.target);
		});

		//代理绑定放大缩小图片事件
		var docHammer = new Hammer(doc);

		//单击
		docHammer.on('tap', s.handleEvent.bind(this));
		
		//放大和缩小
		docHammer.add(new Hammer.Pinch());
		docHammer.on('pinchstart', s.handleEvent.bind(this));	
		docHammer.on('pinchin', s.handleEvent.bind(this));
		docHammer.on('pinchout', s.handleEvent.bind(this));
		docHammer.on('pinchmove', s.handleEvent.bind(this));
		docHammer.on('pinchend', s.handleEvent.bind(this));

		//移动
		docHammer.on('panstart', s.handleEvent.bind(this));
		docHammer.on('panmove', s.handleEvent.bind(this));
		docHammer.on('panend', s.handleEvent.bind(this));
		docHammer.on('pancancel', s.handleEvent.bind(this));
		
	};

	s.handleEvent = function(e){

		var _this = this;
		_this.target = e.target;
		var o = _this.posInfor;

		if(!isCurrent(e)){
			return;
		}

		switch(e.type){
			case 'tap':
				_this.hideMask();
				break;
			case 'pinchstart':

				e.target.style.transition = '';
				o.startScale = parseFloat(getComputedStyle(e.target, 'transform').match(/\d+(\.\d+)*/g)[0]);
				

				_this.changeTransform(e.target, o.startScale, 0, 0, e.center.x, e.center.y);
				break;
			case 'pinchin':
				if(e.scale < 1){					
					o.moveScale = o.startScale - (1 - e.scale);
				}
				o.isPinchout = !1;
				o.isPinchin = !0;	
				break;
			case 'pinchout':
				if(e.scale > 1){
					o.moveScale = o.startScale + e.scale - 1;
				}
				o.isPinchout = !0;
				o.isPinchin = !1;					
				break;
			case 'pinchmove':

				var minX = e.pointers[0].pageX > e.pointers[1].pageX ? e.pointers[1].pageX : e.pointers[0].pageX;
				var centerX	= (Math.abs(e.pointers[0].pageX - e.pointers[1].pageX)/2) + minX;

				var minY = e.pointers[0].pageY > e.pointers[1].pageY ? e.pointers[1].pageY : e.pointers[0].pageY;
				var centerY	= (Math.abs(e.pointers[0].pageY - e.pointers[1].pageY)/2) + minY;

				o.centerArr.push({x: centerX, y: centerY});
				o.centerArr.splice(1);
				if(e.scale > o.maxScale){
					o.maxCenterX = o.centerArr[0].x;
					o.maxCenterY = o.centerArr[0].y;
				}				

				_this.changeTransform(e.target, o.moveScale, 0, 0, centerX, centerY);				
				break;	
			case 'pinchend':
				var scale = e.scale;

				e.target.style.transition = 'all .5s';

				if(o.moveScale < o.initScale){
					o.isMove = !1;
					o.moveScale = 1;
					_this.changeTransform(e.target, o.moveScale, 0, 0, '50%', '50%');		
				}
				if(o.moveScale > o.maxScale){
					o.isMove = !0;
					o.moveScale = o.maxScale;
					_this.changeTransform(e.target, o.moveScale, 0, 0, o.maxCenterX, o.maxCenterY);
				}else{
					o.isMove = !0;
				}			
						

				break;					
			case 'panstart':
				e.target.style.transition = '';

				var origin = getComputedStyle(e.target, 'transform');
				var arr = origin.match(/\-*\d+(\.\d+)*/g);
				o.moveScale = o.nowScale = parseFloat(arr[0]);
				o.initX = parseFloat(arr[4])/o.nowScale;
				o.initY = parseFloat(arr[5])/o.nowScale;
				break;
			case 'panmove':

				_this.getMaxLeft(e.target);

				if(_this.isTranslate){//左右平移
					_this.changeTransform(e.target, o.nowScale, e.deltaX/o.nowScale + o.initX, 0);
				}else{
					_this.changeTransform(e.target, o.nowScale, e.deltaX/o.nowScale + o.initX, o.moveScale == 1 ? 0 : e.deltaY/o.nowScale + o.initY);
				}							
				break;
			case 'panend':
			case 'pancancel':
				e.target.style.transition = '';
				
				

				var endPos = getComputedStyle(e.target, 'transform');
				var posArr = endPos.match(/\-*\d+(\.\d+)*/g);
				var posX = parseFloat(posArr[4]);
				_this.posY = parseFloat(posArr[5]);
				
				_this.ani = {
					t: 0,
					// b: posX,
					// c: 0,
					d: 20
				};	
				if(!_this.isTranslate){
					if(posX > 0 || posX < 0){
						_this.ani.b = posX;	
						_this.ani.c = 0;															
						_this.srollToAnimate();						
					}
				}else{
					if(posX > _this.maxLeft){
						_this.ani.b = posX/o.moveScale;
						_this.ani.c = _this.maxLeft/o.moveScale;
						_this.srollToAnimate();
					}
					else if(posX < -_this.maxLeft){
						console.log(posX)
						_this.ani.b = posX + win.innerWidth;
						_this.ani.c = -_this.maxLeft/o.moveScale;
						_this.srollToAnimate();
					}
				}
				break;
			default:
				return;
		}
	},
	s.srollToAnimate = function(){

		var _this = this;
		var speed = 1;
		var p = _this.ani;

		var left = Tween.Quad.easeOut(p.t, p.b, p.c - p.b, p.d);
	
		_this.changeTransform(_this.target, _this.posInfor.moveScale, left, _this.posY/_this.posInfor.moveScale);

		if(p.t < p.d){ 
	    	p.t += speed;
	    	requestAnimationFrame(_this.srollToAnimate.bind(this)); 
	    }  
	};
	s.getMaxLeft = function(target){

		var _this = this;

		var winH = win.innerHeight;
		var winW = win.innerWidth;

		var o = _this.posInfor;
		
		_this.scaleWidth = parseInt(getComputedStyle(target, 'width')) * o.moveScale;
		_this.scaleHeight = parseInt(getComputedStyle(target, 'height')) * o.moveScale;
		_this.maxLeft = ( _this.scaleWidth - target.width)/2;
		

		if(_this.scaleWidth > winW && _this.scaleHeight > winH){
			_this.isTranslate = !1; //还原到屏幕左上角
		}else{
			_this.isTranslate = !0;//只能左右移动
		}
	};
	s.posInfor = {
		initScale: 1, //初始放大比例
		maxScale: 3,
		moveScale: 1,
		isTranslate: !0,//是否可平移
		startScale: 0,
		isMove: !0,//是否可移动
		centerArr: [],//当move时，存放center数据
		maxCenterX: 0, //当放大比例大于 最大比例时，记录 中心位置的距离
		maxCenterY: 0, //当放大比例大于 最大比例时，记录 中心位置的距离
		initX: 0, // 图片matrix 的 x 坐标 
		initY: 0, // 图片matrix 的 y 坐标
	};
	s.showMask = function(image){

		var src = image.getAttribute('src');
		var img = '<img id="scacle-image" src="' + src + '">', div = doc.createElement('div');
		div.className = 'all-image-mask'
		div.innerHTML = img;

		doc.body.appendChild(div);
	};
	s.hideMask = function(){
		var mask = doc.querySelector('.all-image-mask');
		mask.parentNode.removeChild(mask);
	};
	s.changeTransform = function(target, scale, x, y, centerX, centerY){
		
		target.style.webkitTransform = 'scale('+ scale +') translate3d('+ x +'px, '+ y +'px, 0)';
		target.style.webkitTransformOriginX = ''+ centerX +'';
		target.style.webkitTransformOriginY = ''+ centerY +'';
	};
////////////////////////////暂未用到///////////////////////////////////
	s.htmlToDom = function(html){
		var div = doc.createElement('div');
		return div.innerHTML = html, div.firstElementChild;
	};

	win.ScacleImage = ScacleImage;
})(window, document)