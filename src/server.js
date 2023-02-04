import express from "express";
import productRouter from './routes/product.js';
import cluster from "cluster";
import * as os from 'os'
import cartRouter from './routes/cart.js';
import userRouter from './routes/user.js';
import otherRouter from './routes/other.js';
import session from 'express-session';
import {engine} from 'express-handlebars';
import path from 'path';
import {fileURLToPath} from 'url';
import mongoStore from 'connect-mongo';

import minimist from 'minimist';
import { Console } from "console";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static('public'));

app.set('views', './src/views');
app.set('view engine', 'hbs');

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}))

app.use(
    session({
        store: mongoStore.create({
            mongoUrl: process.env.MONGO_URI,
            options: {
                userNewParser: true,
                useUnifiedTopology: true,
            }
        }),
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: true,
        cookie: {maxAge: 600000} //10 min.
        
}))

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/productos', productRouter);
app.use('/api/carrito', cartRouter);
app.use('/api/usuario', userRouter);
app.use('/test', otherRouter);

const modoCluster = process.argv[3] == 'CLUSTER'

if(modoCluster && cluster.isPrimary){

    const numCPUS = os.cpus().length;

    console.log(`Numero de procesadores: ${numCPUS}`)
    console.log(`Primary ${process.pid} in running`)

    for (let i = 0; i < numCPUS; i++) {
        cluster.fork()
    }

    cluster.on('exit', Worker => {
        console.log(`Worker ${Worker.process.pid} died`, new Date().toLocaleString())
        cluster.fork()
    })

} else {
    const app = express();
    const PORT = parseInt(process.argv[2]) || 8080;

    app.get(`/datos`, (req, res) =>{
        res.send(`Server en port(${PORT}) - PID ${process.pid} - FyH ${new Date().toLocaleString()}`)
    })
    const server = app.listen(PORT, ()=>{
        console.log(`Servidor express escuchando en http://localhost:${PORT} - PID ${process.pid}`)
    })
    server.on('error', error => console.log(`Error en el servidor ${error}`))

}

/* --------------- Leer el puerto por consola o setear default -------------- */

const options = {
    alias: {
        "p": "PORT",
        "m": "MODO"
    },
    default: {
        "PORT": 8080,
        "MODO": "FORK"
    }
};

const { PORT } = minimist(process.argv.slice(2), options, modo);

const server = app.listen(PORT, () => {
    console.log(` >>>>> 🚀 Server started at http://localhost:${PORT}`)
    })
    
server.on('error', (err) => console.log(err));
