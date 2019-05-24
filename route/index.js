const express = require('express');
const mysql = require('mysql');
const common = require('../libs/common');
const async = require("async");
const db = mysql.createPool({
    host: 'localhost', // db host
    user: 'root',     // db user
    password: 'root',  //db pwd
    database: 'jd'   // db name
});
module.exports = () => {
    const route = express.Router(); //创建路由路径的链式路由句柄。
    const getHomeStr = `SELECT product_id,product_name,product_price,product_img_url,product_uprice FROM product`;
    const getCateNames = `SELECT * FROM category ORDER BY category_id desc`;
    //get homePage datas
    route.get('/home', (req, res) => {
        getHomeDatas(getHomeStr, res);
    });

    function getHomeDatas(getHomeStr, res) {
        db.query(getHomeStr, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    }

    route.get('/category', (req, res) => {
        getCateNamesDatas(getCateNames, res);
    });

    function getCateNamesDatas(getCateNames, res) {
        db.query(getCateNames, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    };
    route.get('/categorygoods', (req, res) => {
        let mId = req.query.mId;
        const sql = `select * from product,category where product.category_id=category.category_id and category.category_id='${mId}'`;
        getCateGoods(sql, res);
    });

    function getCateGoods(sql, res) {
        db.query(sql, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    }
    route.get('/detail', (req, res) => {
        let produId = req.query.mId;
        const imagesStr = `select image_url from product_image where product_id='${produId}'`;
        const productStr = `select * from product where product_id='${produId}'`;
        let detailDatas = [];
        db.query(imagesStr, (err, imgDatas) => {
            if (err) {
                console.error(err);
                res.status(500).send('database err').end();
            } else {
                detailDatas.push(imgDatas);
                db.query(productStr, (err, data) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('database err').end();
                    } else {		
						detailDatas.push(data);
						let s_id=data[0].shop_id;
						const str=`select shop_name from shop where shop_id='${s_id}'`;
						db.query(str, (err, data2) => {
							if (err) {
								console.error(err);
								res.status(500).send('database err').end();
							} else {
								detailDatas[1][0].shop_name=data2[0].shop_name;
								res.send(detailDatas).end();
							}
						});
                    }
                });
            }
        });

    });
	/*function getpro(sql, res){
		db.query(sql, (err, data) => {
			if (err) {
				console.error(err);
				res.status(500).send('database err').end();
			} 
			else 
			{	
				
				(async () => {
					await getshopname(`select shop_name from shop where shop_id='${data[0].shop_id}'`,res);
				})();	
				console.log(data[0].shop_id);
				for(let i=0;i<data.length;i++){
					Datas[i]=data2;
					Datas[i][0].count=data[i].ocount; 					
				}			
			}
		});
	};
	function getshopname(sql, res){
		db.query(sql, (err, data) => {
			if (err) {
				console.error(err);
				res.status(500).send('database err').end();
			} 
			else 
			{		
				for(var k=0;k<data.length;k++){
					Datas[k].shop_name=data3[k].shop_name;	
					//console.log(Datas[k]);
				}
				console.log(data[0].shop_name);	
			}
		});
	};*/
    route.get('/cart1', (req, res) => {
		let user_id = req.query.mId;
        const cartStr = `select product_id,ocount,order_id from orders where user_id='${user_id}' and stauts=0`;
		let Datas = [];
        db.query(cartStr, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                for(var i=0;i<data.length;i++){
					Datas.push(data[i]);
				}
				res.send(Datas);
            }
        });
    });
    route.get('/order1', (req, res) => {
		let user_id = req.query.mId;
        const cartStr = `select product_id,ocount,order_id from orders where user_id='${user_id}' and stauts='1'`;
		let Datas = [];
        db.query(cartStr, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                for(var i=0;i<data.length;i++){
					Datas.push(data[i]);
				}
				res.send(Datas);
            }
        });
    });
	route.get('/cart2', (req, res) => {
		let Id = req.query.Id;
        const cartStr = `select * from product where product_id='${Id}'`;
        db.query(cartStr, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
				res.send(data);
            }
        });
    });
	route.get('/cart3', (req, res) => {
		let Id = req.query.Id;
		const str=`select shop_name from shop where shop_id='${Id}'`;
		db.query(str, (err, data) => {
			if (err) {
				console.error(err);
				res.status(500).send('database err').end();
			} else {
				res.send(data);
			}
		});
    });
    route.get('/search', (req, res) => {
        let keyWord = req.query.kw;
        let hot = req.query.hot;
        let priceUp = req.query.priceUp;
        let priceDown = req.query.priceDown;
        const keywordStr = `select  *  from product,shop where product.shop_id=shop.shop_id and product.product_name like '%${keyWord}%'`;
        const hotStr = `select  *  from product,shop where product.shop_id=shop.shop_id and product.product_name like '%${keyWord}%' order by product_comment_num desc`;
        const priceUpStr = `select  *  from product,shop where product.shop_id=shop.shop_id and product.product_name like '%${keyWord}%' order by product_uprice asc`;
        const priceDownStr = `select  *  from product,shop where product.shop_id=shop.shop_id and product.product_name like '%${keyWord}%' order by product_uprice desc`;
        if (keyWord != '') {
            if (hot != '') {
                getSearchDatas(hotStr, res);
            } else if (priceUp != '') {
                getSearchDatas(priceUpStr, res);
            } else if (priceDown != '') {
                getSearchDatas(priceDownStr, res);
            } else {
                getSearchDatas(keywordStr, res);
            }
        }

    });
    /**
        get search datas
    */
    function getSearchDatas(keywordStr, res) {
        db.query(keywordStr, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    }
    /*
     *user reg func
     */
    route.post('/reg', (req, res) => {

        let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
        let regName = mObj.regName;
        let regPasswd = mObj.regPasswd;
		let regNumber = mObj.regNumber;
        const insUserInfo = `INSERT INTO user(user_name,login_password,user_number) VALUES('${regName}','${regPasswd}','${regNumber}')`;
        delReg(insUserInfo, res);
    });
	//addOrder
	route.post('/addOrder', (req, res) => {

        let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
		console.log(mObj)
        let user_id = mObj.user_id;
        let price = mObj.price;
		let count = mObj.count;
		let proid = mObj.proid;
		let tp = mObj.tp;
        let adid = mObj.adid;
		let sta = mObj.sta;
		let time = mObj.time;
        const insoderInfo = `INSERT INTO orders(user_id,price,ocount,product_id,total_price,address_id,stauts,buid_time) VALUES('${user_id}','${price}','${count}','${proid}','${tp}','${adid}','${sta}','${time}')`;
        db.query(insoderInfo, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    });
	//addOrder2
	route.post('/addOrder2', (req, res) => {
        let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
		let count = mObj.count;
		let tp = mObj.tp;
        let adid = mObj.adid;
		let sta = mObj.sta;
		let time = mObj.time;
		let order_id = mObj.order_id;
        const insoderInfo = `UPDATE orders SET ocount='${count}',total_price='${tp}',address_id='${adid}',stauts='${sta}',buid_time='${time}' WHERE order_id='${order_id}'`;
        db.query(insoderInfo, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    });
	//addCart
	route.post('/addCart', (req, res) => {

        let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
		let product_id=mObj.product_id;
        let user_id = mObj.user_id;
        let price = Number(mObj.product_uprice);
		let ocount = Number(mObj.num);
		let total_price=price*ocount;
        const str = `INSERT INTO orders(product_id,user_id,price,ocount,total_price,stauts) VALUES('${product_id}','${user_id}','${price}','${ocount}','${total_price}',0)`;
        db.query(str, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    });
	//delAdd
	route.post('/delAdd', (req, res) => {
		let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
		let addId = mObj.params.mId;
        const delsrc = `DELETE FROM address WHERE address_id='${addId}'`;
        db.query(delsrc, (err) => {
            if (err) {
                console.error(err);
                res.send({ 'msg': '服务器出错', 'status': 0 }).end();
            } else {
				
                res.send({ 'msg': '删除成功', 'status': 1 }).end();
            }
        })
    });
	//delOrder
	route.post('/delOrder', (req, res) => {
		let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
		let mId = mObj.params.mId;
        const delsrc = `DELETE FROM orders WHERE order_id='${mId}'`;
        db.query(delsrc, (err) => {
            if (err) {
                console.error(err);
                res.send({ 'msg': '服务器出错', 'status': 0 }).end();
            } else {
				
                res.send({ 'msg': '删除成功', 'status': 1 }).end();
            }
        })
    });
	//addAddress
	route.post('/addAddress', (req, res) => {
		let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
        let eName = mObj.mname;
        let ephone = mObj.mphone;
		let eaddress = mObj.maddress;
		let uId = mObj.uid;
        const addsrc = `INSERT INTO address(sname,user_phone,addressarea,user_id) VALUES('${eName}','${ephone}','${eaddress}','${uId}')`;
        db.query(addsrc, (err) => {
            if (err) {
                console.error(err);
                res.send({ 'msg': '服务器出错', 'status': 0 }).end();
            } else {
                res.send({ 'msg': '添加成功', 'status': 1 }).end();
            }
        })
    });
	//addressEdit
	route.post('/addressEdit', (req, res) => {
        let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
        }
        let eName = mObj.mname;
        let ephone = mObj.mphone;
		let eaddress = mObj.maddress;
		let eaId = mObj.mid;
        const src = `UPDATE address SET sname='${eName}',user_phone='${ephone}',addressarea='${eaddress}' WHERE address_id='${eaId}'`;
        db.query(src, (err) => {
            if (err) {
                console.error(err);
                res.send({ 'msg': '服务器出错', 'status': 0 }).end();
            } else {
                res.send({ 'msg': '更改成功', 'status': 1 }).end();
            }
        })
    });
    /*
     *deal user register
     */
    function delReg(insUserInfo, res) {
        db.query(insUserInfo, (err) => {
            if (err) {
                console.error(err);
                res.send({ 'msg': '服务器出错', 'status': 0 }).end();
            } else {
                res.send({ 'msg': '注册成功', 'status': 1 }).end();
            }
        })
    };
	/*login*/
    route.post('/login', (req, res) => {
        let mObj = {};
        for (let obj in req.body) {
            mObj = JSON.parse(obj);
            console.log(mObj);
        }
        let username = mObj.loginName;

        const selectUser = `SELECT * FROM user where user_name='${username}'`;
        db.query(selectUser, (err, data) => {
            if (err) {
                console.log(err);
                res.send({ 'msg': '服务器出错', 'status': 0 }).end();
            } else {
                if (data.length == 0) {
                    res.send({ 'msg': '该用户不存在', 'status': -1 }).end();
                } else {
                    let dataw = data[0];
                    console.log(data);
                    //login sucess
                    if (dataw.login_password == mObj.loginPawd) {
                        dataw.msg = "登录成功";
                        dataw.status = 1;
                        res.send(dataw).end();
                    } else {
                        res.send({ 'msg': '密码不正确', 'status': -2 }).end();
                    }
                }
            }
        });

    });
	//userinfo
    route.get('/userinfo', (req, res) => {
        let uId = req.query.uId;
        const getU = `SELECT user_name,user_number FROM user where user_id='${uId}'`;
        db.query(getU, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data[0]);
                }
            }
        });
    });
	//orderInfo
    route.get('/orderInfo', (req, res) => {
        let uId = req.query.uId;
        const getU = `SELECT * FROM orders where user_id='${uId}'`;
        db.query(getU, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send('database err').end();
            } else {
                if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } else {
                    res.send(data);
                }
            }
        });
    });
	//address
	route.get('/address', (req, res) => {
        let addId = req.query.mId;
        const addStr = `select * from address where user_id='${addId}'`;
		let addInfo=[];
        db.query(addStr, (err, data) => {
            if (err) {
                console.error(err);
                res.status(500).send('database err').end();
            } else {
				if (data.length == 0) {
                    res.status(500).send('no datas').end();
                } 
				else {
					for(var i=0;i<data.length;i++){
						addInfo.push(data[i]);
					}
                    res.send(addInfo);
					console.log(addInfo);
                }
            }
		});
	});
    return route;
}
