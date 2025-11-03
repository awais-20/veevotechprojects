const express = require('express');
const userEvent = require('../emitter/eventemitter');
const fs = require('fs');
const path = require('path');
const file = require('../Data/users.json');
const { error } = require('console');

const filePath = path.join(__dirname,  '../Data/users.json');

class crete_user{
    constructor(){

    }

    async createUser(req, res, next){
    try {
        let userData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        userData.user = userData.user||[];

          let userid = 2;
            if (userData.user.length> 0) {
                const oldUSer = userData.user[userData.user.length -1 ].userID;
                userid = (oldUSer) + 2;
          
            }
            const {name, email, password} = req.body;
            if(!name||!email||!password){
               const error = new Error("All fields are required");
               error.statusCode = 400;
               return next(error);     
            }

     // if user Already Exist
            const EmailExists = userData.user.some(u=>u.email==email);
            if(EmailExists){
             const error = new Error("Email Already Exist");
             error.statusCode  = 400;
             return next(error);
            }
     
            const newuser = {   
                userID : userid,
                name,
                email,
                password
            }

            userData.user.push(newuser)
            fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));

            userEvent.emit("eventTask", "User Created", newuser);
          return res.status(201).json({
            success: true,
            message:"USer Created Successfully",
            newuser
          });

    } 
        catch (error) {
         return next(error);
        }
}


async updateUser(req, res, next){
    try {
        let userData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        userData.user = userData.user || [];

        const {name, email, password} = req.body;
        const{id} = req.params;
        const user = userData.user.find(u=> u.userID==id);
        
        if (!user){
           
            const error = new Error("User Not Found");
            error.statusCode = 400;
            return next(error);
        }

        if(name) user.name =name
        if(email) user.email =email
        if(password) user.password =password
        
    
        fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
        userEvent.emit("eventTask", "USer Updated Successfully",   user)

        res.status(200).json({
                success: true,
                message:"User updated Successfully",
                user
            });
          }   catch (error) {
             return next(error);
        }
    }
  

async getUSer(req, res, next){
    try {
            const userData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            const user = userData.user;
             userEvent.emit("eventTask", "getUSer", user);
                res.status(200).json({
                success: true,
                message:"user Fetched Successfully",
                user
             });
    
        } catch (error) {

            return next(error);
        }
    }


async deleteUser(req, res, next){
   try {
    
        const userData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const {id} = req.params;
       
        const userExist = userData.user.find(u=>u.userID ==id);
            if(!userExist){
                const error = new Error("User Does not Exist");
                error.statusCode = 404;
                return next(error);

            }

               const data = userData.user.filter(u => u.userID !=id);
               userData.user = data
               fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
                
                  userEvent.emit("eventTask", "deleteUser",  data);
                  return res.status(200).json({
                    success:true,
                    message: "this user Deleted Successfully",
                    id
                    
                });
            } catch (error) {
               return next(error);
        }
        }
    

    }




module.exports = new crete_user()
