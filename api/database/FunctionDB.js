const Enrollment = require("../dec/EnrollmentDec");
const Lesson = require("../dec/LessonDec");
const Evaluation = require("../dec/EvaluationDec");
const Group = require("../dec/CourseGroupDec");
const Subject = require("../dec/SubjectDec");
const LoggedIn = require("../dec/LoggedInDec");
const Course = require("../dec/CourseDec");
const Participant = require("../dec/ParticipantDec");
const User = require("../dec/UserDec");
const Op = require("sequelize").Op;

const graphConnection = require("../office/graphConnection");
const officeEndpoints = require("../office/officeEndpoints");
const schedule = require("../lib/schedule");
const translation = require("../lib/translation");

const moment = require("moment");
moment.locale("nl");

function formatId(idName, courseId = "") {
  return "#" + idName + (courseId + "").padStart(4, "0");
}

exports.createUser = async accessToken => {
  const user = await graphConnection.getOwnDetails(accessToken);

  if (/beekdallyceum\.nl$/g.test(user.email)) {
    user.school = "Beekdal Lyceum";
  }
  if (/riversarnhem\.org$/g.test(user.email)) {
    user.school = "Beekdal Lyceum";
  }
  if (/candea\.nl$/g.test(user.email)) {
    user.school = "Candea College";
  }
  if (/quadraam\.nl$/g.test(user.email)) {
    user.school = "Centraal Bureau";
  }
  if (/lyceumelst\.nl$/g.test(user.email)) {
    user.school = "Lyceum Elst";
  }
  if (/liemerscollege\.nl$/g.test(user.email)) {
    user.school = "Liemers College";
  }
  if (/lorentzlyceum\.nl$/g.test(user.email)) {
    user.school = "Lorentz Lyceum";
  }
  if (/maartenvanrossem\.nl$/g.test(user.email)) {
    user.school = "Maarten van Rossem";
  }
  if (/montessoriarnhem\.nl$/g.test(user.email)) {
    user.school = "Montessori College Arnhem";
  }
  if (/olympuscollege\.nl$/g.test(user.email)) {
    user.school = "Olympus College";
  }
  if (/produsarnhem\.nl$/g.test(user.email)) {
    user.school = "Produs Praktijkonderwijs";
  }
  if (/gymnasiumarnhem\.nl$/g.test(user.email)) {
    user.school = "Stedelijk Gymnasium Arnhem";
  }
  if (/symbion-vo\.nl$/g.test(user.email)) {
    user.school = "Symbion";
  }
  if (/vmbo-venster\.nl$/g.test(user.email)) {
    user.school = "Vmbo 't Venster";
  }
  if (/hetwesteraam\.nl$/g.test(user.email)) {
    user.school = "Het Westeraam";
  }

  if (user.school == null) {
    throw new Error("WRONG EMAIL " + user.email);
  }

  if (
    !/ll\.beekdallyceum\.nl$/g.test(user.email) &&
    !/ll\.candea\.nl$/g.test(user.email) &&
    !/ll\.quadraam\.nl$/g.test(user.email) &&
    !/ll\.lyceumelst\.nl$/g.test(user.email) &&
    !/ll\.liemerscollege\.nl$/g.test(user.email) &&
    !/ll\.lorentzlyceum\.nl$/g.test(user.email) &&
    !/ll\.maartenvanrossem\.nl$/g.test(user.email) &&
    !/ll\.montessoriarnhem\.nl$/g.test(user.email) &&
    !/ll\.olympuscollege\.nl$/g.test(user.email) &&
    !/ll\.produsarnhem\.nl$/g.test(user.email) &&
    !/ll\.gymnasiumarnhem\.nl$/g.test(user.email) &&
    !/ll\.symbion-vo\.nl$/g.test(user.email) &&
    !/ll\.vmbo-venster\.nl$/g.test(user.email) &&
    !/ll\.hetwesteraam\.nl$/g.test(user.email) &&
    user.jobTitle !== "Leerling"
  ) {
    user.role = "teacher";
  }

  return User.create(user);
};

exports.updateAllGroups = async () => {
  const groups = await Group.findAll();
  return Promise.all(
    groups.map(async group => {
      if (schedule.shouldBeSynced(group)) {
        await exports.addLessonsIfNecessary(group);
        await exports.updateLessonDates(group);
        await officeEndpoints.updateClass(group.id);
      }
    })
  );
};

exports.updateLessonDates = async group => {
  if (!schedule.shouldBeSynced(group)) return;
  const { id, schoolYear, period, day } = group;
  for (let i = 0; i < 9; i++) {
    const date = schedule.getLessonDate(schoolYear, period, i + 1, day);
    await Lesson.update(
      { date },
      {
        where: {
          courseGroupId: id,
          numberInBlock: i + 1
        }
      }
    );
  }
};

