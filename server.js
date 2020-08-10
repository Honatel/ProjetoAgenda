require('dotenv').config()
const express = require('express')
const app = express();
const mongoose = require('mongoose');
mongoose.connect(process.env.CONNECTIONSTRING,
    { useNewUrlParser: true , 
      useUnifiedTopology: true, 
      useFindAndModify: false
    })
    .then(() => {
        console.log('conectado a base do mongo...')
        app.emit('pronto');
    })
    .catch(e => console.log(e));

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const route = require('./routes');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');
const {checkCsrfError, csrfMiddleware} = require('./src/middleware/middleware');
app.use(helmet());
app.use(express.urlencoded({ extended : true}));
//express.json
app.use(express.static(path.resolve(__dirname, 'public')));
const sessionOptions = session({
    secret: 'secreteTeste',
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 1000 * 60 * 60 * 24 * 7, 
        httpOnly: true 
    }  
});
app.use(sessionOptions);
app.use(flash());
app.set('views', path.resolve(__dirname, 'src', 'views'))
app.set('view engine', 'ejs');
app.use(csrf());

app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(route);

//informando ao express onde esta a minha rota de views
//informando ao express qual engine ele vai utilizar, tipo 'razor', nessa caso ejs

app.on('pronto', () => {
    app.listen(3000, () => {
        console.log('app escutando na porta 3000')
    });
})
