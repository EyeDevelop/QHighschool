const nodemailer = require("nodemailer");
const mailConfig = require("../private/keys").mailConfig
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const userDb = require("../database/UserDB");
const groupDb = require("../database/GroupDB");

const enrollmentTemplate = fs.readFileSync(path.resolve(__dirname, "./templates/enrollment.ejs"), "utf8");
const derollmentTemplate = fs.readFileSync(path.resolve(__dirname, "./templates/derollment.ejs"), "utf8");

let transporter = nodemailer.createTransport(mailConfig);

this.sendEnrollmentMail = async (userId, groupId) => {
	const user = await userDb.getUser(userId);
	const group = await groupDb.getGroup(groupId);
	const mail = ejs.render(enrollmentTemplate, { group, user, }, {});
	transporter.sendMail({
		from: mailConfig.auth.user,
		to: user.preferedEmail,
		subject: `Bevestiging inschrijving ${group.courseName}`,
		html: mail,
	});
}
this.sendDerollmentMail = async (userId, groupId) => {
	const user = await userDb.getUser(userId);
	const group = await groupDb.getGroup(groupId);
	const mail = ejs.render(derollmentTemplate, { group, user, }, {});
	transporter.sendMail({
		from: mailConfig.auth.user,
		to: user.preferedEmail,
		subject: `Bevestiging uitschrijving ${group.courseName}`,
		html: mail,
	});
}
this.sendEvaluationChangedMail = async (evaluation) => {
	const mail = ejs.render(derollmentTemplate, { evaluation, }, {});
	transporter.sendMail({
		from: mailConfig.auth.user,
		to: user.preferedEmail,
		subject: `Beoordeling gewijzigd ${evaluation.courseName}`,
		html: mail,
	});
}