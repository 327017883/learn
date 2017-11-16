
function RingGraph(container, options){

	this.container = container;
	this.options = options;
	this.color = ['#b4b71a', '#64b366', '#b72c2d', '#65cb26', '#0c95de'];
	this.canvas = {};
	this.pathArr = [];

	this.init();
	
	var that = this;					
	addEvent(window, 'resize', function(){
		//that.container.innerHTML = ''; 
		//that.init();
	});
}

RingGraph.prototype.init = function(){

	this.initOption();

	//this.series();

	this.legend();	

	this.draw();

	this.initEvent();
}

RingGraph.prototype.initOption = function(){

	var dom = this.canvas.dom = document.createElement('canvas');

	this.canvas.width = dom.width = this.container.offsetWidth;
	this.canvas.height = dom.height = this.container.offsetHeight;	

	var ctx = this.canvas.ctx = dom.getContext('2d');

	ctx.fillStyle = this.canvas.bgColor = getStyle(this.container, 'backgroundColor');
	ctx.fillRect(0, 0, dom.width, dom.height);

	this.container.appendChild(dom);
}
RingGraph.prototype.series = function(){

	var canvas = this.canvas;
	var options = this.options;
	var height = canvas.height;
	var width = canvas.width;
	var bgColor = canvas.bgColor;
	var ctx = canvas.ctx;

	var r;
	if(width > height){
		r = height/2;
		
	}else{
		r = width/2;
	}

	var radius = options.series.radius.map(function(e){
		return parseFloat(e)/100;
	});	

	this.pathArr.push(function(){

		ctx.beginPath();
		ctx.arc(width/2, height/2, r*radius[1], 0, 2*Math.PI);
		ctx.strokeStyle = bgColor
		ctx.fillStyle="#15e4b6";
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	});

	this.pathArr.push(function(){

		ctx.beginPath();	
		ctx.arc(width/2, height/2, r*radius[0], 0, 2*Math.PI);
		ctx.strokeStyle = bgColor;
		ctx.fillStyle = bgColor;
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	});

	this.pathArr.push(function(){

		ctx.beginPath();
		var txt = options.series.name;
		ctx.font = "30px Microsoft Yahei";
		ctx.textAlign = 'center';
		ctx.fillStyle = '#404040';
		ctx.fillText(txt, width/2, height/2);
		ctx.closePath();
	});	
}

RingGraph.prototype.legend = function(){

	var that = this;
	var legend = this.options.legend;
	var data = legend.data;
	ctx = this.canvas.ctx;

	var rW = 10;
	var rH = 10;
	var sX = 10;
	var xY = 10;

	data.forEach(function(v, i){

		that.pathArr.push(function(){

			ctx.beginPath();
			ctx.textAlign = legend.x;
			ctx.font = '14px Microsoft Yahei';
			ctx.fillStyle = that.color[i];

			ctx.fillText(v, 30, (i+1)*20);

			ctx.moveTo(sX, xY);
			ctx.moveTo(sX + rW, xY);
			ctx.moveTo(sX + rW, xY);
			ctx.moveTo(sX + rW, xY);
			ctx.closePath();
			ctx.fill();
			
			//ctx.fillRect(10, i == 0 ? 10 : i*20+9, 10,10);

		})		
	});
	
}

RingGraph.prototype.initEvent = function(){

	var canvas = this.canvas;
	var that = this;

	canvas.dom.addEventListener("mouseup", function(e){ 

		var point = getCanvasPoint(e.pageX, e.pageY);	

		canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

		that.pathArr.forEach(function(fn){
			fn();
			
			if(ctx.isPointInPath(point.x, point.y)){
				console.log('ok')
			}
		});

	}, !1);
}

RingGraph.prototype.draw = function(){

	var canvas = this.canvas;
	canvas.ctx.clearRect(0, 0, canvas.width, canvas.height);

	this.pathArr.forEach(function(fn){
		fn()
	});
	
}
RingGraph.prototype.setOption = function(){

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