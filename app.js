// All Used External Moduless
const express = require('express');
const envData = require('./middleware/dotenv')();
const sequelize = require('./models/database');
const bodyParser = require('body-parser');
const multer = require('multer');
const uniqueSlug = require('unique-slug');
const logger = require('./middleware/logger');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const openApiDoc = require('./documentation/openapi.json');

const app = express();




// All Used External Middlewares

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images');
  },
  filename: function (req, file, cb) {
    cb(null, uniqueSlug() + Date.now() + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }else{
        cb(null, false);
    }
}


app.use(multer({ storage: storage, fileFilter: fileFilter }).array('myFiles', 12));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
app.use(bodyParser.json());
app.use(helmet());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});


// All Routes Declarations

const admin = require('./routes/admin');
const user = require('./routes/user');


// All Used Express Routes


app.use('/word', (req, res, next) => {
    res.json({ msg: "Hello word :)" });
});

app.use('/admin', admin);
app.use('/user', user);



// All Used Models Declaration

const Vilage = require('./models/vilage');
const VilageGov = require('./models/vilgov');
const VilageManager = require('./models/vil-manager');
const Manager = require('./models/manager');
const UserCredential = require('./models/user-credential');
const UserPassport = require('./models/user-passport');
const UserPost = require('./models/user-post');
const Comment = require('./models/comment');


// All Models Associations

Vilage.hasOne(VilageGov, {onDelete: 'CASCADE'});
VilageGov.belongsTo(Vilage);

Vilage.hasOne(VilageManager, {onDelete: 'CASCADE'});
VilageManager.belongsTo(Vilage);

Vilage.hasMany(UserPost, {onDelete: 'CASCADE'});
UserPost.belongsTo(Vilage);

Manager.hasMany(VilageManager, {onDelete: 'CASCADE'});
VilageManager.belongsTo(Manager);

UserCredential.hasOne(UserPassport, {onDelete: 'CASCADE'});
UserPassport.belongsTo(UserCredential);

UserCredential.hasMany(UserPost, {onDelete: 'CASCADE'});
UserPost.belongsTo(UserCredential);

UserCredential.hasMany(Comment, {onDelete: 'CASCADE'});
Comment.belongsTo(UserCredential);

UserPost.hasMany(Comment, {onDelete: 'CASCADE'});
Comment.belongsTo(UserPost);




// Error Handler Middleware Which Should Executes Last

app.use((error, req, res, next) => {
    const status = error.statusCode || 500; 
    const message = error.message;
    const data = error.data;
    
    logger.error(message, { status: status, data: data || 'empty' });
    res.status(status).json({ message: message, data: data });
});



const port = process.env.PORT || 3000;

sequelize
    .sync()
    .then(result => {
        app.listen(process.env.PORT, () => console.log('Server started on port 3000')); 
    })
    .catch(err => {
        console.log(err);
    });


