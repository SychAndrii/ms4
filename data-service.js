const fs = require('fs')
let employees = []
let departments = []
let managers = []

function Initialize() {
    return new Promise(function(resolve, reject) {
        fs.readFile('./data/employees.json',(err,data)=>{
            if (err) reject("Failure to read file employees.json!");
            employees = JSON.parse(data);

            fs.readFile('./data/departments.json',(err,data)=>{
                if (err) reject("Failure to read file departments.json!");
                departments = JSON.parse(data);   
                resolve()
            })
        })
    })
}

function getAllEmployees() {
    if(employees.length != 0)
        return Promise.resolve(employees)
    else 
        return new Promise(function(resolve, reject) {
            Initialize()
            .then(() => resolve(employees))
            .catch((err) => reject(err))
    })
}

function getDepartments() {
    if(departments.length != 0)
        return Promise.resolve(departments)
    else 
        return new Promise(function(resolve, reject) {
            Initialize()
            .then(() => resolve(departments))
            .catch((err) => reject(err))
    })
}

function getManagers() {
    if(managers.length != 0)
        return Promise.resolve(managers)
    else 
        return new Promise(function(resolve, reject) {
            Initialize()
            .then(() =>  {
                managers = employees.filter(e => e.isManager == true)
                resolve(managers)
            })
            .catch((err) => reject(err))
    })
}

module.exports = {
    Initialize,
    getAllEmployees,
    getDepartments,
    getManagers
}