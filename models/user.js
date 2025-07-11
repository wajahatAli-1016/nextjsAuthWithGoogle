import {Schema,model,models} from "mongoose";

const UserSchema = new Schema ({
    firstName:{
        type:String,
        required:true
    },
    lastName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});
export default models.User || model('User', UserSchema);