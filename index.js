const dotenv  = require("dotenv");
const express = require("express");
const sqlite  = require("sqlite3").verbose();
const fs      = require('fs/promises');
const app     = express();

const db = new sqlite.Database('../database/data.db', (err) => {
    if(err){
        console.log(err);
        return;
    }

    console.log("Connected to DB");
});

app.use(express.json());

app.set('port', process.env.PORT || 3000);

app.get('/', (req, res) => {
    return res.send("hello");
});

app.post('/sensor', (req, res) =>{
   
});

app.get('/sensor', (req, res) =>{
    let query = 'SELECT * FROM Sensor;'
    db.all(query, [], (err, rows) => {
        if(err){
            throw err;
        }

        return res.send(rows);

    })
});


app.get('/type', async (req, res) =>{
    let query = 'SELECT * FROM Type;'
    db.all(query, [], (err, rows) => {
        if(err){
            throw err;
        }

        return res.send(rows);

    })
});

//bring the panel with the last data registered
app.get('/panel', (req, res) => {
    let res_arr = new Array();
    let Panel = {
        id,
        sensorName,
        description,
        value
    }
});

app.post('/panel', (req, res) => {
    let res_message = {
        message, 
        code
    }

    const {sensor_id, description} = req.body;
    const query = `INSERT INTO Panels(sensor_id, description) VALUES(${sensor_id}, ${description})`;
    db.all(query, [], (err, rows)=> {
        if(err){
            console.log(err);
            return res.statusCode(500);
        }
        res_message.message = "success";
        res_message.code    = 0;

        return res.send(res_message).statusCode(200);
    });
});

//get last data adquired of each sensor
app.get('/data', (req, res) => {
    
});

//creats an CSV file with all data callected from a sensor
app.get('/data/file/:sensorID', async (req, res) =>{
    const id = req.params.sensorID;
    let query = `SELECT Register.value, Register.date, Sensor.name FROM Register JOIN Sensor ON Register.Sensor_id=Sensor.id WHERE Sensor.id == ${id}`;
    
    //code is used to inform the client if there is data or not, also you can check ir url is empty.
    //0 -> there is some data
    //1 -> there is no data
    let response = {
        fileName: '',
        code: 0
    }

    db.all(query, [], async (err, rows) => {
        if(err){
            console.log(err);
            return res.statusCode(500);
        }

        if(rows.length <= 0){
            response.code = 1;
            return res.send(response).statusCode(404);
        }

        let sensorName = rows[0].name.replace(/\s/g, '');
        let fileName = `${sensorName}_${Date.now()}.csv`;
     
        let titlesColumns = 'date, value';
        await fs.writeFile(`./download/${fileName}`, titlesColumns, {flag: 'a'});
        
        rows.map(async data =>{           
            let csvStringData = `\n${data.date},${data.value}`;
            await fs.appendFile(`./download/${fileName}`, csvStringData, {flag: 'a'});
        });

        response.fileName = fileName;
        
        return res.send(response).statusCode(200);;

    })
});

app.get('/download/:fileName', (req, res) =>{
    const fileName = req.params.fileName;
    res.download(`download/${fileName}`);
});

app.listen(app.get('port'), ()=>{
    console.log(`Listening on port ${app.get('port')}`);
});