exports.addLessonsIfNecessary = async ({ id, schoolYear, period, day }) => {
  for (let i = 0; i < 9; i++) {
    await Lesson.findOrCreate({
      defaults: {
        courseGroupId: id,
        date: schedule.getLessonDate(schoolYear, period, i + 1, day),
        numberInBlock: i + 1
      },
      where: {
        courseGroupId: id,
        numberInBlock: i + 1,
      }
    });
  }
};

const extractFromObject = (keys, modelName, object) => {
  return keys.reduce((tot, key) => {
    let res = tot;
    const s = key.split(".");
    const normalisedKey = s.slice(s.length - 2).join(".");
    let value = object[key];
    switch (normalisedKey) {
      case "group.id":
        value = formatId("G", value);
        break;
      case "course.id":
        value = formatId("M", value);
        break;
    }
    res[translation.translate(modelName + "." + key)] = value;
    return res;
  }, {})
}

exports.findEvaluation = async (userId, groupId) => {
  const group = await Group.findByPk(groupId, {
    attributes: ["id", "period"],
    raw: true,
    include: {
      model: Course,
      attributes: ["id", "name"],
      include: {
        model: Subject,
        attributes: ["name", "id"]
      }
    }
  });
  let evaluation = await Evaluation.findOne({
    attributes: ["id", "userId", "type", "assesment", "explanation", "updatedByUserId"],
    order: [["id", "DESC"]],
    raw: true,
    where: { userId, courseId: group["course.id"] },
    include: [
      {
        model: User,
        attributes: ["id", "email", "displayName"],
      },
      {
        model: User,
        as: "updatedByUser",
        attributes: ["displayName"],
      }
    ]
  });
  if (evaluation == null) {
    const user = await User.findOne({
      where: { id: userId },
      attributes: ["displayName", "email", "id"],
      raw: true,
    });
    evaluation = {
      assesment: "",
      explanation: "",
      type: "decimal",
    };
    for (key in user) {
      evaluation["user." + key] = user[key];
    }
  }
  return {
    ...extractFromObject([
      "course.name",
      "course.subject.name",
      "course.id",
      "period",
      "id",
    ], "course_group", group),
    ...extractFromObject([
      "assesment",
      "explanation",
      "type",
      "user.displayName",
      "updatedByUser.displayName",
      "user.email",
      "user.id",
    ], "evaluation", evaluation),
  };
};

exports.getEvaluation = async school => {
  const where = school
    ? { school: { [Op.or]: school.split("||") } }
    : undefined;
  const pts = await Participant.findAll({
    attributes: ["userId", "courseGroupId"],
    order: [["courseGroupId", "DESC"]],
    where: { participatingRole: "student" },
    include: [
      {
        model: User,
        attributes: ["school"],
        where: where
      }
    ]
  });
  let evs = await Promise.all(
    pts.map(p => exports.findEvaluation(p.userId, p.courseGroupId))
  );
  return [].concat(evs);
};

exports.getEnrollment = async school => {
  const where = school
    ? { school: { [Op.or]: school.split("||") } }
    : undefined;
  return Enrollment.findAll({
    raw: true,
    include: [
      {
        model: Group,
        attributes: ["id", "period", "createdAt", "schoolYear"],
        include: [
          {
            model: Course,
            attributes: ["name"],
            include: {
              model: Subject,
              attributes: ["id", "name"]
            }
          }
        ]
      },
      {
        model: User,
        attributes: [
          "email",
          "preferedEmail",
          "displayName",
          "school",
          "year",
          "level"
        ],
        where: where
      }
    ]
  }).then(enrl =>
    enrl.map(e => {
      return {
        ...extractFromObject([
          "user.email",
          "course_group.course.name",
          "course_group.course.subject.name",
          "accepted",
          "user.displayName",
          "user.school",
          "user.year",
          "user.level",
          "user.preferedEmail",
          "course_group.period",
          "course_group.course.id",
        ], "enrollment", e),
        "Inschrijfperiode": e["course_group.schoolYear"] + " - " + e["course_group.period"],
        "Ingeschreven op": moment(e["createdAt"]).format("DD-MM-YYYY")
      };
    })
  );
};

exports.getUserData = async school => {
  const attributes = [
    "email",
    "role",
    "school",
    "displayName",
    "year",
    "level",
    "preferedEmail",
    "profile",
    "phoneNumber",
    "id"
  ];
  const where = school
    ? { school: { [Op.or]: school.split("||") } }
    : undefined;
  return User.findAll({
    where,
    attributes,
    raw: true
  }).then(data => {
    return data.map(obj => extractFromObject(attributes, "user", obj));
  })
};

exports.getCourseIdsData = async school => {
  return Course.findAll({
    attributes: ["name", "id"],
    include: {
      model: Subject,
      attributes: ["name"]
    },
    raw: true
  }).then(course =>
    course.map(e => extractFromObject([
      "name",
      "subject.name",
      "id",
    ], "course", e))
  );
};

exports.setAlias = async (token, oldUserId, newUserId) => {
  return LoggedIn.findOne({
    where: {
      token: token,
      active: true,
      userId: oldUserId
    }
  }).then(login => {
    login.update({
      userId: newUserId
    });
  });
};
