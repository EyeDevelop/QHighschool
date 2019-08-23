const express = require("express");
const router = express.Router();
const subjectDB = require('../database/SubjectDB');
const { promiseMiddleware, doReturn } = require('./handlers');
const { ensureOffice, ensureSecure, ensureAdmin, } = require('./permissions');

router.get("/list", promiseMiddleware(() => {
	return subjectDB.getSubjects();
}), doReturn);

router.put("/", ensureOffice, ensureSecure, ensureAdmin, promiseMiddleware(({ body: { name, description } }) => {
	return subjectDB.addSubject(name, description);
}), doReturn);

module.exports = router;