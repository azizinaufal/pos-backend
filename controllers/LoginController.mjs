import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const login = async (req, res) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                email: req.body.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Pengguna tidak terdaftar",
            });
        }

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Password tidak valid",
            });
        }

        const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
            expiresIn: "1h",
        });

        const { password, ...userWithoutPassword } = user;

        res.status(200).json({
            meta: {
                success: true,
                message: "Login Berhasil",
            },
            data: {
                user: userWithoutPassword,
                token: token,
            },
        });

    } catch (err) {
        res.status(500).json({
            meta: {
                success: false,
                message: "Terjadi kesalahan di server",
            },
            errors: err.message,
        });
    }
};

const LoginController =  {login};
export {LoginController};
