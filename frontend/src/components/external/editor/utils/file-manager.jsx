/**
 * Constructs the file tree
 * @param data Results fetched via an API
 */
export function buildFileTree(data) {
    const dirs = data.filter((x) => x.type === "dir");
    const files = data.filter((x) => x.type === "file");
    const cache = new Map(); // Cache
  
    // Root directory to be built
    let rootDir = {
      id: "root",
      name: "root",
      parentId: undefined,
      type: "directory", // Changed from Type.DIRECTORY
      path: "",
      depth: 0,
      dirs: [],
      files: [],
    };
  
    // Store <id, directory object> into map
    dirs.forEach((item) => {
      let dir = {
        id: item.path,
        name: item.name,
        path: item.path,
        parentId:
          item.path.split("/").length === 2
            ? "0"
            : dirs.find((x) => x.path === item.path.split("/").slice(0, -1).join("/"))?.path,
        type: "directory", // Changed from Type.DIRECTORY
        depth: 0,
        dirs: [],
        files: [],
      };
  
      cache.set(dir.id, dir);
    });
  
    // Store <id, file object> into map
    files.forEach((item) => {
      let file = {
        id: item.path,
        name: item.name,
        path: item.path,
        parentId:
          item.path.split("/").length === 2
            ? "0"
            : dirs.find((x) => x.path === item.path.split("/").slice(0, -1).join("/"))?.path,
        type: "file", // Changed from Type.FILE
        depth: 0,
      };
  
      cache.set(file.id, file);
    });
  
    // Build file tree
    cache.forEach((value, key) => {
      // '0' means the file or directory is in the root directory
      if (value.parentId === "0") {
        if (value.type === "directory") rootDir.dirs.push(value);
        else rootDir.files.push(value);
      } else {
        const parentDir = cache.get(value.parentId);
        if (value.type === "directory") parentDir.dirs.push(value);
        else parentDir.files.push(value);
      }
    });
  
    // Compute file depth
    getDepth(rootDir, 0);
  
    return rootDir;
  }
  
  /**
   * Computes file depth
   * @param rootDir Root directory
   * @param curDepth Current depth
   */
  function getDepth(rootDir, curDepth) {
    rootDir.files.forEach((file) => {
      file.depth = curDepth + 1;
    });
    rootDir.dirs.forEach((dir) => {
      dir.depth = curDepth + 1;
      getDepth(dir, curDepth + 1);
    });
  }
  
  export function findFileByName(rootDir, filename) {
    let targetFile = undefined;
  
    function findFile(rootDir, filename) {
      rootDir.files.forEach((file) => {
        if (file.name === filename) {
          targetFile = file;
          return;
        }
      });
      rootDir.dirs.forEach((dir) => {
        findFile(dir, filename);
      });
    }
  
    findFile(rootDir, filename);
    return targetFile;
  }
  
  export function sortDir(l, r) {
    return l.name.localeCompare(r.name);
  }
  
  export function sortFile(l, r) {
    return l.name.localeCompare(r.name);
  }
  