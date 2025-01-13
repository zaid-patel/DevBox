import Editor from "@monaco-editor/react";
import { diffLines,createTwoFilesPatch }  from 'diff';
import { useRef } from "react";

export const Code = ({ selectedFile, socket }) => {
  if (!selectedFile)
    return null

  const code = selectedFile.content
  const previousContentRef = useRef(code);
  let language = selectedFile.name.split('.').pop()

  if (language === "js" || language === "jsx")
    language = "javascript";
  else if (language === "ts" || language === "tsx")
    language = "typescript"
  else if (language === "py" )
    language = "python"

    function debounce(func, wait) {
      let timeout;
      return (value) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func(value);
        }, wait);
      };
    }

  return (
      <Editor
        height="100vh"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={debounce((value) => {
          const previousContent = previousContentRef.current;
          console.log(selectedFile.path+" "+value);
          // const changes = diffLines(previousContent, value);
          // previousContentRef.current = value;
          // console.log("Sending diffs:", changes);
          const patch = createTwoFilesPatch(selectedFile.path, selectedFile.path, previousContentRef.current, value);
          previousContentRef.current = value;
          socket?.emit('updateContent', { filePath: selectedFile.path, changes:patch });

          // socket?.emit("updateContent", { filePath: selectedFile.path, changes });
        }, 500)}
      />
  )
}