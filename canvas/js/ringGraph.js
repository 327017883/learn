
function RingGraph(container, options){

	this.container = container;

	var defaults = {
		color: ['#e6b244', '#7f0273', '#f97c6a', '#794d1a', '#b859bb', '#fc5a51', '#baf986', '#ef4c44', '#4ecde7', '#ef2d3a', '#83de30', '#91a3a3']
	};

	this.options = Object.assign(options, defaults);
	this.canvas = {};
	this.pathArr = [];
	this.events = [];

	this.init();	
}

RingGraph.prototype.init = function(){

	this.initCanvas();

	this.series();

	this.legend();	

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

	ctx.clearRect(0, 0, width, height);

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

	var r;
	if(width > height){
		r = height/2;
		
	}else{
		r = width/2;
	}

	var radius = options.series.radius.map(function(e){
		return parseFloat(e)/100;
	});	

	//外环圆
	var total = 0;
	data.forEach(function(d){
		total += d.value;
	});

	var start = 2*Math.PI*0;
	var time = 0;	

	var initDegTotal = 0;

	data.forEach(function(d, i){
	
		var initDeg = d.value/total*2*Math.PI;
		initDegTotal += initDeg;
		var endDeg = initDegTotal;
				
		(function(start){						

			var sDeg = start;
			var eDeg = sDeg + .04

			that.pathArr.push({

				fn: function(){
						
					function run(){					

						if(eDeg < endDeg){

							ctx.beginPath();
							ctx.strokeStyle = colors[i]
							ctx.fillStyle = colors[i]
							ctx.moveTo(width/2, height/2);				
							ctx.arc(width/2, height/2, r*radius[1], sDeg, eDeg+.04);
							ctx.closePath();					
							ctx.fill();

							ctx.beginPath();
							ctx.strokeStyle = bgColor;
							ctx.fillStyle = bgColor;
							ctx.moveTo(width/2, height/2);
							ctx.arc(width/2, height/2, r*radius[0], sDeg-.06, eDeg+.08);
							ctx.closePath();
							ctx.fill();
														
							sDeg = eDeg;
							eDeg = sDeg + .04

							setTimeout(function(){
								run();
							}, 0)						
														
						}else{
							eDeg = sDeg + .04
							sDeg = endDeg;
							
						}
																									
					}					

					run();
					
				}
			});	
		})(start)

		start = endDeg;
		
	})
	
	//填充中间没有填满的部分
	that.pathArr.push({

		fn: function(){

			setTimeout(function(){

				ctx.beginPath();
				ctx.strokeStyle = bgColor;
				ctx.fillStyle = bgColor;
				ctx.moveTo(width/2, height/2);
				ctx.arc(width/2, height/2, 12, 0, 2*Math.PI);
				ctx.closePath();
				ctx.fill();
				
			}, 100);
		}
	})

	// that.pathArr.push({
	// 	fn: function(){

	// 		ctx.beginPath();
	// 		var txt = options.series.name;
	// 		ctx.textBaseline = "middle";
	// 		ctx.font = "30px Microsoft Yahei";
	// 		ctx.textAlign = 'center';
	// 		ctx.fillStyle = '#404040';
	// 		ctx.fillText(txt, width/2, height/2);
	// 		ctx.closePath();
	// 	}
	// });	
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

	this.pathArr.forEach(function(obj){
		obj.fn()
	});
	
}
RingGraph.prototype.setOption = function(){

}

RingGraph.prototype.addEvent = function(fn){
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