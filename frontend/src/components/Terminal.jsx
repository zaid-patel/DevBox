import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

const OPTIONS_TERM = {
    cursorBlink: true,
    cols: 200,
    theme: {
        background: "black",
        // font
    },
};

function ab2str(buf) {
    return new TextDecoder().decode(new Uint8Array(buf));
}

export const TerminalComponent = ({ socket }) => {
    const terminalRef = useRef(null);
    const terminalInstance = useRef(null);

    useEffect(() => {
        if (!terminalRef.current || !socket) return;
        console.log(socket);
        
        const term = new Terminal(OPTIONS_TERM);
        const fitAddon = new FitAddon();
        terminalInstance.current = term;

        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        // Handle incoming data
        const terminalHandler = ({ data }) => {
            if (data instanceof ArrayBuffer) {
                term.write(ab2str(data));
            }
        };

        socket.emit("reqTerminal");
        socket.on("terminal", terminalHandler);

        term.onData((data) => {
            socket.emit("terminalData", { data });
        });

        // Emit initial command
        socket.emit("terminalData", { data: "\n" });

        // Resize handling
        const handleResize = () => fitAddon.fit();
        window.addEventListener("resize", handleResize);

        return () => {
            socket.off("terminal", terminalHandler);
            term.dispose();
            window.removeEventListener("resize", handleResize);
        };
    }, [socket]);

    return (
        <div
        style={{
            width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "black", // Terminal background
        color: "white", // Text color
        fontSize: "16px", // Ensure text is legible
        fontFamily: "monospace", // Terminal-like font
        }}
        ref={terminalRef}
    ></div>
    );
};
