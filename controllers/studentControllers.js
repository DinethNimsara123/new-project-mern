import Student from "../models/student.js"

   export function getAllStudents (req,res){
        Student.find().then(
            (students)=>{
                res.json(students)
            }
        )
    }


   export function creatStudent (req,res){
         const newStudent= new Student(req.body)
         newStudent.save().then(
            ()=>{
                res.json(
                    {
                        message:"Student added succcessfully"
                    }
                )
            }
         )
    }
