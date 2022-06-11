require('dotenv').config();
const router=require('express').Router();
//configuracion de s3
const { S3Client, GetObjectCommand, ListObjectsCommand}=require('@aws-sdk/client-s3');
const multer=require('multer');
const multerS3=require('multer-s3');
const s3=new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
  	secretAccessKey: process.env.AWS_S3_SECRET,
    accessKeyId: process.env.AWS_S3_KEY
  }
});

const upload=multer({
  storage: multerS3({
  	s3: s3,
  	bucket: process.env.AWS_S3_BUCKET,
  	acl: 'public-read',
  	metadata: function(req, file, cb){
  	  cb(null, Object.assign({}, req.body))
  	},
  	key: function(req, file, cb){
  	  cb(null,'usuario-'+file.originalname) //Date.now().toString()
  	}
  })
});

router.post('/upload', upload.single('user-file'), async (req, res) => {
  console.log(req.file);
});

router.get('/download', async (req, res) => {
  try{
  	//Solo envio el link del archivo en formato json
    let fileKey=req.query.fileKey;
    res.json({message: 'Ok', fileLink: `http://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileKey}`});
  } catch(err){
  	res.json({message: 'error'})
    console.log(err);
  }
});

router.get('/objects', async (req, res) => {
  let options={
    Bucket: process.env.AWS_S3_BUCKET
  };
  let command=new ListObjectsCommand(options);
  let result=await s3.send(command);
  console.log(result);
});


module.exports=router;