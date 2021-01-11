const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Project = require('../models/Projects');
const User = require('../models/User');
const Worker = require('../models/workers');
const Tasks = require('../models/tasks');

router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

router.get('/dashboard', ensureAuthenticated, async function (req, res) {
  var usersDetails;
  var tasksDetails;
  Tasks.find({}, function (err, TasksDetails) {
    tasksDetails = TasksDetails;
});
await Worker.find({}, function (err, UsersDetails) {
  usersDetails = UsersDetails;
});
Project.find({}, function (err, projectsDetails) {
  if (err) {
    console.log(err);
  } else {
    res.render("dashboard", { user: req.user, projects: projectsDetails, users: usersDetails, tasks: tasksDetails })
  }
})
});

router.get('/add_project',ensureAuthenticated, (req,res) =>
res.render('add_project', { user: req.user}))

router.get('/loginUser', (req,res) =>
res.render('loginUser', { user: req.user}))

router.get('/add_user',ensureAuthenticated, (req,res) =>
res.render('add_user', { user: req.user}))

router.post('/send', async function (req, res){
  
    var project = new Project({ name: req.body.name, startDate: req.body.startDate, endDate: req.body.endDate, coordinator: req.user.name });
    var savedMessage = await project.save();
    var usersDetails;
    var tasksDetails;
    Tasks.find({}, function (err, TasksDetails) {
      tasksDetails = TasksDetails;
  });
  await Worker.find({}, function (err, UsersDetails) {
    usersDetails = UsersDetails;
  });
  Project.find({}, function (err, projectsDetails) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/dashboard');
    }
  })
 
});

router.post('/add_user', ensureAuthenticated, async (req, res) => {
  try {
    var user = new Worker({ name: req.body.name, email: req.body.email, password: req.body.password});
    var savedMessage = await user.save();
    var usersDetails;
    var tasksDetails; 
    var projectsDetails;
    var findtask = await Tasks.find({}, function (err, TasksDetails) {
      tasksDetails = TasksDetails;
    });
    var findworker = await Worker.find( {}, function (err, UsersDetails) {
      usersDetails = UsersDetails;
    });
    var findprojects =  await Project.find({}, function (err, allDetails) {
      if (err) {
        console.log(err);
      } else {
        projectsDetails = allDetails;
      }
    });
    res.render("dashboard", { user: req.user, projects: projectsDetails, users: usersDetails, tasks: tasksDetails });
  }
  catch (error) {
    res.sendStatus(500);
    return console.log('error', error);
  };
});

router.post('/add_task/:id', ensureAuthenticated, async function (req, res){
 
    var task = new Tasks({ name: req.body.name, project: req.params.id, worker: req.body.worker, coordinator: req.user.name, comment: req.body.comment, status: "Nierozpoczęte", startDate: req.body.startdate, endDate: req.body.enddate, priority: req.body.priority });
    var savedMessage = await task.save();
    var usersDetails;
    var tasksDetails;
    Tasks.find({}, function (err, TasksDetails) {
      tasksDetails = TasksDetails;
  });
  await Worker.find({}, function (err, UsersDetails) {
    usersDetails = UsersDetails;
  });
  Project.find({}, function (err, projectsDetails) {
    if (err) {
      console.log(err);
    } else {
      res.render("dashboard", { user: req.user, projects: projectsDetails, users: usersDetails, tasks: tasksDetails })
    }
  })
});


router.get('/projects/:id', ensureAuthenticated, async function (req, res) {
  var project = req.params.id;
  var tasksDetails;
  await Tasks.find({project: project}, function (err, TasksDetails) {
      tasksDetails = TasksDetails;
      res.render('projects', { user: req.user, project: project, tasks: tasksDetails });
  });
});

router.get('/add_task/:id', async function (req, res) {
  var project = req.params.id;
  var usersDetails;
  var findworksers = await Worker.find({}, function (err, UsersDetails) {
    usersDetails = UsersDetails;
  });
  await Project.find({ name: project }, function(err, data){
  res.render('add_task', { user: req.user, project: project, users: usersDetails });
  });
});

router.post('/loginUser',  async function(req, res) {
  try {
    var usersDetails;
    var tasksDetails;
    var decide = 0;
    
    await Worker.find( {email: req.body.email, password: req.body.password}, function (err, UsersDetails) {
      usersDetails = UsersDetails;
      if(UsersDetails == ""){
        decide = 0
      }else{
        decide = 1;
      }
      console.log(decide);
    if(decide == 1){
       Tasks.find({}, function (err, TasksDetails) {
        tasksDetails = TasksDetails;
        res.render('dashboardUser',{worker: usersDetails[0].name, tasks: tasksDetails })
    });
    
    }else{
      res.render('loginUser');
    }
    });
    
    
    ;}
  catch (error) {
    res.sendStatus(500);
    return console.log('error', error);
  };
});

router.get('/task/:id', async function (req, res) {
  var taskID = req.params.id;
  var tasksDetails;
   var czekaj = await Tasks.find({_id: taskID}, function (err, TasksDetails) {
      tasksDetails = TasksDetails;
      res.render('task', {tasks: tasksDetails });
  });
  
});

router.get('/dashboardUser/:id', async function (req, res) {
  var name = req.params.id;
  var tasksDetails;
   var waitforTask = await Tasks.find({worker: name}, function (err, TasksDetails) {
      tasksDetails = TasksDetails;
      res.render('dashboardUser',{worker: name, tasks: tasksDetails })
  });
});


router.get('/edit_task/:id', async function (req, res) {
  var taskID = req.params.id;
  var usersDetails;
  var tasksDetails;
  var findworksers = await Worker.find({}, function (err, UsersDetails) {
    usersDetails = UsersDetails;
  });
  var findtask = await Tasks.findOne({ _id: taskID }, function(err, data){
    tasksDetails = data;
    res.render('edit_task', { user: req.user, task: tasksDetails, users: usersDetails });
  });
});


router.post('/edit_task/:id', ensureAuthenticated, async function(req, res) {
  console.log(req.body.status);
  var name;
  var waitforit = await Tasks.updateOne({_id: req.params.id}, {$set: {name: req.body.name, comment: req.body.comment, worker: req.body.worker, startDate: req.body.startdate, endDate: req.body.enddate, priority: req.body.priority}});
  var usersDetails;
  var tasksDetails;
  Tasks.find({}, function (err, TasksDetails) {
    tasksDetails = TasksDetails;
});
await Worker.find({}, function (err, UsersDetails) {
  usersDetails = UsersDetails;
});
Project.find({}, function (err, projectsDetails) {
  if (err) {
    console.log(err);
  } else {
    res.render("dashboard", { user: req.user, projects: projectsDetails, users: usersDetails, tasks: tasksDetails })
  }
})
});


router.post('/edit_status/:id', async function(req, res) {
  console.log(req.body.status);
  var name;
  var waitforit = await Tasks.updateOne({_id: req.params.id}, {$set: {status: req.body.status}});
  var waitforTask = await Tasks.findOne({_id: req.params.id}, function (err, TasksDetails) {
     name = TasksDetails.worker; 
});
  var tasksDetails;
   var waitforTask = await Tasks.find({worker: name}, function (err, TasksDetails) {
      tasksDetails = TasksDetails;
      res.render('dashboardUser',{worker: name, tasks: tasksDetails })
  });
});

module.exports = router;
