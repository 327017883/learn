
function getAngle(x1, y1, x2, y2, x3, y3, x4, y4){
  return Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y2 - y1, x2 - x1);
}

var x1, y1;
var x2, y2;
var x3, y3;
var x4, y4;

var isMove = !1;
var initAngle = 0;

var testEle = document.querySelector('.test');

testEle.addEventListener('touchstart', function(e){
  e.preventDefault();

  var srcEle = e.srcElement;

  var touches = e.changedTouches;

  if(touches.length >= 2){
    console.log(touches)
    var num = srcEle.style.transform.match(/\d+\.\d+/g);

    initAngle = (num && +num[0]) || 0;

    x1 = touches[0].clientX;
    y1 = touches[0].clientY;

    x2 = touches[1].clientX;
    y2 = touches[1].clientY;

    isMove = !0;
  }

}, !1);
testEle.addEventListener('touchmove', function(e){

  if(!isMove){ return;}

  var touches = e.changedTouches;

  x3 = touches[0].clientX;
  y3 = touches[0].clientY;

  x4 = touches[1].clientX;
  y4 = touches[1].clientY;

  var deg = getAngle(x1, y1, x2, y2, x3, y3, x4, y4);
  angle = 180/Math.PI*deg + initAngle;
  e.srcElement.style.webkitTransform = 'rotate('+ angle +'deg)';

}, !1);
testEle.addEventListener('touchend', function(e){
  isMove = !1;
}, !1);