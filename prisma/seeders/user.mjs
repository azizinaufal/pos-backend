import PrismaClient from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from "../client/index.mjs";

async function main() {
    const password = await bcrypt.hash('password', 10);
    await prisma.user.create({
        data:{
            name:'admin',
            email:'admin@gmail.com',
            password
        },
    });
}

main()
    .catch((err) => {console.log(err)})
    .finally(async () => {
    await prisma.$disconnect();
})