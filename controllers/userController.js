import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import nodemailer from 'nodemailer';
dotenv.config()

export const createUser=async(req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email})
        if(user != null){
              res.json({message:"already exists"})
              return
        }
        const saltRounds=10
        const passwordHash = bcrypt.hashSync(req.body.password,saltRounds)
        

        const newUser = new User({
            email:req.body.email,
            firstName:req.body.firstName,
            lastName:req.body.lastName,
            password:passwordHash
        })
     await newUser.save()
        res.json({message:"user created successfully"})
    }catch(err){
        res.json({message:err.message})
        
    }
}
 
export async function loginUser(req,res){
    try{
        const email=req.body.email
        const password = req.body.password
        if(email==null || password==null){
            res.status(400).json({message:"Email and password are required"})
            return
        }
       const user = await User.findOne({email:email})
       if(user==null){
        res.status(404).jason({message:"user not found"})
        return
       }
       
       const isPasswordVaild=bcrypt.compareSync(password,user.password)
       if(isPasswordVaild){
        const token = jwt.sign(
            {
                email:user.email,
                firstName:user.firstName,
                lastName:user.lastName,
                isAdmin:user.isAdmin,
                isBlocked:user.isBlocked,
                isEmailVerified:user.isEmailVerified,
                image:user.image
            },
          process.env.JWT_SECRET_KEY
        )
         res.json({message:"Login successfully",token:token,role : user.isAdmin?"Admin":"User"})
       }else{
        res.status(401).json({message:"Invalid password"})
       }

    }catch(err){
        res,json({message:err.message})
    }
}


