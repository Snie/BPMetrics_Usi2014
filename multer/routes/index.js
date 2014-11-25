var express = require('express');
var router = express.Router();
var fs = require('fs');
var userId = "Nicolo";

/* GET home page. */
router.get('/', function(req, res) {
	console.log(req.query);
	userId = req.query.userName;
	path = "./uploads/" + userId;
	if (fs.existsSync(path)) {
	}
	else {
		fs.mkdir(path);
	}
	res.render('dashboard', { username: userId });
});

router.get('/homepage', function(req, res){
	res.render('homepage')
});

router.get('/login', function(req, res){
	res.render('logIn')
});

router.get('/signup', function(req, res){
	res.render('signUp')
});

function createGuid()
{
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}


router.post('/file-upload', function(req, res) {
	console.log(userId);
	var fileArray = req.files.file 
	if(fileArray.length > 1){
		var dirId = createGuid();
		fs.mkdir("./uploads/" + userId + "/" + dirId);
		for (var x = 0; x < fileArray.length; x++){
			var tmp_path = fileArray[x].path;
			var target_path = "./uploads/" + userId + "/" + dirId + "/" +fileArray[x].name;
			fs.rename(tmp_path, target_path, function(err) {
		        if (err) throw err;
		  
		        fs.unlink(tmp_path, function() {
		            if (err) throw err;
		            
		        });
	    	});
		}
	}
	else {
		var tmp_path = fileArray.path;
			var target_path = "./uploads/" + userId + "/" + fileArray.name;
			fs.rename(tmp_path, target_path, function(err) {
		        if (err) throw err;
		        fs.unlink(tmp_path, function() {
		            if (err) throw err;
		            
		        });
	    	});
	}
	if (fileArray.length = 1){
		res.send("File uploaded to: /uploads/" + userId);
	}
	else {
		res.send('Files uploaded to: /uploads/' + userId );
	}
    // // get the temporary location of the file
    // var tmp_path = req.files.file[0].path;
    // console.log(tmp_path);
    // // set where the file should actually exists - in this case it is in the "images" directory
    // var target_path = './uploads/' + userId + '/' + req.files.file.name;
    // console.log(target_path);
    // // move the file from the temporary location to the intended location
    // fs.rename(tmp_path, target_path, function(err) {
    //     if (err) throw err;
    //     // delete the temporary file, so that the explicitly set temporary upload dir does not get filled with unwanted files
    //     fs.unlink(tmp_path, function() {
    //         if (err) throw err;
    //         res.send('File uploaded to: ' + target_path + ' - ' + req.files.file.size + ' bytes');
    //     });
    // });
});

module.exports = router;
