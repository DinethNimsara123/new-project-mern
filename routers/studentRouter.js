import express from 'express'
import Student from '../models/student.js'
import { creatStudent, getAllStudents } from '../controllers/studentControllers.js'

const studentRouter=express.Router()

  studentRouter.get("/",getAllStudents)

  studentRouter.post("/",creatStudent)

export default studentRouter