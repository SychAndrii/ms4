/*************************************************************************
* BTI325– Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Andrii Sych Student ID: 125752212 Date: 2022-10-09
*
* Your app’s URL (from Cyclic) : https://strange-overshirt-cod.cyclic.app/
*
*************************************************************************/ 
const express = require('express')
const fs = require('fs')
const path = require('path')
const dataService = require('./data-service')
const multer = require('multer')

const app = express()
const PORT = process.env.PORT || 8080

const storage = multer.diskStorage({
    destination: "./public/images/uploaded/",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
const upload = multer({storage: storage});

app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => res.sendFile(path.join(__dirname + '/views/home.html')))
app.get('/images/add', (req, res) => res.sendFile(path.join(__dirname + '/views/addImage.html')))
app.post('/images/add',  upload.single('imageFile'), (req, res) => res.redirect('/images'))
app.get('/images', (req, res) => {
    fs.readdir('./public/images/uploaded', {withFileTypes: true}, (err, files) => {
        if(err)
            res.send('could not read a file')
        else {
            const json = {
                images: files
            }
            res.json(json)
        }
    })
})
app.get('/employee/:id', (req, res) => {
    dataService.getEmployeeByNum(req.params.id)
    .then(data => res.json(data)) 
})
app.get('/employees/add', (req, res) => res.sendFile(path.join(__dirname + '/views/addEmployee.html')))
app.post('/employees/add', (req, res) => {
    dataService.addEmployee(req.body).then(() => res.redirect('/employees'));
})
app.get('/about', (req, res) => res.sendFile(path.join(__dirname + '/views/about.html')))
app.get('/departments', (req, res) => {
    dataService.getDepartments()
    .then((data) => res.json(data))
    .catch((err) => res.json({message: err}))
})
app.get('/employees', (req, res) => {
    if(req.query.status)
        dataService.getEmployeesByStatus(req.query.status)
        .then((data) => res.json(data))
        .catch((err) => res.json({message: err}))
    else if(req.query.department)
        dataService.getEmployeesByDepartment(req.query.department)
        .then((data) => res.json(data))
        .catch((err) => res.json({message: err}))
    else if(req.query.manager)
        dataService.getEmployeesByManager(req.query.manager)
        .then((data) => res.json(data))
        .catch((err) => res.json({message: err}))
    else
        dataService.getAllEmployees()
        .then((data) => res.json(data))
        .catch((err) => res.json({message: err}))
})
app.get('/managers', (req, res) => {
    dataService.getManagers()
    .then((data) => res.json(data))
    .catch((err) => res.json({message: err}))
})

app.use((req, res) => res.status(404).send('404 not found'))

dataService.Initialize()
.then(() => app.listen(PORT || 8080, () => console.log(`Listening on port ${PORT}`)))
.catch(err => console.log(err))