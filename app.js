const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000

const client = new Client({
	database: 'ddmihcu0i9oh4g',
	user: 'wagrbiqjyejffc',
	password: '3352d8150a25ae9b72764c1ec8c20576e8bc0c9d64a07224a2d18db21af77846',
	host: 'ec2-54-204-23-228.compute-1.amazonaws.com',
	port: 5432,
	ssl: true
});
/*
const client = new Client({
	database: 'storedb',
	user: 'postgres',
	password: 'admin',
	host: 'localhost',
	port: 5432
});
*/

client.connect()
	.then(function() {
		console.log('connected to database!');
	})
	.catch(function() {
		console.log('Error');
	})

//View engine setup
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.get('/', function(req,res) { //product list
	client.query('SELECT * FROM products ORDER BY products.id', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			list.push(data.rows[i]);
		}
		res.render('home',{
			data: list,
			title: 'Top Products'
		});
	});
});

app.get('/product/create', (req,res)=>{	//CREATE PRODUCT html
	client.query('SELECT * FROM products_category', (req, data)=>{
		var list = [];
		for (var i = 1; i < data.rows.length+1; i++) {
				list.push(data.rows[i-1]);
		}
		client.query('SELECT * FROM brands', (req, data)=>{
			var list2 = [];
			for (var i = 1; i < data.rows.length+1; i++) {
					list2.push(data.rows[i-1]);
			}
			res.render('product_create',{
				data: list,
				data2: list2
			});
		});
	});
});

app.post('/', function(req,res) { //product list with insert new product
	var values =[];
	values = [req.body.product_name,req.body.product_description,req.body.tagline,req.body.price,req.body.warranty,req.body.pic,req.body.category_id,req.body.brand_id];
	//console.log(req.body);
	//console.log(values);
	client.query("INSERT INTO products(product_name, product_description, tagline, price, warranty, pic, category_id, brand_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8)", values, (err, res)=>{
		if (err) {
			console.log(err.stack)
			}
		else {
			console.log(res.rows[0])
		}
		res.redirect('/');
	});
	/*
	client.query('SELECT * FROM products ORDER BY products.id', (req, data)=>{
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			list.push(data.rows[i]);
		}
		res.render('home',{
			data: list,
			title: 'Top Products'
		});
	});
	*/
});

app.get('/products/:id', (req,res)=>{
	var id = req.params.id;
	client.query('SELECT products.id, products.product_name, products.product_description, products.tagline, products.price, products.warranty, products.pic, products.category_id, products_category.category_name, products.brand_id, brands.brand_name FROM products INNER JOIN products_category ON products.category_id = products_category.id INNER JOIN brands ON products.brand_id = brands.id ORDER BY products.id' , (req, data)=>{
		var list = [];
		//console.log(data);
		for (var i = 0; i < data.rows.length+1; i++) {
			if (i==id) {
				list.push(data.rows[i-1]);
			}
		}
		//console.log(list);
		res.render('products',{
			data: list
		});
	});
});

app.post('/products/:id/send', function(req, res) {
	console.log(req.body);
	var id = req.params.id;
	const output = `
		<p>You have a new contact request</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Customer Name: ${req.body.name}</li>
			<li>Phone: ${req.body.phone}</li>
			<li>Email: ${req.body.email}</li>
			<li>Product ID: ${req.body.productid}</li>
			<li>Quantity: ${req.body.quantity}</li>
		</ul>
	`;

	//nodemailer
	let transporter = nodemailer.createTransport({
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
        auth: {
            user: 'iemaniamailer@yahoo.com', 
            pass: 'custominearmonitor' 
            /*
            user: 'iemaniamailer@google.com', 
            pass: 'custominearmonitor' 
        host: 'smtp.mail.yahoo.com'
            */
        }
    });

    let mailOptions = {
        from: '"IEMania Mailer" <iemaniamailer@yahoo.com>',
        to: 'jdvista96@gmail.com, killerbats1com@gmail.com, drobscortz@gmail.com',
        subject: 'IEMania Contact Request',
        html: output
    };

    transporter.sendMail(mailOptions, (error, info)=>{
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        client.query('SELECT * FROM products ORDER BY products.id', (req, data)=>{
			var list = [];
			for (var i = 0; i < data.rows.length+1; i++) {
				if (i==id) {
					list.push(data.rows[i-1]);
				}
			}
			res.render('products',{
				data: list,
				msg: '---Email has been sent---'
			});
		});
     });
});

