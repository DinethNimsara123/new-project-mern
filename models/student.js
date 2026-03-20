import mongoose from"mongoose";
const Studentschema=new mongoose.Schema(
    {
        name:String,
        age:Number,
        city:String
    }
)
const Student = mongoose.model("Student",Studentschema)
export default Student