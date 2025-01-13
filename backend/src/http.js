import express from "express"
import { copyS3Folder } from "./aws.js"

export const initHttp=(app)=>{
    app.use(express.json())

    app.post("/project/create",async (req,res)=>{

        const {replId,language='nodejs'}=req.body;
        console.log(replId);
        
        if (!replId ) {
            res.status(400).send("Bad request");
            return;
        }

        await copyS3Folder(`base/${language}`,`project/${replId}`);

        return res.status(200).json("project created")
    })
}