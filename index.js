var express = require('express');
var cors = require('cors');
require('dotenv').config()
var app = express();

//------------------ MULTER PACKAGE -----------------//
const multer = require('multer'); // added
//----------- Multer Option: DEST ---------//
/*// this option creates the folder "uploads/" and generates a random filename.
const upload = multer({ dest: "uploads/"});
*/
//----------- Multer Option: DISK STORAGE ---------//
/*// this option does not create the folder you set (YOU MUST CREATE MANUALLY), but it allows to change the filename.
*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // MUST CREATE FOLDER "./uploads/" MANUALLY IN REPLIT
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const hasExtension = /[.]/.test(file.originalname);
    let newFileName = file.originalname + uniqueSuffix;
    if(hasExtension) {
      const array = file.originalname.split(".");
      newFileName = array[0] + uniqueSuffix + "." + array[1];
    }
    cb(null, newFileName);
  }
}); 
const upload = multer({ storage: storage});

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

//------------------- ROOT-LOGGER -----------------//
app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
})



//-------------- FILE ANALYSE API ----------------//
/*// <form enctype="multipart/form-data" method="POST" action="/api/fileanalyse">
// <input id="inputfield" type="file" name="upfile">
// <input id="button" type="submit" value="Upload">*/
app.post("/api/fileanalyse", (req, res) => {
  upload.single("upfile")(req, res, (err) => {
    
    // error handling (1 = error, 0 = ok)
    if(handleUploadError(err, res) === 1) return;
    
    // print request file and body objects
    printRequestFileAndBody(req);
    // print file uploaded
    printFileUploaded(req);

    // respond
    res.json({
      name: req.file.originalname,
      type: req.file.mimetype,
      size: req.file.size
    });
  });
});

//-------------- AUXILIARY FUNCTIONS -------------//
function printError(message, err, res) {
  console.error(message, err);
  res.send("" + err);
}
function printRequestFileAndBody(req) {
  console.log("Request File:\n", req.file);
  console.log("Request Body:\n", JSON.stringify(req.body));
}
function printFileUploaded(req) {
  console.log(`File '${req.file.originalname}' was uploaded to '${req.file.destination}'`);
}
function handleUploadError(err, res) {
  // (1 = error, 0 = ok)
  if (err instanceof multer.MulterError){
    printError("Error: A Multer error occurred when uploading.\n", err, res);
    return 1;
  }
  else if (err) {
    printError("Error: An error occurred when uploading.\n", err, res);
    return 1
  }
  return 0;
}



const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});
