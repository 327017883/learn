<template>
	<div class="load-more">
		<div class="loade-more-content" ref='touchEle'>
			<slot name='top'>
				<div class="loadmore-top" ref='loadmoreTop'  v-if='topMethod'>
						<i></i>
						<span class="loadmore-top-text">{{ topText }}</span>
				</div> 
			</slot>
			<slot></slot>
			<slot name='bottom'>
				<div class="loadmore-bottom" ref='loadmoreBottom' v-if='bottomMethod'>
						<i></i>
						<span class="loadmore-bottom-text">{{ bottomText }}</span>
				</div> 
			</slot>			
		</div>
	</div>
</template>

<script>
	
	export default{
		name: 'load-more',
		props:{
			topMethod:{
				type: Function
			},
			bottomMethod:{
				type: Function
			}
		},
		data(){
			return {
				touchEle: '',
				startX: '',
				startY: '',
				initY: '',
				initTop: 0,
				topText: '',
				bottomText: '',
				topPullText: '下拉刷新',
				bottomPullText: '上拉刷新',
			    dropText: '释放更新',
			    loadingText:'加载中...',
			    loaded:'加载完毕',
			    topStatus: '',
			    bottomStatus: '',
			    pos: [],
			    _isStart: !1,
			    isAsyncing: !1,
			    topHt: 0,
			    botHt: 0,
			    isAnimate: !1,
			    topLoading: !1,
			    bottomLoading: !1,
			    requesId: ''
			}
		},
		watch:{
			topStatus(val){
				switch(val){
					case 'pull':
					this.topText = this.topPullText;
					break;

					case 'drop':
					this.topText = this.dropText;
					break;

					case 'loading':
					this.topText = this.loadingText;
					break;

					case 'loaded':
					this.topText = this.loaded;
					break;
				}
			},
			bottomStatus(val){
				switch(val){
					case 'pull':
					this.bottomText = this.bottomPullText;
					break;

					case 'drop':
					this.bottomText = this.dropText;
					break;

					case 'loading':
					this.bottomText = this.loadingText;
					break;

					case 'loaded':
					this.bottomText = this.loaded;
					break;
				}
			}
		},
		mounted(){

			//初始化状态
			this.topStatus = 'pull';
			this.bottomStatus = 'pull';			
		
			this.easeOut = (t, b, c, d) => {
	           return (t==d) ? b + c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	        }	       

	        if(!window.requestAnimationFrame){
                window.requestAnimationFrame =
                        window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.msRequestAnimationFrame ||
                        function(callback) {
                            return setTimeout(callback,1000/60);
                        };
            }

            this.ani = {};
            this.ani.d = 20;

            if(this.$refs.loadmoreTop){
            	this.topHt = this.$refs.loadmoreTop.offsetHeight;            	
            }           

            if(this.$refs.loadmoreBottom){
            	this.botHt = this.$refs.loadmoreBottom.offsetHeight;
            } 

			let el = this.touchEle = this.$refs.touchEle;
			
			el.addEventListener('touchstart', (e) => { this.handleTouch(e)}, !1);
			el.addEventListener('touchmove', (e) => { this.handleTouch(e)}, !1);
			el.addEventListener('touchend', (e) => { this.handleTouch(e)}, !1);			
			
		},
		methods:{
			handleTouch(e){

				let sTouches = e.changedTouches[0];

				switch(e.type){
					case 'touchstart':

						e.preventDefault();

						this.startX = sTouches.pageX;
                    	this.startY = sTouches.pageY;                  	
                    	this.initY = this.getCurrentTop();
                    	this.pos = [];

                    	if(this.isAsyncing){ this._isStart = !1;}
                    	this._isStart = !0;
                    	
			           	this.maxTop = window.innerHeight - this.$refs.touchEle.offsetHeight + this.topHt + this.botHt;  	
					break;					
					case 'touchmove':
						
						if(!this._isStart){ return; }

						let moveX = sTouches.pageX;
                    	let moveY = sTouches.pageY;
                    	
                    	let dis = moveY - this.startY;
                    	let YDis = Math.pow((dis ), 2);
                    	let XDis = Math.pow((moveX - this.startX ), 2);
                    	                  	      	            		
                    	//垂直方向移动
						if(YDis > XDis){

							let top = this.getCurrentTop();
							if(dis > 0 || (top < this.maxTop && dis < 0)){
								dis *= .2;
							}
							
							let mTop = dis + this.initY;
							this.moveDom(mTop);	

							//topStatus
							if(this.topMethod){

								if(top > this.topHt){
									this.topStatus = 'drop';
								}else{
									this.topStatus = 'pull';
								}
							}																					

							//bottomStatus
							if(this.bottomMethod){
							
								if(top < this.maxTop - this.botHt){
									this.bottomStatus = 'drop';
								}else{
									this.bottomStatus = 'pull';
								}
							} 							

							//异步请求未结束
							if(this.isAsyncing){
								this.topStatus = 'loading';
							}

							(this.pos.length > 20) && this.pos.splice( 0, 20);
							this.pos.push({time: e.timeStamp, y: moveY});
							this._lastTouchMove = e.timeStamp;							
						}					
						                   		
					break;
					case 'touchend':

						if(!this._isStart){ return;}

						let cTop = this.getCurrentTop();             	

                    	//top animate                    	
						if(cTop > this.topHt && this.topMethod){
							this.ani.c = this.topHt;
							this.topLoading = !0;					
						}
						else if((cTop < this.topHt && cTop > 0 && this.topMethod) || (this.topHt == 0 && cTop > 0)){
							this.ani.c = 0;							
							this.isAnimate = !0;
						}
						
						//bottom animate
						if(cTop < this.maxTop - this.botHt && this.bottomMethod){						
							this.ani.c = this.maxTop;
							this.bottomLoading = !0;
						}
						else if(cTop < this.maxTop){						
							this.ani.c = this.maxTop;
							this.isAnimate = !0;
						}						
						
						if(this.isAnimate){
							this.ani.b = cTop;
							this.ani.t = 0;
							this.requesId = requestAnimationFrame(() => {
								this.animateDom( () => {
									this.isAnimate = !1;
								});
							});
						}

						//下拉异步请求
						if(this.topLoading && !this.isAsyncing && this.topMethod){
							this.topLoading = !1;								
							let tf = this.topMethod();	
							this.isAsyncing = !0;
							this.topStatus = 'loading';

							if(tf){

								this.topStatus = 'loaded';
								setTimeout( () => {
																											
										this.ani.c = 0;
										this.ani.b = this.getCurrentTop();
										this.ani.t = 0;
										this.requesId = requestAnimationFrame(() => {
											this.animateDom( () => {
												//console.log('下拉请求完毕');
												this.isAsyncing = !1;
												this.topStatus = 'pull';
											});
										});									
								}, 500);	

							}																	
						}
						//上拉异步请求
						else if(this.bottomLoading && !this.isAsyncing && this.bottomMethod){
							this.bottomLoading = !1;
							let bf = this.bottomMethod();
							this.isAsyncing = !0;
							this.bottomStatus = 'loading';

							if(bf){
								this.bottomStatus = 'loaded';
								setTimeout( () => {																		
										this.ani.c = this.maxTop;
										this.ani.b = this.getCurrentTop();
										this.ani.t = 0;
										this.requesId = requestAnimationFrame(() => {
											this.animateDom( () => {
												//console.log('上拉请求完毕');
												this.isAsyncing = !1;
												this.bottomStatus = 'pull';
											});
										});
									
								}, 500);
							}																		
						}
						// content animate
						else if(!this.isAnimate){		
							if(e.timeStamp - this._lastTouchMove <= 100){								
								let pos, pLen, i, r;
								for(pos = this.pos, pLen = pos.length -1 , i = pLen, r = pLen; i > 0 && pos[i].time > this._lastTouchMove - 100; i--){
									r = i;
								}
								
								if( r !== pLen){
									let tDif = pos[pLen].time - pos[r].time;
									let sDif = pos[pLen].y - pos[r].y;
									let t = 100;

									switch(true){
										case tDif > 0 && tDif <= 20:
										t += 80; 
										break;
										case tDif > 20 && tDif <= 40:
										t += 60; 
										break;
										case tDif > 40 && tDif <= 60:
										t += 40; 
										break;
										case tDif > 60 && tDif <= 80:
										t += 20; 
										break;										
									}
									
									let mDis = cTop + (sDif/tDif)*t;

									if(mDis < this.maxTop){
										mDis = this.maxTop;
									}
									else if(mDis > 0){
										mDis = 0;
									}

									this.ani.c = mDis;
									this.ani.b = cTop;
									this.ani.t = 0;
									this.requesId = requestAnimationFrame(this.animateDom);
								}
							}

						}

						this._isStart = !1;
						
					break;
				} 

			}, 
			getStyle(element, attr){

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
			},
			getCurrentTop(){
				let translateY = this.getStyle(this.touchEle, 'transform');
                let match = translateY.match(/\-*\d+(.\d+)*/g);
                return match ? parseFloat(match[5]) : 0; 
			}, 
			moveDom(top){
				this.touchEle.style.webkitTransform ='translate3d(0, '+ top +'px, 0)';
			},
			animateDom(fn){  
				var speed = 1;
				var ani = this.ani;

				var top = this.easeOut(ani.t, ani.b, ani.c - ani.b, ani.d);
				this.moveDom(top);

				if(ani.t < ani.d){
					ani.t += speed;
					this.requesId = requestAnimationFrame(() => {
						this.animateDom(fn);
					});
				}
				else if(ani.t == ani.d){
					fn && (typeof fn == 'function') && fn();
				}      
			}
		} 
	} 
</script>    
 
<style lang='less'>
	.loadmore-top{
		height: 80px; /*px*/
		line-height: 80px;
		font-size: 24px; /*px*/
		text-align: center;
		color: gray;
		background: #cecece;
		margin-top: -80px; /*px*/
	}
	.loadmore-bottom{
		height: 100px; /*px*/
		line-height: 100px;
		font-size: 24px; /*px*/
		text-align: center;
		color: gray;
		background: #cecece;
	}
	.loade-more-content{
		-webkit-backface-visibility: hidden;
		-moz-backface-visibility: hidden;
		-ms-backface-visibility: hidden;
		backface-visibility: hidden;

		-webkit-perspective: 1000;
		-moz-perspective: 1000;
		-ms-perspective: 1000;
		perspective: 1000;

		-webkit-transform: translate3d(0, 0, 0);
		-moz-transform: translate3d(0, 0, 0);
		-ms-transform: translate3d(0, 0, 0);
		transform: translate3d(0, 0, 0);

		-webkit-transform: translateZ(0);
		-moz-transform: translateZ(0);
		-ms-transform: translateZ(0);
		-o-transform: translateZ(0);
		transform: translateZ(0);
		
	}
</style> 