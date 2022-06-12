require('dotenv').config();
const router=require('express').Router();
//configuracion de s3
const { S3Client, GetObjectCommand, CopyObjectCommand, DeleteObjectCommand, ListObjectsCommand}=require('@aws-sdk/client-s3');
const multer=require('multer');
const multerS3=require('multer-s3');
const { Upload }=require('@aws-sdk/lib-storage');
const got=require('got');
const users=require('../src/users.js');
const files=require('../src/files.js');

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
  	  cb(null,`${req.user.id.toString()}/${Date.now().toString()}`)
  	}
  })
});

function authenticated(req, res, next){
  if (req.isAuthenticated()){
    next();
  } else{
    return
  }
}

router.post('/upload', authenticated, upload.single('user-file'), async (req, res) => {
  try{
    await files.create({
      userId: req.user.id,
      key: req.file.key,
      location: req.file.location
    });
    res.json({message: 'OK'});
  } catch(err){
    res.json({message: 'error'});
  }
  console.log(req.user);
  console.log(req.file);
});

router.get('/download', authenticated, async (req, res) => {
  try{
  	//Solo envio el link (location) del archivo en formato json
  	let result=await files.findAll({
  	  attributes: ['location'],
  	  where: {
  	    key: `${req.user.id.toString()}/${req.query.fileKe}`,
  	    idUser: req.user.id
  	  }
  	});
    res.json({message: 'Ok', location: result[0]});
  } catch(err){
  	res.json({message: 'error'})
    console.log(err);
  }
});

router.put('/rename:file', authenticated, async (req, res) => {
  //Copio y renombro el archivo, para luego eliminar el archivo original
  try{
  	const oldKey=req.body.oldKey;
    const inputCopy={
      ACL: 'public-read',
      Bucket: process.env.AWS_S3_BUCKET,
      CopySource: `${process.env.AWS_S3_BUCKET}${oldKey}`,
      Key: `${req.user.id.toString()}/${req.body.newKey}`
    };
    const copyCommand=new CopyObjectCommand(inputCopy);
    const copyResponse=await s3.send(copyCommand);
    console.log(copyResponse);
    await files.update({key: `${req.user.id.toString()}/${Date.now().toString()}`}, {
      where: {
        key: `${req.user.id.toString()}/${req.body.newKey}`
      }
    });
    const inputDelete={
      Bucket: process.env.AWS_S3_BUCKET,
      Key: oldKey
    };
    const deleteCommand=new DeleteObjectCommand(inputDelete);
    const deleteResponse=await s3.send(deleteCommand);
    console.log(deleteResponse);
    res.json({message: 'OK'});
  } catch(err){
    res.json({message: 'error'});
    console.log(err);
  }
});

/*router.get('/objects', async (req, res) => {
  const options={
    Bucket: process.env.AWS_S3_BUCKET
  };
  const command=new ListObjectsCommand(options);
  const result=await s3.send(command);
  console.log(result);
});*/

router.post('/upload:api', authenticated, async (req, res) => {
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
    const result=await upload.done();
    console.log('hecho');
    console.log(result);
    res.json({message: 'OK'});
  } catch(err){
    console.log(err);
    res.json({message: 'Error'});
  }
});


module.exports=router;