app.get('/member/1', function(req,res) {
	res.render('member', {
		name: 'Jomar Vista',
		email: 'jdvista96@gmail.com',
		phone: '09423454782',
		imageurl: '/jomar.jpg',
		hobbies: ['Listening to music', 'Playing computer games']
	});
});

app.get('/member/2', function(req,res) {
	res.render('member', {
		name: 'Daniel Cortez',
		email: 'drobscortz@gmail.com',
		phone: '09971960972',
		imageurl: '/daniel.jpg',
		hobbies: ['Playing computer games', 'Watching youtube videos']
	});
});

app.post('/brands', function(req,res) { //brand list insert 
	var values =[];
	values = [req.body.brand_name,req.body.brand_description];
	console.log(req.body);
	console.log(values);
	client.query("INSERT INTO brands(brand_name, brand_description) VALUES($1, $2)", values, (err, res)=>{
		if (err) {
			console.log(err.stack)
			}
		else {
			console.log(res.rows[0])
		}
	});
	res.redirect('/brands');
});

app.get('/brands', (req,res)=>{ //brand list
	client.query('SELECT * FROM brands', (req, data)=>{
		var list = [];
		for (var i = 1; i < data.rows.length+1; i++) {
				list.push(data.rows[i-1]);
		}
		res.render('brands',{
			data: list
		});
	});
});

app.get('/brand/create', (req,res)=>{ //route to create brand html
	res.render('brand_create');
});



app.post('/categories', function(req,res){ //category list with insert new category query
	var values =[];
	values = [req.body.category_name];
	console.log(req.body);
	console.log(values);
	client.query("INSERT INTO products_category(category_name) VALUES($1)", values, (err, res)=>{
		if (err) {
			console.log(err.stack)
			}
		else {
			console.log(res.rows[0])
		}
	});
	res.redirect('/categories');
});


app.get('/categories', (req,res)=>{ //category list
	client.query('SELECT * FROM products_category', (req, data)=>{
		var list = [];
		for (var i = 1; i < data.rows.length+1; i++) {
				list.push(data.rows[i-1]);
		}
		res.render('categories',{
			data: list
		});
	});
});

app.get('/category/create', (req,res)=>{ //route to create category
	res.render('category_create');
});

app.get('/product/update/:id', (req,res)=>{
	var id = req.params.id;
	client.query('SELECT products.id, products.product_name, products.product_description, products.tagline, products.price, products.warranty, products.pic, products.category_id, products_category.category_name, products.brand_id, brands.brand_name FROM products INNER JOIN products_category ON products.category_id = products_category.id INNER JOIN brands ON products.brand_id = brands.id ORDER BY products.id' , (req, data)=>{
		var list = [];
		//console.log(data);
		for (var i = 1; i < data.rows.length+1; i++) {
			if (i==id) {
				list.push(data.rows[i-1]);
			}
		}
		//console.log(list);
			client.query('SELECT * FROM products_category', (req, data)=>{
			var list2 = [];
			for (var i = 1; i < data.rows.length+1; i++) {
				list2.push(data.rows[i-1]);
			}
			client.query('SELECT * FROM brands', (req, data)=>{
				var list3 = [];
				for (var i = 1; i < data.rows.length+1; i++) {
					list3.push(data.rows[i-1]);
				}
				res.render('product_update',{
					products: list,
					products_category: list2,
					brands: list3
				});
			});
		});
	});
});

app.post('/products/:id', function(req,res){
	console.log(req.body);
	var id = req.params.id;
	var values =[];
	values = [req.body.id,req.body.product_name,req.body.product_description,req.body.tagline,req.body.price,req.body.warranty,req.body.pic,req.body.category_id,req.body.brand_id];
	//
	//for updating via post -----------------------------------------------------WIP
	console.log(values);
	client.query('UPDATE products SET product_name = $2, product_description = $3, tagline = $4, price = $5, warranty = $6, pic = $7, category_id = $8, brand_id = $9 WHERE id = $1', values);
	res.redirect('/products/:id');
});

app.listen(3000,function() {
	console.log('Server started at port 3000');
});

app.listen(PORT);