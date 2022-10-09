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
const app = express()
const PORT = process.env.PORT || 8080

app.get('/about', (req, res) => res.sendFile(path.join(__dirname + '/views/about.html')))
app.get('/departments', (req, res) => {
    dataService.getDepartments()
    .then((data) => res.json(data))
    .catch((err) => res.json({message: err}))
})
app.get('/employees', (req, res) => {
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