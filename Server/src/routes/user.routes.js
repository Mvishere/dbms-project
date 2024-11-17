import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, studentDoubts, postStudentDoubts, mentorDoubts, respondDoubt, deleteDoubt, deleteResponse, mentorSchedule, getSchedule, getScheduleStudent, bookSchedule } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/student").post(verifyJWT, studentDoubts)
router.route("/student/raisedoubt").post(verifyJWT, postStudentDoubts)
router.route("/mentor").post(verifyJWT, mentorDoubts)
router.route("/mentor/respond").post(verifyJWT, respondDoubt)
router.route("/student/deletedoubt").post(verifyJWT, deleteDoubt)
router.route("/mentor/deleteresponse").post(verifyJWT, deleteResponse)
router.route("/mentor/schedule").post(verifyJWT, mentorSchedule)
router.route("/mentor/getSchedules").post(verifyJWT, getSchedule)
router.route("/student/schedules").post(verifyJWT, getScheduleStudent)
router.route("/student/bookschedule").post(verifyJWT, bookSchedule)

export default router