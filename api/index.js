const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const server = express();
server.use(cors());
server.use(bodyParser.json())

// mysql connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_cdax_testing'
})

db.connect((err)=>{
    if(err){
        console.error('Database Conncetion Failed:', err.stack);
        return;
    }
    console.log("Connected to MySQL Database")
})

// fetch site-account
server.get('/site-account', (req, res) =>{
    db.query("SELECT * FROM site_account", (err, result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.json(result)
        }
    })
})
//search data
server.get('/site-account/search', (req, res)=>{
    const param = req.query.q;
    if (!param) {
        return res.status(400).json({ error: "Search query is required" });
    }

    const sql = `SELECT * FROM site_account WHERE Company LIKE ? OR Email LIKE ? OR City LIKE ?`;

    const searchValue = `%${param}%` ;

    const dbquery = db.query(sql,[ searchValue, searchValue, searchValue ],(err, result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.json(result)
        }
    })
})
// add new site-account
server.post('/site-account', (req, res) => {
    const {
        Company,
        Email,
        PrimaryPhone,
        AddressLine1,
        AddressLine2,
        City,
        StateProvince,
        Country,
        ZipPostalCode   
    } = req.body;
    db.query('INSERT INTO site_account (Company, Email, PrimaryPhone, AddressLine1, AddressLine2, City, StateProvince, Country, ZipPostalCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [Company, Email, PrimaryPhone, AddressLine1, AddressLine2, City, StateProvince, Country, ZipPostalCode], (err, results) => {
      if (err) {
        res.status(500).send(err);
      } else {
        res.json({ id: results.insertId, Company, Email, PrimaryPhone, AddressLine1, AddressLine2, City, StateProvince, Country, ZipPostalCode });
      }
    });
  });

  //fetch 
  // fetch asset_information
server.get('/asset-information', (req, res) =>{
    db.query("SELECT * FROM asset_information", (err, result) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.json(result)
        }
    })
})

const port = 3010;
server.listen(port, () => {
 console.log(`Example app listening on port ${port}`);
});