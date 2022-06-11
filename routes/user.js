require('dotenv').config();
const router=require('express').Router();
//configuracion de s3
const { S3Client }=require('@aws-sdk/client-s3');
const multer=require('multer');
const multerS3=require('multer-s3');
const s3=new S3Client({
  region: process.env.AWS_S3_REGION
  credentials: {
  	secretAccessKey: process.env.AWS_S3_SECRET,
    accessKeyId: process.env.AWS_S3_KEY
  }
});

const upload=multer({
  storage: multerS3({
  	s3: s3,
  	bucket: process.env.AWS_S3_BUCKET,
  	metadata: function(req, file, cb){
  	  cb(null, {fieldName: file.fieldname})
  	},
  	key: function(req, file, cb){
  	  cb(null,'usuario-'+file.originalname) //Date.now().toString()
  	}
  })
});

router.post('/upload', upload.single('user-file'), async (req, res) => {
  console.log(3);
  console.log(req.file);
  console.log(req.files);
});

router.get('/dowload', async (req, res) => {
  
});


module.exports=router;