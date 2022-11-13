/*************************************************************************
* BTI325– Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Andrii Sych Student ID: 125752212 Date: 2022-10-30
*
* Your app’s URL (from Heroku) : https://afternoon-bayou-17237.herokuapp.com/
*
*************************************************************************/ 
const express = require('express')
const fs = require('fs')
const path = require('path')
const dataService = require('./data-service')
const multer = require('multer')
const handlebars = require('express-handlebars')

const app = express()
const PORT = process.env.PORT || 8080

const storage = multer.diskStorage({
    destination: "./public/images/uploaded/",
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });
const upload = multer({storage: storage});

app.engine('hbs', handlebars.engine({ extname: '.hbs',
                                      defaultLayout: 'main',
                                      helpers: {
                                        navLink: function(url, options){
                                            return '<li' +
                                            ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                                           
                                            '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
                                           },
                                           equal: function (lvalue, rvalue, options) {
                                                if (arguments.length < 3)
                                                    throw new Error("Handlebars Helper equal needs 2 parameters");
                                                if (lvalue != rvalue) {
                                                    return options.inverse(this);
                                                } else {
                                                    return options.fn(this);
                                                }
                                           },
                                           printDepartmentList: function(employee, departments) {
                                             let result = '<select class="form-control" id="department" name="department">';
                                             for (let i = 0; i < departments.length; i++) {
                                                result += '<option value="' + departments[i].departmentId + '"';
                                                if(departments[i].departmentId == employee.department) 
                                                    result += ' selected';
                                                result += '>' + departments[i].departmentName + '</option>';
                                             }
                                             result += '</select>';
                                             return result;
                                           }                                     
                                      }
                                    }));
app.set('view engine', 'hbs');

app.use(express.static('public'))
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/images/add', (req, res) => res.render('addImage'))
app.post('/images/add',  upload.single('imageFile'), (req, res) => res.redirect('/images'))
app.get('/images', (req, res) => {
    fs.readdir('./public/images/uploaded', {withFileTypes: true}, (err, files) => {
        if(err)
            res.send('could not read a file')
        else {
            res.render('images', {images: files})
        }
    })
})
app.get('/employees', async (req, res) => {
    try {
        let arr = [];
        if(req.query.department)
            arr = await dataService.getEmployeesByDepartment(req.query.department);
        else if(req.query.manager)
            arr = await dataService.getEmployeesByManager(req.query.manager);
        else if(req.query.status)
            arr = await dataService.getEmployeesByStatus(req.query.status);
        else 
            arr = await dataService.getAllEmployees()
        res.render('employees', {arr})
    }
    catch(err) {
        res.render('employees', {message: err})
    }
})
app.get('/departments', async (req, res) => {
    try {
        const departments = await dataService.getDepartments();
        res.render('departments', {arr: departments})
    }
    catch(err) {
        res.render('departments', {message: err})
    }
})
app.get('/employee/:id', (req, res) => {
    dataService.getEmployeeByNum(req.params.id)
    .then(async data => {
        const departments = await dataService.getDepartments();
        res.render('employee', {
            employee: {
                data,
                departments
            }
        })   
    }) 
    .catch(err => {
        res.render('employee', {message: "no results"})
    })
})
app.post("/employee/update", (req, res) => {
    dataService.updateEmployee(req.body).then(() => res.redirect("/employees"))
});
app.get('/employees/add', (req, res) => res.render('addEmployee'))
app.post('/employees/add', (req, res) => {
    dataService.addEmployee(req.body).then(() => res.redirect('/employees'));
})
app.get('/about', (req, res) => res.render('about'))
app.get('/departments', (req, res) => {
    dataService.getDepartments()
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