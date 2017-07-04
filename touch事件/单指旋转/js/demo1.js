
function getAngle(x1, y1, x2, y2, x3, y3, x4, y4){
  return Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y2 - y1, x2 - x1);
}

var x2, y2;
var x4, y4;
var initAngle = 0;
var srcCirclePos;

var testEle = document.querySelector('.test');
var srcPos = testEle.getClientRects()[0];

srcCirclePos = {
    x: srcPos.top + testEle.offsetWidth/2,
    y: srcPos.left + testEle.offsetHeight/2
  };

testEle.addEventListener('touchstart', function(e){
  e.preventDefault();

  var srcEle = e.srcElement;

  var num = srcEle.style.transform.match(/\d+\.\d+/g);
  initAngle = (num && +num[0]) || 0

  var touches = e.changedTouches[0];
  x2 = touches.clientX;
  y2 = touches.clientY;

}, !1);
testEle.addEventListener('touchmove', function(e){

  var touches = e.changedTouches[0];
  x4 = touches.clientX;
  y4 = touches.clientY;

  var deg = getAngle(srcCirclePos.x, srcCirclePos.y, x2, y2, srcCirclePos.x, srcCirclePos.y, x4, y4);
  angle = 180/Math.PI*deg + initAngle;
  e.srcElement.style.webkitTransform = 'rotate('+ angle +'deg)';

}, !1);
testEle.addEventListener('touchend', function(e){

}, !1);