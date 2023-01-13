import fs from 'fs-extra';

//fs.copy filter function
type FilterFunction = (src:string, dest:string)  => boolean;

export default async function copyFiles(srcDir:string, destDir:string) {
    return await fs.copy(srcDir, destDir) ;
}

