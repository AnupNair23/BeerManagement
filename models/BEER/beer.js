var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var token;
const config = require('./../../config/appConfig');
const secret = config.secret;


//Beer schema

var BeerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: ""
    },

    price: {
        type: String,
        required: true,
        index: true
    },

    flavour: {
        type: String,
        default: ""
    },

    Image: {
        type: String,
        default: null
    }


});

//------------------------------------------Model---------------------------------------------------------------------------
var BeerDb = module.exports = mongoose.model('beers', BeerSchema);


// BEER REGISTRATION 


module.exports.enterOne = function (req, res) {

    var part = req.headers.authorization;
    console.log("user part==================", part);
    var token = part.split(' ')[1];
    console.log("user Token==================", token);

    var decoded = jwt.verify(token, secret);
    console.log("user decoded==================", decoded);
    var role = decoded.role;
    console.log("Token Role==================", role);


    var emailId = req.body.emailId;
    var Beer = "BeerDb";

    var formBody = new BeerDb({

        name: req.body.name,
        category: req.body.category,
        price: req.body.price,
        flavour: req.body.flavour

    });
    var name = req.body.name;
    var mobNo = req.body.phone;


    console.log("req.body.name :", req.body.name);




    //Create new user
    BeerDb.create(formBody, function (err, beerprof) {
        console.log(" beerprof : ", beerprof);
        if (err) {
            console.log(" Error in creating beer ", err.message);
            res.status(500).json({
                "error": err.message
            })
            return;
        }
        console.log(beerprof.name + " " + " created succesfully ");
        //		log.info(userProfile.username + " " + " created succesfully ");
        //res.json(userProfile);
        BeerDb.findOne({
            name: name
        }, function (err, form2) {
            if (err) {
                res.sendStatus(500);
                console.log(" Error in finding beer ", err.message);
                return;
            }
            console.log("form2=========", form2);
            var string = JSON.stringify(form2)
            var json = JSON.parse(string);

            var resultdata = {
                "name": form2.name,
                "category": form2.category
            };
            var token = jwt.sign(resultdata, secret, {
                expiresIn: 60 * 60 * 24 * 365 * 25
            });
            console.log("Signup token===", token);
            res.status(200).json({
                "name": form2.name,
                "emailId": form2.emailId,
                "category": form2.category,
                "token": token,
                "beerId": form2._id,
                

            });
        });
    });
}


//=================================== LIST OF BEERS ===================================================

module.exports.getBeers = function (req, res) {

        
    if (role = "ADMIN") {
    BeerDb.find({},function (err, result) {	
    
            if (err) {
            res.send({ "code":500, "failed":"error ocurred"})
            console.log( " error",err.message);
            }
            console.log( "  Beer details fetched succesfully ",result );
            res.json(result);
    
    })
} 
}

//---------------------------------------EDIT BEER POSTS---------------------------------------------------------

module.exports.editBeerPost = function (req, res) {
    var id = req.params.id;
    console.log( " id of current beer === ",id);  
            
    BeerDb.findOne({name:id}, function (err, result) {	
        
                if (err) {
                res.send({ "code":500, "failed":"error ocurred"})
                console.log( " error",err.message);
                }
                console.log( " Beer details fetched succesfully ",result );
              
                res.json(result);
        
        })
    } 


  //-------------------------------------------DELETE BEER --------------------------------------------------


module.exports.deleteBeerPost=function (req, res) {
	
	var beerId=req.params._id;
	console.log("beerId to be deleted=== ",beerId);
	BeerDb.findOne({_id : beerId}, function(err, form2){
		console.log("This is about to get deleted===  ",form2);
		
        if (err) {
            res.sendStatus(500);
            console.log("Error ",err.message);
        }
        BeerDb.remove({_id : beerId}, function(err, result){
				//	log.info("Beer deleted succesfully " );
					if (err) throw err;
					console.log("Beer deleted succesfully ");
					res.send(
					  'DELETED'
						);
				  })
				
		console.log("Beer"+" "+form2.name+" "+"deleted succesfully" );	
//		log.info("Beer"+" "+form2.name+" "+"deleted succesfully" );	
		
		
		})
	
}