export async function getUser(req, res) {
    // 1. සර්ගේ ස්ක්‍රීන් එකේ විදිහටම req.user එක null ද කියා බැලීම
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const email = req.user.email;

        // 2. Database එකෙන් user ව සොයා ගැනීම
        const user = await User.findOne({ email: email });

        // 3. User කෙනෙක් නැත්නම් (සර් ලියපු විදිහටම 404 Error එක)
        if (user == null) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // 4. User ව block කරලා නම් (සර් ලියපු විදිහටම 403 Error එක)
        if (user.isBlocked) {
            res.status(403).json({ message: "User is blocked" });
            return;
        }

        // 5. සර් වීඩියෝ එකේ ලියපු ආකෘතියටම (Explicit Mapping) Schema එකේ තියෙන හැම විස්තරයක්ම යැවීම
        res.json({
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            //password: user.password, 
            isAdmin: user.isAdmin,
            isBlocked: user.isBlocked,
            isEmailVerified: user.isEmailVerified,
            image: user.image
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


// 🔄 💻 යූසර් ප්‍රොෆයිල් එක සුපර්බේස් ලින්ක් එකත් එක්ක අප්ඩේට් කරන ෆන්ක්ෂන් එක
export async function updateUserProfile(req, res) {
    if (req.user == null) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }

    try {
        const currentEmail = req.user.email;
        const user = await User.findOne({ email: currentEmail });

        if (user == null) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        if (user.isBlocked) {
            res.status(403).json({ message: "User is blocked" });
            return;
        }

        // 1. සාමාන්‍ය විස්තර සහ Frontend එකෙන් එවපු Supabase Image Link එක අප්ඩේට් කිරීම
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.image = req.body.image || user.image; 

        // 2. Email එක වෙනස් කරනවා නම්, වෙන කෙනෙක් පාවිච්චි කරනවද කියා බැලීම
        if (req.body.email && req.body.email !== user.email) {
            const emailExists = await User.findOne({ email: req.body.email });
            if (emailExists) {
                res.status(400).json({ message: "Email already in use" });
                return;
            }
            user.email = req.body.email;
        }

        // 3. 🔒 පාස්වර්ඩ් එකක් එවලා තිබුණොත් විතරක් Bcrypt වලින් Hash කරලා සේව් කිරීම
        if (req.body.password && req.body.password.trim() !== "") {
            const saltRounds = 10;
            user.password = bcrypt.hashSync(req.body.password, saltRounds);
        }

        // ඩේටาබේස් එකේ සේව් කිරීම
        const updatedUser = await user.save();

        // 4. අලුත් විස්තර සහිතව අලුත් JWT Token එකක් සෑදීම
        const newToken = jwt.sign(
            {
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                isAdmin: updatedUser.isAdmin,
                isBlocked: updatedUser.isBlocked,
                isEmailVerified: updatedUser.isEmailVerified,
                image: updatedUser.image
            },
            process.env.JWT_SECRET_KEY
        );

        res.json({
            message: "Profile updated successfully",
            token: newToken,
            role: updatedUser.isAdmin ? "Admin" : "User"
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}








export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user.id; 

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New passwords do not match." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect current password." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password successfully updated!" });
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export async function googleLogin(req, res) {
    try {
        const accessToken = req.body.accessToken;

        if (!accessToken) {
            return res.status(400).json({ message: "Access token is required" });
        }

        // Google එකෙන් user info ගන්නවා
        const googleResponse = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        if (!googleResponse.ok) {
            return res.status(401).json({ message: "Invalid Google access token" });
        }

        const googleUser = await googleResponse.json();
        console.log("Google User Info:", googleUser);

        // Database එකේ user ඉන්නවද බලනවා
        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            // නැත්නම් අලුතින් හදනවා (password නෑ Google user ලාට)
            user = new User({
                email: googleUser.email,
                firstName: googleUser.given_name || "Google",
                lastName: googleUser.family_name || "User",
                password: "GOOGLE_AUTH_" + Math.random().toString(36),
                image: googleUser.picture || "",
                isEmailVerified: true
            });
            await user.save();
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: "User is blocked" });
        }

        // JWT Token හදනවා
        const token = jwt.sign(
            {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isAdmin: user.isAdmin,
                isBlocked: user.isBlocked,
                isEmailVerified: user.isEmailVerified,
                image: user.image
            },
            process.env.JWT_SECRET_KEY
        );

        res.json({
            message: "Google login successful",
            token: token,
            role: user.isAdmin ? "Admin" : "User"
        });

    } catch (err) {
        console.error("Google Login Error:", err);
        res.status(500).json({ message: err.message });
    }
}




// 1. මුරපදය යළි සැකසීමට ඉල්ලීම - පැරණි OTP ඉවත් කර අලුත් OTP එකක් පමණක් යැවීම
export async function requestPasswordReset(req, res) {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ 
                message: "User with this email does not exist." 
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({ 
                message: "This account has been blocked by the administrator." 
            });
        }

        // අහඹු ඉලක්කම් 6ක OTP කේතයක් උත්පාදනය කිරීම
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otpCode, salt);

        // 👉 මෙහිදී පැරණි resetOtp සහ resetOtpExpire fields සම්පූර්ණයෙන්ම අලුත් OTP එක මඟින් Overwrite වේ. 
        // ඒ අනුව ඩේටාබේස් එකේ ගබඩා වන්නේ එකම එක (අලුත්ම) OTP අංකයක් පමණි.
        user.resetOtp = hashedOtp;
        user.resetOtpExpire = Date.now() + 10 * 60 * 1000; 
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "your-email@gmail.com", 
                pass: "your-app-password"       
            }
        });

        const mailOptions = {
            from: "your-email@gmail.com",
            to: user.email,
            subject: "Password Reset OTP Code",
            text: `Your OTP code for password reset is: ${otpCode}. It will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: "OTP sent to your email successfully." 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// 2. OTP අංකය පරික්ෂා කර, නව මුරපදය යාවත්කාලීන කිරීම සහ භාවිත කළ OTP ඉවත් කිරීම
export async function resetPassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // ඩේටාබේස් එකේ OTP එකක් ඇත්තටම සේව් වෙලා තියෙනවද බැලීම
        if (!user.resetOtp || !user.resetOtpExpire) {
            return res.status(400).json({ message: "No active OTP request found for this user." });
        }

        const isOtpValid = await bcrypt.compare(otp, user.resetOtp);

        if (!isOtpValid || user.resetOtpExpire < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP code." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // 👉 මුරපදය සාර්ථකව වෙනස් කළ පසු, අදාළ OTP දත්ත සහ කාල සීමාව ඩේටාබේස් එකෙන් සම්පූර්ණයෙන්ම මකා දැමීම (Delete / Clear)
        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.resetOtpExpire = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully. OTP has been cleared." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}






// 1. සියලුම යූසර්ලාගේ දත්ත ලබා ගැනීම (මුරපදය හැර)
export async function getAllUsers(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        const users = await User.find().select('-password');
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// 2. යූසර්ගේ භූමිකාව (Role) වෙනස් කිරීම - (User හෝ Admin)
export async function updateUserRole(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        const { userId } = req.params;
        const { role } = req.body;
        const isAdmin = role === "Admin";

        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            { isAdmin }, 
            { new: true }
        ).select('-password');

        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// 3. යූසර්ව Block හෝ Unblock කිරීම
export async function toggleBlockStatus(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        const { userId } = req.params;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ message: "User not found" });

        user.isBlocked = !user.isBlocked; 
        await user.save();

        res.status(200).json({ 
            message: `User successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`, 
            isBlocked: user.isBlocked 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// 4. යූසර්ව ඩේටාබේස් එකෙන් සම්පූර්ණයෙන්ම ඉවත් කිරීම (Delete/Remove)
export async function deleteUser(req, res) {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        const { userId } = req.params;
        
        const deletedUser = await User.findByIdAndDelete(userId);
        
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ message: "User successfully deleted from the database." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}