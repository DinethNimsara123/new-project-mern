import Student from "../models/student.js"

   export function getAllStudents (req,res){
        Student.find().then(
            (students)=>{
                res.json(students)
            }
        )
    }


   export function creatStudent (req,res){
        if(req.user==null){
            res.status(401).json({message:'unautherized'})
            return
        }
        if(req.user.isAdmin==false){
            res.status(403).json({message:"only admin can creat student"})
            return
        }
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
