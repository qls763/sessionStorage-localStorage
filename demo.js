class SessionStorageClient
{
	//缓存数据
	put(key, value) {
        sessionStorage.setItem(key, value);
    }	
	
	//根据key查找value
    get(key) {
        if(sessionStorage.getItem(key) == 'undefined'){
			return  null;
		}
        return sessionStorage.getItem(key)
    }

    //添加json对象
    putJSON(key, json) {
        sessionStorage.setItem(key, JSON.stringify(json));//json 转换为字符串
    }

	//根据key查找JSON对象
    getJSON(key) {
        if (sessionStorage.getItem(key) == 'undefined'){
			return  null;
		}
        return JSON.parse(sessionStorage.getItem(key));////字符串 转换为json
    }



    //删除key对应的元素
    remove(key) {
        sessionStorage.removeItem(key);
    }

    //清空sessionStorage
    clear () {
        sessionStorage.clear();
    }
	
	//缓存数据，保存缓存时间
	cacheData(key,data){
	    if (!key  || !data ) {
            return false;
        }
		
		var d = {
            data: data,
            timestamp: Date.now()
        };
		
		try {
			this.putJSON(key, d);
		}catch (e) {
            // 异常， 还不知道会出现什么情况，做个保险
            return false;
        }
		return true;
	}
	
	//获取缓存数据,设定超时时间 
	getCacheData(key,overtime){		
		if(!key){
			return ;
		}

		var d = this.getJSON(key);
        if (d == null) {
            return null;
        }

        if (isNaN(overtime)) {	//检查其参数是否是非数字值
            return 	null;	
        }

        if (d.timestamp > overtime ) { 
			return d.data;
        } else {
            //检测时间是否超时 超时删除缓存
            this.remove(key);
            return null;
        }
		
	}
	
}

var number = 10;
var nextPage = 1;
var loading = false;
var sessionStorageClient = new SessionStorageClient();
window.addEventListener('scroll', function() {
	var sTop = document.documentElement.scrollTop || document.body.scrollTop;
	console.log('滚动条滚动了:' + sTop);
	sessionStorageClient.put("sTop",sTop);
}, false);

$(function(){
	if(sessionStorageClient.get("currentPage")==null){//未保存页码，从服务端获取数据
		nextPage = 1;				
		asyncData();
	}else{
		nextPage = Number(sessionStorageClient.get("currentPage"));		//总共加载的页码
		var html = "";
		for(var i=1;i<=nextPage;i++){
			var overtime = Date.now() - 10*60*1000;	//保存十分钟
			var sdata = sessionStorageClient.getCacheData("DIV_list_pageSize_" + number + "_pageNo_"+ i,overtime);
			if(sdata == null ){				//本地未保存数据,从服务端获取数据
				syncData(i);
			}else{
				html += itemhtml(sdata);
			}
		}
		$('.datalist').append(html);
		nextPage += 1;
	}

	if (sessionStorageClient.get('sTop')!=null) {
		var oldStop = sessionStorageClient.get('sTop');
		// 获取到的值来设置页面滚动条的位置
		console.log('滚');
		if (document.documentElement.scrollTop) {
			document.documentElement.scrollTop = oldStop;
		} else {
			document.body.scrollTop = oldStop;
		}
	} else {
		console.log('不滚');
	}
	
	$('#nextpage').on("click",function(){
		asyncData();
	});
});

function asyncData(){
	if(loading){
		return ;
	}
	loading = true;
	$.ajax({
		url:"data"+nextPage+".json",
		type: "GET",
        dataType: "json",
        success: function(result) {
			loading = false;
			if(result.status == 1){
				var data = result.data;
				var list = data.list;
				var html = itemhtml(list);
				$('.datalist').append(html);
				sessionStorageClient.cacheData("DIV_list_pageSize_" + number + "_pageNo_"+ nextPage,list);
				sessionStorageClient.put("currentPage",nextPage);
				nextPage += 1;
				
			}
		},
		error:function(e){
			loading = false;
			console.log('滚不动了，没有了');
		}
	});

	
}

function syncData(page){
	$.ajax({
		url:"data"+page+".json",
		type: "GET",
        dataType: "json",
		async:false,
        success: function(result) {
			loading = false;
			if(result.status == 1){
				var data = result.data;
				var list = data.list;
				var html = itemhtml(list);
				$('.datalist').append(html);
				sessionStorageClient.cacheData("DIV_list_pageSize_" + number + "_pageNo_"+ page,list);		
			}
		}
	});	
}

function itemhtml(list){
	var html = "";
	var width = screen.width/2-5;
	for(var i=0; i < list.length; i++){
		html += '<div class="col-50" id="item_' + list[i].id + '">';
		html += '<div class="card demo-card-header-pic">';
		html += '<a data-url="' + list[i].url + '" href="javascript:void(0);" data-id="' + list[i].id + '"><div valign="bottom" class="card-header color-white no-border no-padding" style="overflow: hidden;">';
		html += '<img id="card-cover" src="' + list[i].img + '" alt="" width=' +width+' height=' +width+ '>';
		html += '</div>';
		html += '<div class="card-content">';
		html += '<div class="card-content-inner">';
		html += '<div class="tit">' + list[i].title + '</div>';
		html += '<div class="intro">' + list[i].intro + '</div>';
		html += '<p class="price"><i>￥</i>' + list[i].price + '</p>';
		html += '</div>';
		html += '</div></a>';
		html += '</div>';
		html += '</div>';

	}
	return html;
}


