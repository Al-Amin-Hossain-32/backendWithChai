import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req,res)=>{
    //get user details from fronted
    // validation = not empty
    // check if user already exists : username,email
    // check for images, check for avatar
    //upload them to coudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return res
    const {username,fullname,email,password} =req.body;
    // console.log("email",email )
    
    // কোনো  ডেটা ফিল্ড ফাকা রাখা হয়েছে কিনা সেটা চেক করেছি ।
    //checked is empty string pass any data value
    if([fullname,email,username,password].some((field)=> field?.trim() ==="")){
            throw new ApiError(400,"All fields are required")
    }

    //অলরেডি ইউজার ইক্সিট করে কিনা সেটা চেকিং

    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })

    // যদি ইউজার আগেই ক্রিয়েট করা থাকে তাহলে এই এরর দাও
    if(existedUser){
        throw new ApiError(409,"User with email or username alrady exists")

    }
// অভতার এর লোকাল পাথ 
    const avatarLocalPath =  req.files?.avatar[0]?.path

    // const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length> 0){
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    //অভতার না পাওয়া গেলে এই এরর দেখাও
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar files is required")
    }
    // ‍যদি পাওয়া যায় তাহলে ক্লাউডিনারিতে আপলোড করো 
   const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    
    // আবতার ক্লাউডনারিতে আপলোড না হলে এই এরর দাও
    if(!avatar){
        throw new ApiError(400,"Avatar files is required")
    }

    // সবকিছু ঠিকঠাক থাকলে এই ইউজার ক্রিয়েট করো 
  const user = await  User.create({
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
     // ইউজার ক্রিয়েট না হলে এই এরর দাও
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd Successfully")
    )

})  

export {registerUser} ;