const express = require("express");
const { parse } = require("path");
const router = express.Router();
const redis = require('../modules/redis')

router.get("/get", async (req, res) => {

  const data = JSON.parse(await redis.get("palador"))

  res.status(200).json(data)

});

router.get("/get/:id", async (req, res) => {
  const employeeId = req.params.id
  const irt = req.query.includeReportingTree || false

  const data = JSON.parse(await redis.get("palador"))
  const sEmployee = await data.filter(a => a.employeeId == employeeId)[0]
  if (sEmployee === undefined) {
    res.status(404).json({
      description: "Employee not found"
    })
    return
  }

  if (irt === 'true') {
    const orgTree = [];
    orgTree.push(sEmployee)
    var subordinate = sEmployee;
    for (var i = 0; i != 1;) {
      var sSubordinate = await data.filter(a => a.managerId == subordinate.employeeId)[0]
      if (sSubordinate === undefined) {
        i++
        continue
      }
      orgTree.push(sSubordinate)
      subordinate = sSubordinate;
    }

    var reportTree = {};
    if (orgTree.length > 1) {

      for (var i = orgTree.length - 1; i > 0; i--) {
        reportTree = orgTree[i - 1]
        reportTree.directReport = orgTree[i]
      }
    } else {
      reportTree = orgTree[0]
    }
    var sManager = await data.filter(a => a.employeeId == reportTree.managerId)[0]
    console.log(sManager)
    reportTree.manager = sManager
    res.json(reportTree)

  } else {
    res.json(sEmployee)
  }

});

router.post("/addEmployee", async (req, res) => {

  var employeeId = req.body.employeeId || null;
  var name = req.body.name || null;
  var managerId = req.body.managerId || null;

  if (employeeId == null || name == null || managerId == null) {
    res.status(400).json({
      description: "Invalid employee object."
    })
    return
  }

  const data = JSON.parse(await redis.get("palador"))
  const sEmployee = await data.filter(a => a.employeeId == employeeId)[0]
  if (sEmployee === undefined) {
    const newEmployee = {
      employeeId: employeeId,
      name: name,
      managerId: managerId
    }
    data.push(newEmployee)
    const reply = await redis.set("palador", JSON.stringify(data))
    console.log(reply)
    res.status(200).json({
      description: "successful operation",
      data: data
    })
    return
  } else {
    res.status(400).json({
      description: "Duplicate on ID"
    })
    return
  }

})

router.delete("/deleteEmployee/:employeeId", async (req, res) => {
  var employeeId = req.params.employeeId || null;
  if (employeeId == null) {
    res.status(400).json({
      description: "Invalid employee Id supplied"
    })
    return
  }

  const data = JSON.parse(await redis.get("palador"))
  const sEmployee = await data.filter(a => a.employeeId == employeeId)[0]
  if (sEmployee === undefined) {
    res.status(404).json({
      description: "employee not found"
    })
    return
  } else {
    const newData = await data.filter(a => a.employeeId != sEmployee.employeeId)
    const reply = await redis.set("palador", JSON.stringify(newData))
    console.log(reply)
    res.status(200).json({
      description: "successful operation"
    })
    return
  }
})

router.put("/updateEmployee/:employeeId", async (req, res) => {
  var employeeId = req.params.employeeId || null;
  var newName = req.body.newName || null;

  if (employeeId == null || newName == null) {
    res.status(400).json({
      description: "Invalid Employee supplied"
    })
    return
  }

  const data = JSON.parse(await redis.get("palador"))
  const sEmployee = await data.filter(a => a.employeeId == employeeId)[0]
  if (sEmployee === undefined) {
    res.status(404).json({
      description: "employee not found"
    })
    return
  } else {
    for (var i = 0; i < data.length; i++) {
      if (data[i].employeeId === sEmployee.employeeId) {
        data[i].name = newName;
        break
      }
    }
    const reply = await redis.set("palador", JSON.stringify(data))
    console.log(reply)
    res.status(200).json({
      description: "successful operation",
      data : data
    })
    return
  }
})


module.exports = router;
