const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const MongoClient = require('mongodb').MongoClient

//require('./dotenv')

const connectionString = 'mongodb+srv://chandrarose:zBs0luUnygtbgFJd@cluster0.qtg4tr8.mongodb.net/?retryWrites=true&w=majority';

MongoClient.connect(connectionString,{useUnifiedTopology: true})
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('song-lyrics')
        const quotesCollection = db.collection('quotes')

        //Middlewares
        //tell express we're using EJS as the template engine
        app.set('view engine','ejs')


        app.use(bodyParser.urlencoded({ extended: true }))

        //so our server will read JSON
        app.use(bodyParser.json())


        //tell express to make the public folder accessibile to the public
        app.use(express.static('public'))

        //Routes
        app.get('/', (req,res) => {
            db.collection('quotes').find().toArray()
                .then(results => {
                    res.render('index.ejs', { quotes: results})
                })
                .catch(error => console.log(error))
        })


        app.post('/quotes', (req,res) => {
            quotesCollection.insertOne(req.body)
            .then(result => {
                res.redirect('/')
            })
            .catch(error => console.error(error))
        })

        app.put('/quotes', (req,res) => {
            //MongoDB Collections built in method to find and change one item in out DB
            quotesCollection.findOneAndUpdate (
                //filter the collection with key-value pairs - this is a query
                { name: 'Yoda'},
                {
                    //$set is an update operator from MDB
                    $set: {
                        name: req.body.name,
                        quote: req.body.quote
                    }
                },
                //this will force MDB to create a new DV quote if no Yoda quote exists - upsert means insert a document if no document can be updates
                {
                    upsert: true
                }
            )
            .then(result => res.json('Success'))
            .catch(error => console.error(error))
        })

        app.delete('/quotes', (req,res) => {
            quotesCollection.deleteOne(
                //this is the query
                {name: req.body.name}
            )
            //send the response back to the JS in the call
            .then(result => {
                if(result.deletedCount === 0) {
                    return res.json('No quote to delete')
                }
                res.json('Deleted Darth Vader\'s quote')
            })
            .catch(error => console.error(error))
        })


        //Listen

        const isProduction = process.env.NODE_ENV === 'production'
        const port = isProduction ?7500 : 3000

        app.listen(port, function() {
            console.log(`listening on ${port}`)
        })    
    })
    .catch(console.error)




    