import jwt from "jsonwebtoken";

export default function authenticate(req, res, next) {

    const header = req.header("Authorization");

    if (!header) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = header.replace("Bearer ", "");

    jwt.verify(token, "secretkey3366", (err, decoded) => {

        if (err) {
            return res.status(401).json({ message: "Invalid token, please login again" });
        }

        req.user = decoded;
        next();
    });
}
