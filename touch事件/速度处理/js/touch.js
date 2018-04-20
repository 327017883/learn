
var ul = document.querySelector('ul');

var startTop, startY, moveY, finalTop;
var minTop = ul.offsetHeight - window.outerHeight;
var maxTop = 0;
var pos = [];
var tolerantDis = 5; //容错距离
var isDecelerating = false;  //是否减速运动
var lastMoveTime = 0;
var velocityY;
var speed = 1000;

var ani = {
	t: 0,
	d: 20,
	b: 0,
	c: 0
};

var reqId;

ul.addEventListener('touchstart', function(e){
	controllEvent(e);
}, false);

ul.addEventListener('touchmove', function(e){
	controllEvent(e);
}, false);

ul.addEventListener('touchend', function(e){
	controllEvent(e);
}, false);


function controllEvent(e){

	var touch = event.changedTouches[0];

	switch(e.type){

		case 'touchstart':

			cancelAnimationFrame(reqId);

			startTop = getCurrentTop(ul, 'transform');
			startY = touch.clientY;
			pos = [];

			isDecelerating = false;
		break;
		case 'touchmove':

			moveY = touch.clientY;
			finalTop = startTop - (startY - moveY);

			if(finalTop < maxTop && Math.abs(finalTop) < minTop){

				//容差处理
				if(Math.abs(finalTop) <= tolerantDis){
					finalTop = 0;	
				}
				
				//容差处理
				if(minTop - Math.abs(finalTop) <= tolerantDis){
					finalTop = -minTop;
				}

				pos.length > 40 && pos.splice(20);
	            pos.push(finalTop, e.timeStamp);

				ul.style.webkitTransform = 'translate3d(0px, '+ finalTop +'px, 0px)';
			}
			lastMoveTime = e.timeStamp;						
		break;
		case 'touchend':

			var len = pos.length;

			//加速运动
			if(len > 2 && e.timeStamp - lastMoveTime < 100){
			
				var t = (pos[len-1] - pos[1])/1e3; //时间
				var s = pos[len-2] - pos[0]; //路程
				var currentTop = getCurrentTop(ul, 'transform');

				isDecelerating = true;
				velocityY = s/t;

				var endDis = s > 0 ? -15/t: 15/t;
				var fs = currentTop - endDis;
				
				if(fs >= 0){
					fs = 0;
				}else if(Math.abs(fs) > minTop){
					fs = -minTop;
				}
				ani.t = 0;

				ani.b = currentTop;
				ani.c = fs;

				srollTop();			
			}

			//减速运动
			if(!isDecelerating){
				
			}
		break;
	}
}

function srollTop(){

	var top = easeOut(ani.t, ani.b, ani.c - ani.b, ani.d);

	ul.style.webkitTransform = 'translate3d(0px, '+ top +'px, 0px)';

	if(ani.t < ani.d){ 
    	ani.t += 1; 
    	reqId = requestAnimationFrame(srollTop); 
    } 
}

function easeOut(t, b, c, d) {

	return -c *(t /= d)*(t-2) + b;
}

function getCurrentTop(ele, attr){
	let translateY = getStyle(ele, attr);
    let match = translateY.match(/\-*\d+(.\d+)*/g);
    return match ? parseFloat(match[5]) : 0; 
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
}