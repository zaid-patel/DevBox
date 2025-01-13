import path from "path"
import fs from "fs"


export const writeFile=async(filePath,content)=>{
    return new Promise(async(resolve,reject)=>{
        await createFolder(path.dirname(filePath))

        fs.writeFile(filePath,content,(err)=>{
            if(err) reject(err);
            else resolve();
        })
    })
}

export const createFolder=(dirName)=>{
    return new Promise((resolve, reject) => {
        fs.mkdir(dirName,{recursive:true},(err)=>{
            if(err) return reject(err);
            else resolve();
        })
    })
}



export const fetchDir = async (dir, baseDir) => {
    try {
        const files = await fs.promises.readdir(dir); // Read directory contents
        const result = [];

        for (let file of files) {
            const fullPath = path.join(dir, file); // Get full path of the file
            const stats = await fs.promises.stat(fullPath); // Get file stats

            // Check if it's a directory or a file
            result.push({
                type: stats.isDirectory() ? 'dir' : 'file',  // Check if directory
                name: file,
                path: `${baseDir}/${file}`,
            });
        }

        return result;
    } catch (err) {
        throw new Error(`Error fetching directory: ${err}`);
    }
};

export const fetchFileContent=(file)=>{
    return new Promise((resolve,reject)=>{
        fs.readFile(file,"utf-8",(err,data)=>{
            if(err) reject(err);
            else{
                resolve(data)
            }
        });
    })
}

export const saveFile=async (file,content)=>{
     return new Promise((resolve,reject)=>{
        fs.writeFile(file,content,"utf-8",(err)=>{
            if(err) reject(err);
            else resolve();
        })
     })
}

