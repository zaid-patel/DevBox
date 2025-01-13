import React from 'react'
import {buildFileTree} from "./file-manager";

export const useFilesFromSandbox = (id, callback) => {
  React.useEffect(() => {
    fetch('https://codesandbox.io/api/v1/sandboxes/' + id)
      .then(response => response.json())
      .then(({data}) => {
        const rootDir = buildFileTree(data);
        callback(rootDir)
      })
  }, [])
}