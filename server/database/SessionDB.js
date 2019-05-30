const User = require("../dec/UserDec");
const LoggedIn = require("../dec/LoggedInDec");
const Participant = require("../dec/ParticipantDec");

class SerialisedUser {

	constructor(id, email, role, displayName, groupIds, school, token) {
		this.id = id;
		this.email = email;
		this.role = role;
		this.displayName = displayName;
		this.groupIds = groupIds;
		if (this.role === "grade_admin") {
			this.school = school;
		}
		this.token = token;
	}

	inGroup(groupId) {
		if (this.isAdmin()) {
			return true;
		}
		return this.groupIds.indexOf(groupId + "") !== -1;
	}

	isAdmin() {
		return this.role === "admin";
	}

	isTeacher() {
		if (this.isAdmin()) {
			return true;
		}
		return this.role === "teacher";
	}

	isGradeAdmin() {
		if (this.isAdmin()) {
			return true;
		}
		return this.role === "grade_admin";
	}

	isStudent() {
		return this.role === "student";
	}

}

class SessionDB {

	async getUserByEmail(email) {
		return User.findOne({
			attributes: ["id", "role", "graphId"],
			where: {
				email
			}
		});
	}

	async getParticipatingGroupsIds(userId) {
		return Participant.findAll({ where: { userId }, attributes: ["courseGroupId"] })
			.map(u => u.courseGroupId + "");
	}

	async getUserByToken(token) {
		return LoggedIn.findAll({
			where: {
				token,
				active: true,
			},
			include: {
				model: User,
				attributes: ["id", "email", "role", "displayName", "school"],
			}
		}).then(async (loginData) => {
			if (loginData.length === 1) {
				const user = loginData[0].user;
				const groupIds = await this.getParticipatingGroupsIds(user.id);
				return new SerialisedUser(user.id, user.email, user.role, user.displayName, groupIds, user.school, token);
			} else {
				return null;
			}
		});
	}

	async createTokenForUser({ email }) {
		const userId = (await User.findOne({ where: { email: email }, attributes: ["id"] })).id;
		const token = require('uuid/v4')()
		await this.destroySession(email);
		await LoggedIn.create({
			userId,
			token,
			ip: "_v2.0 unknown_",
			active: true,
		});
		return token;
	}

	async destroySession(email) {
		const userId = (await User.findOne({ where: { email }, attributes: ["id"] })).id;
		return LoggedIn.update({
			active: false,
		}, { where: { userId } });
	}

}

module.exports = new SessionDB();
