import { fork } from 'node-pty';
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const SHELL="bash"
const shell = process.env.COMSPEC || 'cmd.exe'; // For Windows


export class TerminalManager{
    sessions;

    constructor(){
        this.sessions={};
    }

    createPty=(id,replId,onData)=>{
        
        
        const term=fork(shell,[],{
            cols:100,
            name:'xterm',
            cwd:path.join(__dirname,`../tmp/${replId}`)
        });

        console.log(term);
        term.on("data",(data)=>onData(data,term.pid));


        this.sessions[id]={
            terminal:term,
            replId,
        };
        console.log(this.sessions);


        term.on("exit",()=>{
            delete this.sessions[term.pid]
        });

        return term;
    }

    write(termId,data){
        this.sessions[termId]?.terminal.write(data)
    }

    clear(terminalId) {
        this.sessions[terminalId]?.terminal.kill();
        delete this.sessions[terminalId];
    }
}