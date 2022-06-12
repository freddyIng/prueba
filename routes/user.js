require('dotenv').config();
const router=require('express').Router();
//configuracion de s3
const { S3Client, GetObjectCommand, ListObjectsCommand}=require('@aws-sdk/client-s3');
const multer=require('multer');
const multerS3=require('multer-s3');
const { Upload }=require('@aws-sdk/lib-storage');
const got=require('got');
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
  	  cb(null,'usuario-'+Date.now().toString()) //file.originalname
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

router.post('/upload:api', async (req, res) => {
    try{
    const response=got.stream(req.body.api);
    const upload=new Upload({
      client: s3,
      params: {
      	ACL: 'public-read',
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `usuario-${Date.now().toString()}`,
        Body: response
      }
    });
    let result=await upload.done();
    console.log('hecho');
    console.log(result);
    res.json({message: 'OK'});
  } catch(err){
    console.log(err);
    res.json({message: 'Error'});
  }
});

router.get('/link-file', async (req, res) => {
  
});

router.put('/change:file-name', async (req, res) => {
  
});


module.exports=router;