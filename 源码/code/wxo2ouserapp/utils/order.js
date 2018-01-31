var app = getApp();
var _P = app.xpm.getPromise();
function order(){ 
	var that = this;
	var app = getApp();
	var stor = app.xpm.require('Stor');
	var goods = app.xpm.require('Table', 'goods');

	// 预定数据本地存储
	this.product = function (id){
		var product = stor.getSync('pro');

		if(product==null||product==''){
			return  new _P(function (resolve, reject){
				goods.query().fetch('*').then(function(data) {  
					   	stor.setSync('pro',data);
					   	return data;
					}).then(function(data){
						resolve({data:data});
					}).catch( function( excp ) {
						reject(excp);
					});
			})
		}else{
			return new _P(function (resolve,reject){
				resolve({data:product})
				reject('数据错误')
			})
		}
	}
}
module.exports = order;