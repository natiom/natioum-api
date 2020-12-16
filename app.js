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


// All Used Express Routes


app.use('/word', (req, res, next) => {
    res.json({ msg: "Hello word :)" });
});

app.use('/admin', admin);



// All Used Models Declaration

const Admin = require('./models/admin');
const Vilage = require('./models/vilage');
const VilageGov = require('./models/vilgov');
const VilageManager = require('./models/vil-manager');
const Manager = require('./models/manager');



// All Models Associations

Vilage.hasOne(VilageGov, {onDelete: 'CASCADE'});
VilageGov.belongsTo(Vilage);

Vilage.hasOne(VilageManager, {onDelete: 'CASCADE'});
VilageManager.belongsTo(Vilage);

Manager.hasMany(VilageManager, {onDelete: 'CASCADE'});
VilageManager.belongsTo(Manager);



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


