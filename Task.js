const Express = require('express');
const mongoose = require('mongoose');
const User = require('./mongooseModel.js');
const jwt = require('jsonwebtoken');
const SecretKey = 'someSecret';
const cors = require('cors')
const app = Express();
app.use(require('./multerModule.js'));
app.use(cors());
app.use(Express.json());

mongoose.connect('mongodb://localhost:27017/testDB', {useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true})
    .then(() => { console.log("Connection to DB succes"); } )
    .catch(ex => console.log(ex) );


app.post('/signup', function(Request, Response) {
    let obj = { };
    let Data = Request.body;

    let user = new User({
        first_name: Data.first_name.trim(),
        surname: Data.surname.trim(),
        phone: Data.phone,
        password: Data.password.trim()
    })

    user.save()
        .then(doc => {
            Response.status(201).send(doc._id);
        })
        .catch(ex => {
            try{ obj['first_name'] = ex.errors.first_name.properties.message; } catch(e) { }
            try{ obj['surname'] = ex.errors.surname.properties.message; } catch(e) { }
            try{ obj['phone'] = ex.errors.phone.properties.message; } catch(e) { }
            try{ obj['password'] = ex.errors.password.properties.message; } catch(e) { }
            if (ex.message.includes('E11000 duplicate key'))
                obj['phone'] = ex.message;
            Response.status(422).json(obj);
        });
});

app.post('/login', function(Request, Response){
    let obj = { };
    let Data = Request.body;

    if( Data.phone.trim() == '' )       obj['phone'] = 'Path `phone` is required.';
    if( Data.password.trim() == '' )    obj['password'] = 'Path `password` is required.';
    if( Object.keys(obj).length != 0 )  return Response.status(422).json(obj);

    User.findOne({phone: Data.phone, password: Data.password})
        .then(doc => {
            if(doc){
                let Token = jwt.sign({
                    phone: doc.phone,
                    ID: doc._id
                }, SecretKey, { expiresIn: '1h' });
                Response.status(200).json({token: Token});
            }
            else    Response.status(404).json({ login: 'Incorrect login or password' });
        })
        .catch(ex => {
            console.log(ex);
            Response.json({message: ex});
        })
});

function checkToken (Request, Response, next){
    let AuthHeader = Request.headers.authorization;
    let token = AuthHeader && AuthHeader.split(' ')[1];
    if (!token) return Response.status(403).json({message: 'You need authorization'});

    jwt.verify(token, SecretKey, (err, user) => {
        if (err)    return Response.status(401).json({message: 'You need authorization'});
        Request.user = user;
        next();
    });
}

app.post('/photo', checkToken, function(Request, Response){
    var Image = Request.file;
    if(!Image) return Response.status(422).json({message: 'No file or invalid tupe.'});
    Response.status(201).json({ name: Image.filename });
});

app.listen(5000, ()=>{
    var dir = './photo';
    if (!require('fs').existsSync(dir))    require('fs').mkdirSync(dir);
    console.log('Server run...');
});