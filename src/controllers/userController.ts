import { Request, Response } from "express";
import { UserRepository } from "../repositories/UserRepository";
import { UserDto } from "../dtos/users/userUpdateDto";
import userService from "../services/userService";
import { User } from "../models";
import "../config/dotenv"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

class UserController {
    public async createUser(req: Request, res: Response) {
        try {
            const fields: string[] = ["name", "email", "password"];
            const errors: string[] = [];

            fields.forEach((field) => {
                if (!req.body[field]) {
                    errors.push(`Missing ${field} field`);
                }
            });

            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            const user: User = req.body
            const verifyEmail: User | undefined = await userService.verifyEmail(user)

            if(verifyEmail?.email){
                return res.status(409).json({ error: "Email already exists. Please register with a different email."})
            }
            
            user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(15))
            let createNewUser = await userService.createUser(user);
            return res.status(201).json({ message: "User created successfully", data: createNewUser });
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    public async userLogin(req: Request, res: Response) {
        try {
            const fields: string[] = [ "email", "password"];
            const errors: string[] = [];

            fields.forEach((field) => {
                if (!req.body[field]) {
                    errors.push(`Missing ${field} field`);
                }
            });

            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }

            const user: User = req.body

            const userEmail: User | undefined = await userService.verifyEmail(user)
            if(!userEmail?.email){
                return res.status(401).json({ error: "Please check your credentials and try again" })
            }

            const isPasswordValid = await bcrypt.compare(user.password, userEmail.password)

            if (!isPasswordValid) {
                return res.status(401).json({ error: "Please check your credentials and try again" });
            }

            const token = jwt.sign({
                id: userEmail.id,
                email: userEmail.email 
            }, process.env.APP_SECRET as string, { expiresIn: '1D' });
            const data = { ...userEmail, token };
            return res.json(data);

        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    public async getAllUsers(req: Request, res: Response) {
        try {
            const users = await userService.getAllUser();
            console.log(users);
            if (!users) {
                res.status(404).json({ error: "Users not found" });
            } else {
                res.status(200).json(users);
            }
        } catch (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }

    public async updateUser(req: Request, res: Response) {
        const { id } = req.params;
        const userId = parseInt(id, 10); 
    
        if (isNaN(userId)) {
            return res.status(400).json({ message: "O parâmetro 'id' não é um número válido" });
        } 
    
        try {
            const userExists = await UserRepository.findOneBy({
                email: req.body.email
            });
    
            if (!userExists)
                return res.status(400).json({ message: "Usuário não existe no sistema" });
    
            if (userExists && userId !== userExists.id)
                return res.status(400).json({ message: "Email já está sendo utilizado" });
    
            if (req.body.oldPassword && !await userService.DecodePassword(req.body.oldPassword, userExists.password))
                return res.status(400).json({ message: "Senha anterior incorreta" });
    
            const userUpdate: UserDto = req.body;
            const user = UserRepository.create(userUpdate);
    
            if (req.body.password) {
                const encodedPassword: string = await userService.EncodePassword(req.body.password);
                user.password = encodedPassword;
            }
            user.id = userId; 
    
            return res.status(200).json(await UserRepository.save(user));
        } catch (error) {
            console.log(error);
            return res.status(400).json({ message: "Erro ao atualizar usuário" });
        }
    }
    

}

export default new UserController();
