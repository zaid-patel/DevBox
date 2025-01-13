
import pkg from 'aws-sdk';
const {S3} = pkg;
import path from "path";
import { writeFile,createFolder } from "./fs.js";

const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    endpoint: process.env.S3_ENDPOINT
})


// nodejs

const copyS3Folder=async(basePath,projectPath)=>{
    try {
        const listParams={
            Bucket:process.env.AWS_S3_BUCKET,
            Prefix:basePath

        }


        const listObjects= await s3.listObjectsV2(listParams).promise();
        console.log(11);

        if (!listObjects?.Contents || listObjects.Contents.length === 0) return;

        await Promise.all(listObjects.Contents.map(async(listObj)=>{
            if(!listObj.Key) return;

            let destinationKey=listObj.Key.replace(basePath,projectPath)

            console.log(`${listObj.Key}++++${destinationKey}`);

            const copyParams={
                Bucket:process.env.AWS_S3_BUCKET,
                Key:destinationKey,
                CopySource:`${process.env.AWS_S3_BUCKET}/${listObj.Key}`,
    
            }

            await  s3.copyObject(copyParams).promise()

           
        }));

        

    } catch (error) {
        console.error('Error copying folder:', error);
    }
}


const fetchS3Folder=async(src,destination)=>{
    try {
        console.log(src);
        
        
        const listParams={
            Bucket:process.env.AWS_S3_BUCKET,
            Prefix:src,
        }
        console.log("recursive log from fetch");
        
        const listedObjects=await s3.listObjectsV2(listParams).promise()
    
        if(listedObjects.Contents){
            console.log(listedObjects.Contents.length);
            await Promise.all(listedObjects.Contents.map(async(obj)=>{
                
                
                const fileKey=obj.Key
                console.log(fileKey);
    
                if(fileKey){
                    const getObjectParams = {
                        Bucket: process.env.AWS_S3_BUCKET ?? "",
                        Key: fileKey
                    };
                    console.log("recursive log from get");
                    const data = await s3.getObject(getObjectParams).promise();
    
                    if(data.Body){
                        const fileData=data.Body;
                        const filePath=`${destination}/${fileKey.replace(src,"")}`;
    
                        await writeFile(filePath,fileData);
    
                        console.log("main task completed (file copied from s3 to local)");
                        
                    }
                }
            }))
        }
    } catch (error) {
        console.log("fetchs3 error"+error);
        
    }

}


export const saveFilesToS3 = async (updatedFiles,updatedFilesFlag) => {
    if (updatedFiles.size === 0) return;

    const promises = [];
    updatedFiles.forEach((value, key) => {
        // const replId=key.split('>')[0];
        // const filePath=key.split('>')[1];
        if(!updatedFilesFlag.has(key)) return;
        console.log(key+"from updated if more than one zaid pagal hogya he");
        
        const params = {
            Bucket: process.env.AWS_S3_BUCKET ?? "",
            Key: key,    // Unique identifier for the file in S3
            Body: value, // The file content
        };
        promises.push(s3.putObject(params).promise());
    });

    try {
        await Promise.all(promises);
        console.log('All files saved to S3 successfully!');
        updatedFiles.clear(); // Clear the map after saving
        updatedFilesFlag.clear();
    } catch (error) {
        console.error('Error saving files to S3:', error);
    }
};

//  saveToS3(`project/${replId}`, filePath, content);

const saveToS3 = async (key, filePath, content) => {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET ?? "",
        Key: `${key}${filePath}`,
        Body: content
    }
    console.log(key+" "+filePath+""+content);
    
    console.log("recursive log from copy");
    await s3.putObject(params).promise()
}




export {
    copyS3Folder,
    fetchS3Folder,
    saveToS3,
}