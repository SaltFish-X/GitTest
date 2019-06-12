
var app = getApp();
var _P = app.xpm.getPromise();

function Goods( user, session ) { 

	var that = this;

	this.user = user;
	this.ss = session;
	this.sname =  '_cart_' + this.user['_id'];
	this.suinfo = '_cart_' + this.user['_id'] + '_uinfo';

	
	// 生成订单号
	this.genOrderSN =  function() {
		var timestamp = (new Date()).valueOf();
		return timestamp.toString() + Math.ceil(Math.random()*1000).toString();
	}


	// 根据会员信息, 处理价格
	this.price = function( real_price ) {
		return real_price['member'];
	}


	// 处理商品字段
	this.fliter = function( goods ) {
		
		for( var i =0 ; i<goods.length; i++ ) {
			var price  = new Number(this.price(goods[i]['real_price']));
			goods[i]['sale_price'] = price;
			goods[i]['show_price'] = (price/100).toFixed(2).toString();
		}

		return goods;
	}

	this.cart = {

		order: function( data ) {
			var cdata = that.ss.get(that.suinfo) || {};

			if ( typeof data != 'object' ) {
				cdata['address'] = cdata['address'] || that.user['addr_01'];
				cdata['mobile'] = cdata['mobile'] || that.user['mobile'];
				cdata['contact'] = cdata['contact'] || that.user['nickName'];
				that.ss.set(that.suinfo, cdata);
			} else {
				cdata['address'] = data['address'] || cdata['address'];
				cdata['mobile'] = data['mobile'] || cdata['mobile'];
				cdata['contact'] = data['contact'] || cdata['contact'];
				that.ss.set(that.suinfo, cdata);
			}

			return cdata;
		},


		add: function( id, price, amount ) {

			var data = that.ss.get(that.sname) || {};

				if ( typeof data[id] == 'object' ) {
					data[id]['amount'] = new Number(data[id]['amount']) + new Number(amount);
				} else { 
					data[id] = { id:id, price:price, amount:amount };
				}
				that.ss.set(that.sname, data);
		},


		rm: function( id, amount ) {
			var data = that.ss.get(that.sname) || {};

			if ( typeof data[id] == 'undefined' ) { 
				return;
			}

			data[id]['amount'] = new Number(data[id]['amount']) - new Number(amount);
			if ( data[id]['amount'] <= 0 ) {
				try { delete data[id] } catch( e ){}
			}
			that.ss.set(that.sname, data);
		},

		remove: function( id ) {
			var data = that.ss.get(that.sname) || {};
			try { delete data[id] } catch( e ){}
			that.ss.set(that.sname, data);
		},

		clean: function(){
			that.ss.set(that.sname, {});
		},

		total: function() {
			var amt=0, fee=0, show='0.00';
			var data = that.ss.get(that.sname) || {};

			for( var k in data ) {
				var iamt =  new Number(data[k]['amount']);
				amt = new Number(amt) + iamt;
				fee = new Number(fee) + ( new Number(data[k]['price']) * iamt );
			}

			var price  = new Number(fee);
			show = (price/100).toFixed(2).toString();
			return {total:amt, sale_price:fee, show_price:show };
		},

		get: function() {
			return that.ss.get(that.sname) || {};
		}
	}

}

module.exports = Goods;