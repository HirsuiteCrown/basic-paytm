const express = require("express");
const zod = require("zod");
const {User, Account} = require("../db");
const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config");
const {authMiddleware} = require("../middleware")

const router = express.Router();


const signupSchema = zod.object({
    username: zod.string().email(),
    lastName: zod.string(),
    firstName: zod.string(),
    password: zod.string()
})

router.post("/signup", async (req,res)=>{
    const body = req.body;
    const {success} = signupSchema.safeParse(body);

    if(!success){
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const existingUser = await User.findOne({
        username: body.username,
    })

    if(existingUser){
        return res.status(411).json({
            message: "user already exist"
        })
    }
    
    const dbUser = await User.create(body);

    await Account.create({
        userId:dbUser._id,
        username: dbUser.username,
        balance: 1+Math.random()*10000
    })

 
    //user created so we have to give some token to user also
    const token = jwt.sign({
        userId: dbUser._id
    },JWT_SECRET)
    res.json({
        message: "User created successfully",
        token: token,
        user: {
           userId: dbUser._id,
        },
    });

})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/",authMiddleware, async (req,res)=>{
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Error while updating information"
        })
    }

    await User.updateOne(req.body,{
        _id: req.userId
    })

    res.json({
        message: "Updated successfully"
    })
})


router.get("/bulk", async(req,res)=>{
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        },{
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user =>({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})


module.exports=router;