import { Server, Socket } from "socket.io";
import path from "path"
import  {TerminalManager} from "./pty.js"
import { fetchS3Folder, saveFilesToS3, saveToS3 } from "./aws.js";
import { fetchDir, saveFile,fetchFileContent } from "./fs.js";
import {applyPatch} from "diff"

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



const terminalManager=new TerminalManager();


const updatedFiles=new Map();

const updatedFilesFlag=new Map();



setInterval(()=>{
    if(updatedFiles?.size==0) return;
    console.log(11);
    
   saveFilesToS3(updatedFiles,updatedFilesFlag);
    
},6000*5)

export const initWs=(server)=>{


    const io=new Server(server,{
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection",async(socket)=>{
        const replId=socket.handshake.query.roomId;
        console.log(replId);
        

        if(!replId){
            socket.disconnect();
            terminalManager.clear(socket.id);
            return;
        }


        await fetchS3Folder(`project/${replId}`,path.join(__dirname,`../tmp/${replId}`))

        console.log("after fetch");
        

             // once copied send the user back the copied directory in tmp!
             try {
                
           socket.emit('loaded',
   
               {
                   rootContent:await fetchDir(path.join(__dirname,`../tmp/${replId}`),"")
               }
           )
             } catch (error) {
                console.log(error.message);
                
             }


        initHandlers(socket,replId );


    });

    const initHandlers=(socket,replId)=>{
        socket.on("disconnect", () => {
            console.log(`user disconnected  ->  ${replId}`);


        });

        socket.on("fetchDir",async(dir,callback)=>{
            const dirPath = path.join(__dirname, `../tmp/${replId}/${dir}`);
            const contents = await fetchDir(dirPath, dir);
             callback(contents);
        })


        socket.on("fetchContent", async (filePath, callback) => {
            console.log(filePath);
            // updatedFiles.set(`project/${replId}${filePath}`,data)
            const fullPath = path.join(__dirname, `../tmp/${replId}/${filePath.path}`);
            const data = await fetchFileContent(fullPath);
            // if(!updatedFilesFlag.has(filePath))
            console.log(data);
            
            updatedFiles.set(`project/${replId}${filePath}`,data)
            callback(data);
        });

        socket.on("updateContent", async ({filePath,changes}) => {
            try {
                if(!updatedFiles.has(`project/${replId}${filePath}`)){
                    const fullPath = path.join(__dirname, `../tmp/${replId}/${filePath}`);
                    const data = await fetchFileContent(fullPath);
                     updatedFiles.set(`project/${replId}${filePath}`,data);
                     console.log(filePath+"from upd");
                     
                }
                console.log(changes);
                
                const updatedContent = applyPatch(updatedFiles.get(`project/${replId}${filePath}`), changes);
                // upd
                const fullPath = path.join(__dirname, `../tmp/${replId}/${filePath}`);

                await saveFile(fullPath, updatedContent);
                console.log(filePath);
                // if(updatedFiles.has(replId+filePath)){
                    updatedFiles.set(`project/${replId}${filePath}`,updatedContent);
                    updatedFilesFlag.set(`project/${replId}${filePath}`,true);
                // }
                // else updatedFiles
                // await saveToS3(`project/${replId}`, filePath, content);
            } catch (error) {
               console.log("error while updating"+error.message);
                  
            }
        });

        socket.on("reqTerminal",async()=>{
            console.log(replId+"aaaaa");
            
            terminalManager.createPty(socket.id,replId,(data,id)=>{
                socket.emit('terminal', {
                    data: Buffer.from(data,"utf-8")
                });
            })
        })


        socket.on("terminalData", async ({data,terminalId}) => {
            terminalManager.write(socket.id, data);
        });


    }


}