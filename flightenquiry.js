var express=require('express');
var router=express.Router();
var pool=require('./pool');
var upload=require('./multer');
const bodyParser=require("body-parser");
var LocalStorage=require('node-localstorage').LocalStorage;
localStorage=new LocalStorage('./scratch');

router.get('/flightinterface',function(req,res){
    var admin=JSON.parse(localStorage.getItem('ADMIN'))
    if(admin)
    res.render('flightinterface',{message:' '})
else{
    res.render('adminlogin',{message:' '})
}
})

router.get('/displayallflights',function(req,res){
    var admin=JSON.parse(localStorage.getItem('ADMIN'))
    if(!admin)
        res.render('adminlogin',{message:' '})
    
    else
   { pool.query("select F.* ,(select C.cityname from cities C where C.cityid=F.sourcecity)as source,(select C.cityname from cities C where C.cityid=F.destinationcity)as destination  from flightsdetails F",function(error,result){
             if(error){
            
                console.log(error)
               res.render('displayallflights',{'data':[],'message':'Server Error'})
              }
            else {
                res.render('displayallflights',{'data':result,'message':'Success'}) 
            }
        })
    }
})

router.get('/searchbyid', function(req, res) {
    pool.query("SELECT F.*, (SELECT C.cityname FROM cities C WHERE C.cityid = F.sourcecity) AS source, (SELECT C.cityname FROM cities C WHERE C.cityid = F.destinationcity) AS destination FROM flightsdetails F WHERE flightid = ?", [req.query.fid], function(error, result) {
        if (error) {
            console.log(error);
            res.render('flightbyid', { 'data': [], 'message': 'Server Error' });
        } else {
            if (result.length > 0) {
                res.render('flightbyid', { 'data': result[0], 'message': 'Success' });
            } else {
                res.render('flightbyid', { 'data': [], 'message': 'No flight found with this ID' });
            }
        }
    });
});






router.post('/flightsubmit',upload.single('logo'), function(req,res){
    console.log("BODY",req.body);
    console.log("file",req.file);
    
    var days=(""+req.body.days).replaceAll("'",'"')
    console.log(req.body.days)
    pool.query("insert into flightsdetails( flightname, types, totalseats, days, sourcecity, departuretime, destinationcity, arrivaltime, company, logo)values(?,?,?,?,?,?,?,?,?,?)",[req.body.flightname,req.body.flighttype,req.body.noofseats,days,req.body.sourcecity,req.body.deptime,req.body.destinationcity,req.body.arrtime,req.body.company,req.file.originalname],function(error,result){

        if(error)
        {
            console.log(error)
           res.render('flightinterface',{'message':'Server Error'})
        }
        else{
            res.render('flightinterface',{'message':'Record Submitted Successfully'}) 
        }
       
  })
})



router.get('/fetchallcities',function(req,res){
     pool.query("Select * from cities",function(error,result){
        if(error)
        {
        res.status(500).json({result:[],message:'Server Error'})
        }
        else{
            res.status(200).json({result:result,message:'Success'})
        }
     })
})


router.post('/flight_edit_delete', function(req, res) {
    if (req.body.btn === "Edit") {
        var days = ("" + req.body.days).replaceAll("'", '"');
        console.log(req.body.days);
        pool.query("UPDATE flightsdetails SET flightname=?, types=?, totalseats=?, days=?, sourcecity=?, departuretime=?, destinationcity=?, arrivaltime=?, company=? WHERE flightid=?",
            [req.body.flightname, req.body.flighttype, req.body.noofseats, days, req.body.sourcecity, req.body.deptime, req.body.destinationcity, req.body.arrtime, req.body.company, req.body.flightid],
            function(error, result) {
                if (error) {
                    console.log(error);
                    res.redirect('/flight/displayallflights');
                } else {
                    res.redirect('/flight/displayallflights');
                }
            });
    } else {
        console.log(req.body.days);
        pool.query("DELETE FROM flightsdetails WHERE flightid=?", [req.body.flightid], function(error, result) {
            if (error) {
                console.log(error);
                res.redirect('/flight/displayallflights');
            } else {
                res.redirect('/flight/displayallflights');
            }
        });
    }
});


router.get('/searchbyidforimage', function(req, res) {
    pool.query("SELECT F.*, (SELECT C.cityname FROM cities C WHERE C.cityid = F.sourcecity) AS source, (SELECT C.cityname FROM cities C WHERE C.cityid = F.destinationcity) AS destination FROM flightsdetails F WHERE flightid = ?", [req.query.fid], function(error, result) {
        if (error) {
            console.log(error);
            res.render('showimage', { 'data': [], 'message': 'Server Error' });
        } else {
            res.render('showimage', { 'data':result [0], 'message': 'Success' });
        }
    });
});



router.post('/editimage',upload.single('logo'), function(req,res){
    console.log("BODY",req.body);
    console.log("file",req.file);
    
    // var days=(""+req.body.days).replaceAll("'",'"') not required
    console.log(req.body.days)
    pool.query("update flightsdetails set logo=? where flightid=?",[req.file.originalname,req.body.flightid],function(error,result){

        if(error)
        {
            console.log(error)
            res.redirect('/flight/displayallflights');
        }
        else{
            res.redirect('/flight/displayallflights');
        }
       
  })
})


module.exports=router;
