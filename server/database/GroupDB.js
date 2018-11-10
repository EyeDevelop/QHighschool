class GroupDB {
	constructor(mainDb) {
		this.mainDb = mainDb;
	}

	async query(sqlString, value) {
		return this.mainDb.connection.query(sqlString, value);
	}

	async getGroups() {
		return this.query(
			"SELECT  " +
			"    course_group.*, " +
			"    course.name AS courseName, " +
			"    course.description AS courseDescription, " +
			"    course.foreknowledge AS foreknowledge, " +
			"    course.studyTime AS studyTime, " +
			"    school_subject.id AS subjectId, " +
			"    school_subject.name AS subjectName, " +
			"    school_subject.description AS subjectDescription, " +
			"    (SELECT  " +
			"            userId " +
			"        FROM " +
			"            participant " +
			"        WHERE " +
			"            groupId = course_group.id " +
			"                AND participant.participating_role = 'teacher' " +
			"        LIMIT 1) AS teacherId, " +
			"    (SELECT  " +
			"            displayName " +
			"        FROM " +
			"            user_data " +
			"        WHERE " +
			"            id = teacherId) AS teacherName " +
			"FROM " +
			"    course_group " +
			"        INNER JOIN " +
			"    course ON course.id = course_group.courseId " +
			"        INNER JOIN " +
			"    school_subject ON school_subject.id = course.subjectId " +
			"ORDER BY course_group.period "
		);
	}

	async setGroup(data) {
		const q1 = "UPDATE course_group SET courseId=?,`day`=?,period=?,schoolYear=?,enrollableFor=? WHERE id=?";
		return this.query(q1,[data.courseId,data.day,data.period,data.schoolYear,data.enrollableFor,data.groupId]);
	}

	async getGroup(groupId) {
		if (groupId >= 0) {
			return this.query(
				"			SELECT  " +
				"			course_group.*, " +
				"			course.name AS courseName, " +
				"			course.description AS courseDescription, " +
				"			course.foreknowledge AS foreknowledge, " +
				"			course.studyTime AS studyTime, " +
				"			school_subject.id AS subjectId, " +
				"			school_subject.name AS subjectName, " +
				"			school_subject.description AS subjectDescription, " +
				"			(SELECT  " +
				"							userId " +
				"					FROM " +
				"							participant " +
				"					WHERE " +
				"							groupId = course_group.id " +
				"									AND participant.participating_role = 'teacher' " +
				"					LIMIT 1) AS teacherId, " +
				"			(SELECT  " +
				"							displayName " +
				"					FROM " +
				"							user_data " +
				"					WHERE " +
				"							id = teacherId) AS teacherName " +
				"	FROM " +
				"			course_group " +
				"					INNER JOIN " +
				"			course ON course.id = course_group.courseId " +
				"					INNER JOIN " +
				"			school_subject ON school_subject.id = course.subjectId " +
				" WHERE course_group.id = ? ",
				[groupId]).then(groups => {
					if (groups.length === 1) {
						return groups[0];
					}
					throw new Error("groupId is invalid");
				});
		} else {
			throw new Error("groupId must be a number");
		}
	}

	async getEnrollments(groupId) {
		if (groupId >= 0) {
			return this.query(
				"SELECT user_data.* FROM enrollment " +
				"INNER JOIN user_data ON user_data.id = enrollment.studentId WHERE enrollment.groupId = ?; "
				, [groupId]).then(enrollments => {
					return enrollments;
				});
		} else {
			throw new Error("groupId must be a number");
		}
	}


	async getParticipants(groupId) {
		if (groupId >= 0) {
			return this.query(
				"SELECT user_data.id,role,school,firstName,lastName,displayName,year,profile FROM participant " +
				"INNER JOIN user_data ON user_data.id = participant.userId WHERE participant.groupId = ?; "
				, [groupId]).then(participants => {
					return participants;
				});
		} else {
			throw new Error("groupId must be a number");
		}
	}

	async getLessons(groupId) {
		if (groupId >= 0) {
			return this.query(
				"SELECT lesson.* FROM lesson WHERE lesson.groupId = ? ",
				[groupId]).then(lessons => {
					return lessons;
				});
		} else {
			throw new Error("groupId must be a number");
		}
	}

	async setLessons(lessons) {
		const q1 = "UPDATE lesson SET kind = ?, activities = ?, `subject` = ?, presence = ? WHERE id = ?";
		return Promise.all(lessons.map((lesson) => {
			return this.query(q1, [lesson.kind, lesson.activities, lesson.subject, lesson.presence, lesson.id]);
		}));
	}

	async getPresence(groupId) {
		const q1 = "SELECT * FROM presence WHERE lessonId IN (SELECT id FROM lesson WHERE lesson.groupId = ?)";
		console.log(groupId);
		return this.query(q1, [groupId]);
	}

	async setPresence(presence) {
		const q1 = "UPDATE presence SET status = ? WHERE id = ?";
		return this.query(q1, [presence.status, presence.id]);
	}

	async getEvaluations(groupId) {
		const q1 = "SELECT * FROM evaluation WHERE evaluation.courseId = (SELECT course_group.courseId FROM course_group WHERE course_group.id = ?)";
		if (groupId >= 0) {
			return this.query(q1, [groupId]).then(evaluations => {
				return evaluations;
			});
		} else {
			throw new Error("groupId must be a number");
		}
	}

	async addGroup(data) {
		const q1 = "INSERT INTO course_group (courseId,`day`,teacherId,period,schoolYear) VALUES (?,?,?,?,?);";
		return this.query(q1, [data.courseId, data.day, data.teacherId, data.period, data.schoolYear])
			.then((rows) => this.mainDb.function.addLessons(rows.insertId, data.period, data.day));
	}

}

module.exports = GroupDB;
