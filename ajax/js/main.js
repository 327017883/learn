;(function() {

	easyAjax({
		method: 'post',
		url: './interface/example.php',
		data: {name:'Zhouhuahui', sex:1},
		success: function(data) {
			console.log('RESP:', data);
		},
		error: function(data){
			console.log(data);
		}
	});

	function easyAjax(options){

		var xhr = new XMLHttpRequest();
		xhr.timeout = options.timeout || 3000;

		var data = options.data;
		var method = (options.method || 'post').toUpperCase();

		if(method == 'POST'){
			xhr.open(method, options.url)
		}else if(method == 'GET'){

			var str = [];
			for(var i in data){
				str.push(i + '=' + data[i]);
			}
			xhr.open(method, options.url+ '?' + str.join('&'));
		}		

		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200){
				options.success && options.success(xhr);
			}
		};
		
		(method == 'POST') ? xhr.send(JSON.stringify(data)) : xhr.send();		
	}

	function ajaxJson(options){

		var xhr = new XMLHttpRequest();
		xhr.timeout = options.timeout || 3000;
		xhr.responseType = options.contentType || 'json';
		xhr.open( options.method || 'POST', options.url);

		//xhr.setRequestHeader('Content-Type','application/json');

		xhr.onreadystatechange = function(){
	　　　　if ( xhr.readyState == 4 && xhr.status == 200 ) {
				 options.success && options.success(xhr);
	　　　　}
	　　};
		
		xhr.onerror = function(event){
			options.error && options.error(event);
		}

		xhr.ontimeout = function(event){
			options.error && options.error(event);
	　　}

		//***********************进度信息
		// 	* load事件：传输成功完成。
		// 　　* abort事件：传输被用户取消。
		// 　　* error事件：传输中出现错误。
		// 　　* loadstart事件：传输开始。
		// 　　* loadEnd事件：传输结束，但是不知道成功还是失败。
		//上传进度
		xhr.upload.onprogress = updateProgress;

		//进度函数
		xhr.onprogress = updateProgress;

		function updateProgress(event) {
	　　　　if (event.lengthComputable) {
	　　　　　　var percentComplete = event.loaded / event.total;
	　　　　}
	　　}
		xhr.send(options.data);
	}

})();