var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var path = require('path');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var JWT = require('jwt-simple');
var http = require('http');
var multer = require('multer');
var fs = require('fs');
var AWS = require('aws-sdk');
var crypto = require('crypto');


const config = require('./config/appConfig');
const apiSecret = config.secret;





app.use('/api', expressJwt({
    secret: apiSecret
}));



function parallel(middlewares) {
	return function (req, res, next) {
		async.each(middlewares, function (mw, cb) {
			mw(req, res, cb);
		}, next);
	};
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(function (err, req, res, next) {
	if (err.constructor.name === 'UnauthorizedError') {
		res.status(401).send('Unauthorized');
	}
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');



//============================================== HTML PAGES =================================================


app.get('/Login', function (req, res) {
	res.sendFile(__dirname + '/views/login.html');
});

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/views/landing.html');
});

app.get('/Admin', function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});


app.get('/Register', function (req, res) {
	res.sendFile(__dirname + '/views/register.html');
});



app.get('/AddBeer', function (req, res) {
	res.sendFile(__dirname + '/views/addbeer.html');
});


//===================================================== MODELS ================================================================



var User = require('./models/HR/hr');
var Beers = require('./models/BEER/beer');





//======================================================Connect to Mongoose================================================================



app.use(bodyParser.json());

var promise = mongoose.connect('mongodb://anupnair:lebronjames@ds113358.mlab.com:13358/management', {
	useMongoClient: true,
	/* other options */
});




//========================================= MULTER DISK STORAGE OF USERS IMAGE========================================


storage = multer.diskStorage({
	destination: './Images',
	filename: function (req, file, cb) {
		return crypto.pseudoRandomBytes(16, function (err, raw) {
			if (err) {
				return cb(err);
			}

			var userEmail = req.params.id;
			console.log("useremail===", userEmail);


			//	var today2 = new Date().getTime();
			//return cb(null, "" + req.params.postId + (path.extname(file.originalname)));

			return cb(null, "" + userEmail + (path.extname(file.originalname)));
		});
	}

});




//  app.get("/", function(req, res) {
// 	res.sendFile(__dirname + "/index.html");
// });
app.post("/Upload/:id", multer({
		storage: storage
	}).single('imgUploader'), function (req, res) {
		console.log("=================================", req.file.filename);
		console.log("File uploaded sucessfully!.");
		console.log("=======body===========", req.body);
		var userId = req.params.id;
		console.log("======emailId=====", req.params.id);


		var Imagepath = "/Images/" + req.file.filename;
		var Image = "/Images/" + req.params.id;
		console.log("Imagepath", Imagepath);
		var today = new Date().getTime();
		//var userId = req.body._id;
		//	var userId = req.params.id;
		fs.readFile(req.file.filename, function (err, data) {
			if (err) {
				throw err;
			}
			User.findOne({
				emailId: userId
			}, function (err, form2) {
				console.log("User Details ", form2);
				if (err) {
					res.sendStatus(500);
				}
				if (form2 == null) {
					console.log("User details not found");
				} else {
					if (form2.Image == null || form2.Image == "") {
						console.log("User Image value is null");
						// Read in the file, convert it to base64, store to S3
						fs.readFile(req.file.filename, function (err, data) {
							if (err) {
								throw err;
							}

							User.update({
									emailId: userId
								}, {
									$set: {
										Image: Imagepath,
										updatedAt: today
									}
								}, {
									w: 1
								},


								function (err, form1) {

									if (err) {
										res.sendStatus(500);
										console.log("Error ", err.message);
									}

									console.log('Successfully upload user Pic.');
									res.statusCode = 302;
									res.setHeader("Location", "/Admin");
									res.end();


								});

						})



					}
				}

			})

		})
	}

);



//======================================================API END POINTS==========================================
//USER LOGIN AND REGISTRATION


app.post("/login", User.login);
app.post("/signUp", User.signUp);
app.post('/api/EnterOne', Beers.enterOne);
app.get('/GetBeers', Beers.getBeers);
app.get('/api/GetUserDetails/:emailId', User.User_Details);
app.get('/api/GetBeerDetails/:id', Beers.editBeerPost);
app.delete('/api/DeleteBeerPost/:_id', Beers.deleteBeerPost);
//app.post('/Upload', User.addImage);


storage = multer.diskStorage({
	destination: './public/BeerImages',
	filename: function (req, file, cb) {
		return crypto.pseudoRandomBytes(16, function (err, raw) {
			if (err) {
				return cb(err);
			}

			var beerid = req.params.id;
			console.log("beerid=== ", beerid);


			//	var today2 = new Date().getTime();
			//return cb(null, "" + req.params.postId + (path.extname(file.originalname)));

			return cb(null, "" + beerid + (path.extname(file.originalname)));
		});
	}

});




//  app.get("/", function(req, res) {
// 	res.sendFile(__dirname + "/index.html");
// });
app.post("/uploadBeerPic/:id", multer({
		storage: storage
	}).single('adduserform'), function (req, res) {
		console.log("req.file.filename ======================", req.file.filename);
		console.log("File uploaded sucessfully!.");
		console.log("=======body===========", req.body);
		var beerid = req.params.id;
		console.log("======id of the beer=====", req.params.id);


		var Imagepath = "/BeerImages/" + req.file.filename;
		var Image = "/BeerImages/" + req.params.id;
		console.log("Imagepath==", Imagepath);

		Beers.findOne({
			_id: beerid
		}, function (err, form2) {
			console.log("User Details ", form2);
			if (err) {
				res.sendStatus(500);
			}
			if (form2 == null) {
				console.log("User details not found");
			} else {
				if (form2.Image == null || form2.Image == "") {
					console.log("User Image value is null");

					// Update in the mongodb now.

					Beers.update({
							_id: beerid
						}, {
							$set: {
								Image: Imagepath
							}
						}, {
							w: 1
						},


						function (err, form1) {

							if (err) {
								res.sendStatus(500);
								console.log("Error ", err.message);
							}

							console.log('Successfully uploaded beer Pic.');
							res.statusCode = 302;
							res.setHeader("Location", "/Admin");
							res.end();


						});

				} else {
					console.log("Image is not null, Updating the image now...")
					Beers.update({
							_id: beerid
						}, {
							$set: {
								Image: Imagepath
							}
						}, {
							w: 1
						},


						function (err, form1) {

							if (err) {
								res.sendStatus(500);
								console.log("Error ", err.message);
							}

							console.log('Successfully uploaded beer Pic.');
							res.statusCode = 302;
							res.setHeader("Location", "/Admin");
							res.end();


						});

				}
			}

		})


	}

);



//======================================================Connect to Port================================================================

const PORT = process.env.PORT || 4000;
app.listen(PORT);
console.log("Server connected to port" + " " + PORT);