import { useEffect, useState } from 'react';
import { Editor } from './Editor';
import { useSearchParams } from 'react-router-dom';
import styled from '@emotion/styled';
import { Output } from './Output';
import { TerminalComponent as Terminal } from './Terminal';
import {  io } from 'socket.io-client';
import { EXECUTION_ENGINE_URI } from '../config';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end; /* Aligns children (button) to the right */
  padding: 10px; /* Adds some space around the button */
`;

const Workspace = styled.div`
  display: flex;
  margin: 0;
  font-size: 16px;
  width: 100%;
`;

const LeftPanel = styled.div`
  flex: 1;
  width: 60%;
`;
const RightPanel = styled.div`
  flex: 1;
  display: flex; // Allows the Terminal to stretch
  flex-direction: column;
  width: 40%;
  height: 100%; // Ensure it takes full height
  overflow: hidden; // Prevent unwanted scrollbars
`;


function useSocket(replId) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = io(`${EXECUTION_ENGINE_URI}?roomId=${replId}`);
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [replId]);

    return socket;
}

export const CodingPage = () => {
    const [searchParams] = useSearchParams();
    const replId = searchParams.get('replId') ?? '';
    const [loaded, setLoaded] = useState(false);
    const socket = useSocket(replId);
    const [fileStructure, setFileStructure] = useState([]);
    const [selectedFile, setSelectedFile] = useState(undefined);
    const [showOutput, setShowOutput] = useState(false);

    useEffect(() => {
        if (socket) {
            socket.on('loaded', ({ rootContent }) => {
                setLoaded(true);
                setFileStructure(rootContent);
            });
        }
    }, [socket]);

    const onSelect = (file) => {
        if (file.type === "directory") {
            console.log(file.path);
            
            socket?.emit("fetchDir", file.path, (data) => {
                setFileStructure(prev => {
                    const allFiles = [...prev, ...data];
                    return allFiles.filter((file, index, self) => 
                        index === self.findIndex(f => f.path === file.path)
                    );
                });
            });

        } else {
            console.log(file.path+12);
            socket?.emit("fetchContent", { path: file.path }, (data) => {
               
                file.content = data;
                setSelectedFile(file);
            });
        }
    };
    
    if (!loaded) {
        return "Loading...";
    }

    return (
        <Container>
             <ButtonContainer>
                <button onClick={() => setShowOutput(!showOutput)}>See output</button>
            </ButtonContainer>
            <Workspace>
                <LeftPanel>
                    <Editor socket={socket} selectedFile={selectedFile} onSelect={onSelect} files={fileStructure} />
                </LeftPanel>
                <RightPanel>
                    {showOutput && <Output />}
                    <Terminal socket={socket} />
                </RightPanel>
            </Workspace>
        </Container>
    );
}