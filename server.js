//// This is all a lot to look at. Some things don't seem to be nested properly and is making it all difficult to read


//---- Requirements
// These are all the components we will need to run our serverconst express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()

//---- Database connection
// This creates the db container
let db,    
    // This sets up the connection for our database so it can communicate with our server
    dbConnectionStr = process.env.DB_STRING,
    // sets dbName to todo
    dbName = 'todo'

// This is makes the connection to our database
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })


//---- Modules
// Allows us to use ESJ 
app.set('view engine', 'ejs')
// Allows us to access the public folder
app.use(express.static('public'))
// Informs our server to use the information that is input into the page
app.use(express.urlencoded({ extended: true }))
// Converts JSON files
app.use(express.json())


//---- Routes


    //---- Receive (Pulls in data from our database)
    app.get('/',async (request, response)=>{
        //  Finds all items in our todo list and places them into an array
        const todoItems = await db.collection('todos').find().toArray()
        // Finds todos that are not complete and tells us how many are left
        const itemsLeft = await db.collection('todos').countDocuments({completed: false})
        // Sends the the above information over to EJS where they are rendered for us
        response.render('index.ejs', { items: todoItems, left: itemsLeft })
   
   
            //// Not in use
                 // db.collection('todos').find().toArray()
                 // .then(data => {
                 //     db.collection('todos').countDocuments({completed: false})
                 //     .then(itemsLeft => {
                 //         response.render('index.ejs', { items: data, left: itemsLeft })
                 //     })
                 // })
                 // .catch(error => console.error(error))
})


//---- Create (Adds something to our database)
app.post('/addTodo', (request, response) => {
    // Searches the todo collection and adds something from the body and marks it as incomplete
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        // Console log tells us it was added
        console.log('Todo Added')
        // This reloads the page and starts the get again
        response.redirect('/')
    })
    // If there is an error we will get it here
    .catch(error => console.error(error))
})


//---- Update (updates something in our database)
app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})

app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false
          }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})


//---- Delete (deletes something from our database)
app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})


//---- Port Listener
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})