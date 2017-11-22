
(function(win){

	function RingGraph(container, options){

		this.container = container;

		var defaults = {
			color: ['#e6b244', '#7f0273', '#f97c6a', '#794d1a', '#b859bb', '#fc5a51', '#baf986', '#ef4c44', '#4ecde7', '#ef2d3a', '#83de30', '#91a3a3']
		};

		this.options = Object.assign(options, defaults);
		this.canvas = {};	
		this.events = [];
		this.id = 0;

		this.init();	

		window.addEventListener('resize', function(){

			this.canvas.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.container.removeChild(this.container.childNodes[0])
			this.init();

		}.bind(this), false);

	}

	RingGraph.prototype.init = function(){
		
		this.pathArr = [];

		this.pathArr.push({
			fn: function(){
				++this.id
			}.bind(this)
		})

		this.initCanvas();

		var options = this.options;

		if(options.legend) {
			this.legend();
		}

		if(options.series) {
			this.series();		
		}

		this.draw();

		//this.initEvent()	
	}

	RingGraph.prototype.initCanvas = function(){

		var dom = document.createElement('canvas');
		var ctx =  dom.getContext('2d');

		var bgColor = getStyle(this.container, 'backgroundColor');

		if(/^rgba\(0,0,0,0\)$/.test(bgColor.replace(/\s+/g, ''))){
			bgColor = '#fff';
		}
		
		var width = this.container.offsetWidth;
		var height = this.container.offsetHeight;

		dom.width = width;
		dom.height = height;

		this.canvas.dom = dom;
		this.canvas.ctx = ctx;
		this.canvas.width = width;
		this.canvas.height = height;
		this.canvas.bgColor = bgColor;
		this.container.appendChild(dom);
	}
	RingGraph.prototype.series = function(){

		var canvas = this.canvas;
		var options = this.options;
		var colors = options.color;
		var height = canvas.height;
		var width = canvas.width;
		var bgColor = canvas.bgColor;
		var ctx = canvas.ctx;
		var data = options.series.data;
		var that = this;

		var wMid = new jsExp(width + ' / 2').val; 
		var hMid = new jsExp(height + ' / 2').val;

		var r;
		if(width > height){
			r = hMid;
			
		}else{
			r = wMid;
		}

		var radius = options.series.radius.map(function(e){
			return new jsExp(parseFloat(e) + ' / 100').val;
		});	

		//外环圆
		var total = 0;
		data.forEach(function(d){
			total += d.value;
		});

		var start = new jsExp('2 * ' + Math.PI + ' * 0').val;

		var initDegTotal = 0;

		data.forEach(function(d, i){
					
			var initDeg = new jsExp(d.value + ' / ' + total + ' * 2 * ' + Math.PI).val;					

			initDegTotal += initDeg;
			var endDeg = initDegTotal;
					
			(function(start){						
				
				that.pathArr.push({

					fn: function(next){
																	
						var sDeg = start;
						var eDeg = new jsExp(sDeg + ' + .1').val;					
						run();

						function run(){					
							
							if(eDeg < endDeg){
								
								ctx.beginPath();
								ctx.strokeStyle = colors[i]
								ctx.fillStyle = colors[i]
								ctx.moveTo(wMid, hMid);				
								ctx.arc(wMid, hMid, new jsExp(r + ' * ' + radius[1]).val, sDeg, new jsExp(eDeg + ' + ' + .1).val);
								ctx.closePath();					
								ctx.fill();

								ctx.beginPath();
								ctx.strokeStyle = bgColor;
								ctx.fillStyle = bgColor;
								ctx.moveTo(wMid, hMid);
								ctx.arc(wMid, hMid, 10, 0, new jsExp('2 * ' + Math.PI).val);
								ctx.closePath();
								ctx.fill();

								ctx.beginPath();
								ctx.strokeStyle = bgColor;
								ctx.fillStyle = bgColor;
								ctx.moveTo(wMid, hMid);
								ctx.arc(wMid, hMid, new jsExp(r + ' * ' + radius[0]).val, new jsExp(sDeg + ' - .2').val, new jsExp(eDeg + ' + .2').val);
								ctx.closePath();
								ctx.fill();
															
								sDeg = eDeg;
								eDeg = new jsExp(sDeg + ' + .1').val
								
								if(that.id == 1){
									requestAnimationFrame(run);	
								}else if(that.id > 1){
									run();
								}					
															
							}else{
								eDeg = new jsExp(sDeg + ' + .1').val
								sDeg = endDeg;

								next && next();						
							}																													
						}
						
					},
					animate: true
				});	
			})(start)

			start = endDeg;
			
		})
		/*
			that.pathArr.push({
				fn: function(){

					ctx.beginPath();
					var txt = options.series.name;
					ctx.textBaseline = "middle";
					ctx.font = "30px Microsoft Yahei";
					ctx.textAlign = 'center';
					ctx.fillStyle = '#404040';
					ctx.fillText(txt, width/2, height/2);
					ctx.closePath();
				}
			});
		*/

	}

	RingGraph.prototype.legend = function(){

		var that = this;
		var legend = this.options.legend;
		var colors = this.options.color;
		var data = legend.data;
		ctx = this.canvas.ctx;

		var sX = 10;
		var sY = 10;
		var rW = 10;
		var rH = 10;

		data.forEach(function(txt, i){

			that.pathArr.push({

				fn: function(callback){

					ctx.beginPath();
					ctx.textBaseline = "hanging";
					ctx.textAlign = legend.x;
					ctx.font = '14px Microsoft Yahei';
					ctx.fillStyle = colors[i];				

					callback && callback()

					ctx.fillText(txt, sX+rW*2, (sY+rH)*i+ sY-2);			

					ctx.moveTo(sX, (sY+rH)*i+ sY);
					ctx.lineTo(sX + rW, (sY+rH)*i+ sY);
					ctx.lineTo(sX + rW, (sX + rW)*(i+1) );
					ctx.lineTo(sX, (sX + rW)*(i+1));

					ctx.fill();
					ctx.closePath();

				},
				type: 'txt',
				styles: {
					fontSize: 15,
					text: txt,
					x: sX,
					y: (sY+rH)*i+ sY,
					w: sX+rW*2,
					color: colors[i]
				}
			})		
		});
		
	}

	RingGraph.prototype.initEvent = function(){

		var that = this;

		var canvas = that.canvas;
		var dom = canvas.dom;

		dom.addEventListener("mousemove", function(e){ 

			var isOver = 0;
			var point = getCanvasPoint(e.pageX, e.pageY);	

			var ctx = canvas.ctx;

			ctx.clearRect(0, 0, canvas.width, canvas.height);		

			var arr = that.pathArr;

			that.pathArr.forEach(function(obj, i){			
				
				obj.fn();

				if(obj.type == 'txt'){				

					let styles = obj.styles;
					let color = ctx.fillStyle.colorRgb();

					if(point.x > styles.x && point.x < styles.w + ctx.measureText(styles.text).width && point.y > styles.y && point.y < styles.y + styles.fontSize){
						isOver++;		

						obj.fn(function(){
							ctx.fillStyle = '#000';
						});
					}
				}else{
					if(ctx.isPointInPath(point.x, point.y)){
						isOver++;	
					}
				}			
			});	

			if(isOver == 1){
				dom.className = 'cursor';
			}else{
				dom.className = '';
			}
		}, !1);
	}

	RingGraph.prototype.draw = function(){
		
		var canvas = this.canvas;
		canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);		

		canvas.ctx.fillStyle = canvas.bgColor;
		canvas.ctx.fillRect(0, 0, canvas.width, canvas.height);

		this.startFn();					
	}
	RingGraph.prototype.startFn = function(){

		var aniArr = [];

		this.pathArr.forEach(function(obj){
			if(obj.animate){
				aniArr.push(function(next){
					obj.fn(next);
				})
			}else{
				obj.fn()
			}					
		});

		function iterator(tasks) {

			var i = -1;
			var len = tasks.length;
			return function next() {
			    return ++i < len ? {value: tasks[i], key: i} : null;
			} 
		}

		function eachOfSeries(tasks, iteratee){

	        var nextElem = iterator(tasks);
	        var done = false;
	        var running = 0;

	        function iterateeCallback() {

	            running -= 1;            
	            replenish();
	           
	        }

	        function replenish () {
	        	
	            while (running < 1 && !done) {
	                var elem = nextElem();
	                if (elem === null) {
	                    return;
	                }
	                running += 1;
	                iteratee(elem.value, iterateeCallback);
	            }
	        }

	        replenish();
		}	

		function series(tasks){

			eachOfSeries(tasks, function (task, callback) {
		        task(callback);
		    });
		}

		series(aniArr);
		
	}
	RingGraph.prototype.setOption = function(){

	}

	RingGraph.prototype.addEvents = function(fn){
		this.events.push(fn);
	}

	function getStyle(element, attr){

	    let target;
	    // scrollTop 获取方式不同，没有它不属于style，而且只有document.body才能用
	    if (attr === 'scrollTop') { 
	        target = element.scrollTop;
	    }else if(element.currentStyle){
	        target = element.currentStyle[attr]; 
	    }else{ 
	        target = document.defaultView.getComputedStyle(element,null)[attr]; 
	    }

	    return target;
	    //在获取 opactiy 时需要获取小数 parseFloat
	    //return  NumberMode == 'float'? parseFloat(target) : parseInt(target);
	}

	function addEvent(elem, type, handler){

	    if(elem.addEventListener){

	        addEvent = function(elem, type, handler){

	            elem.addEventListener(type, handler, false);

	        }

	    }else if(elem.attachEvent){

	        addEvent = function(elem, type, handler){

	            elem.attachEvent("on"+type, handler);

	        }

	    }

	    return addEvent(elem,type,handler);

	} 
	function getRandomColor(){

		return "#"+("00000"+((Math.random()*16777215+0.5)>>0).toString(16)).slice(-6);
	} 

	function getCanvasPoint(x,y) { 

		var left = c.offsetLeft;
		var top = c.offsetTop;

		return { 
			x: x - left, 
			y: y - top 
		} 
	}

	var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
	/*RGB颜色转换为16进制*/
	String.prototype.colorHex = function(){
	     var that = this;
	     if(/^(rgb|RGB)/.test(that)){
	          var aColor = that.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
	          var strHex = "#";
	          for(var i=0; i<aColor.length; i++){
	               var hex = Number(aColor[i]).toString(16);
	               if(hex === "0"){
	                    hex += hex;    
	               }
	               strHex += hex;
	          }
	          if(strHex.length !== 7){
	               strHex = that;    
	          }
	          return strHex;
	     }else if(reg.test(that)){
	          var aNum = that.replace(/#/,"").split("");
	          if(aNum.length === 6){
	               return that;    
	          }else if(aNum.length === 3){
	               var numHex = "#";
	               for(var i=0; i<aNum.length; i+=1){
	                    numHex += (aNum[i]+aNum[i]);
	               }
	               return numHex;
	          }
	     }else{
	          return that;    
	     }
	};

	/*16进制颜色转为RGB格式*/
	String.prototype.colorRgb = function(){
	     var sColor = this.toLowerCase();
	     if(sColor && reg.test(sColor)){
	          if(sColor.length === 4){
	               var sColorNew = "#";
	               for(var i=1; i<4; i+=1){
	                    sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));    
	               }
	               sColor = sColorNew;
	          }
	          //处理六位的颜色值
	          var sColorChange = [];
	          for(var i=1; i<7; i+=2){
	               sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));    
	          }
	          return "RGB(" + sColorChange.join(",") + ")";
	     }else{
	          return sColor;    
	     }
	};

	function easeOut(t, b, c, d) {
	    return -c *(t /= d)*(t-2) + b;
	}
	function Linear(t, b, c, d) { return c*t/d + b; }

	function jsExp(exp){

		if(typeof exp !== 'string'){
			return;
		}

		this.init(exp);
	}
	jsExp.prototype.init = function(exp){
		var inputStack;
		var outputStack = [];
		var outputQueue = [];

		inputStack = exp.split(/\s+/g);

		while(inputStack.length > 0){
			var cur = inputStack.shift();
			if(this.isOperator(cur)){
			    if(cur == '('){
			        outputStack.push(cur);
			    }else if(cur == ')'){
			        var po = outputStack.pop();
			        while(po != '(' && outputStack.length > 0){
			            outputQueue.push(po);
			            po = outputStack.pop();
			        }
			        if(po != '('){
			            throw "error: unmatched ()";
			        }
			    }else{
			        while(this.prioraty(cur, outputStack[outputStack.length - 1]) && outputStack.length > 0){
			            outputQueue.push(outputStack.pop());
			        }
			        outputStack.push(cur);
			    }
			}else{
			    outputQueue.push(cur);
			}
		}

		if(outputStack.length > 0){
			if(outputStack[outputStack.length - 1] == ')' || outputStack[outputStack.length - 1] == '('){
			    throw "error: unmatched ()";
			}
			while(outputStack.length > 0){
			    outputQueue.push(outputStack.pop());
			}
		}

		this.evalRpn(outputQueue);
	}
	jsExp.prototype.isOperator = function(value){
		var operatorString = "+-*/()";
	    return operatorString.indexOf(value) > -1
	}

	jsExp.prototype.getPrioraty = function(value){
		switch(value){
	        case '+':
	        case '-':
	            return 1;
	        case '*':
	        case '/':
	            return 2;
	        default:
	            return 0;
	    }
	}

	jsExp.prototype.prioraty = function(o1, o2){

		return this.getPrioraty(o1) <= this.getPrioraty(o2);
	}

	jsExp.prototype.evalRpn = function(rpnQueue){

		var outputStack = [];
	    while(rpnQueue.length > 0){
	        var cur = rpnQueue.shift();
	 
	        if(!this.isOperator(cur)){
	            outputStack.push(cur);
	        }else{
	            if(outputStack.length < 2){
	                throw "unvalid stack length";
	            }
	            var sec = outputStack.pop();
	            var fir = outputStack.pop();
	 
	            outputStack.push(operation( fir,sec, cur).val);
	        }
	    }
	 
	    if(outputStack.length != 1){
	        throw "unvalid expression";
	    }else{
	        this.val = outputStack[0];
	    }
	}

	function operation(num1, num2, operator){

		if(!(this instanceof operation)){
			return new operation(num1, num2, operator);	
		}

		this.operate(num1, num2, operator);	
	}

	operation.prototype.operate = function(num1, num2, operator){

		var n1 = num1.toString().split(".");
		var l1 = n1[1]?n1[1].length:0;
		var n2 = num2.toString().split(".");
		var l2 = n2[1]?n2[1].length:0;

		var al = {"+":l1+l2,"-":l1+l2,"*":(l1+l2)*2,"/":0}

		var _num1 = num1.toString().replace(".","")*Math.pow(10,l2);
		var _num2 = num2.toString().replace(".","")*Math.pow(10,l1);

		this.val = eval(_num1 + operator + _num2)/Math.pow(10,al[operator]);

		this.toFixed();
	}

	/*
	* len 保留小数位长度 (默认 2 位)
	* zeroLen 补0数位长度 (默认 2 位)
	* type 1: 四会五入，2: 向上取, 3: 向下取 (默认 3 )
	* */
	operation.prototype.toFixed = function(len, zeroLen, type){

		var num = this.val;	

		var arrNum = num.toString().split(".");
	    var newNum = num.toString().replace(".","");
	    var fLegnth = arrNum[1] ? arrNum[1].length : 0;
	    
	    var type = type || 3;
	    var zeroLen = zeroLen == 0 ? 0 : zeroLen || 2;
	    var len = len == 0 ? 0 : len || 2;
	 	var result = 0;
	 	var _l = _num = 0;

	    if(len > fLegnth){
	        _l = Math.pow(10,fLegnth);
	        _num = num.toString().replace(".","");
	    }else{
	        _l = Math.pow(10,len);
	        _num = newNum.substring(0,arrNum[0].length+len);
	    }

	 	switch(type){
	 		case 1:
	 			result = num.toFixed(len);
	 			break;
	 		case 2:
	 			result = Math.ceil(_num)/_l;
	 			break;
	 		case 3:
	 			result = Math.floor(_num)/_l;
	 			break;		
	 	}

	    if(zeroLen){
	        var arr = result.toString().split(".");
	        arr[1] = arr[1] ? arr[1] : "";
	        var len = zeroLen - arr[1].length;
	        for(var i = 0; i < len; i++){
	            arr[1] += "0";
	        }
	        result =  arr[0] + "." + arr[1];
	    }

	    this.result = result;

	    return result;
	}

	win.RingGraph = RingGraph;

})(window);