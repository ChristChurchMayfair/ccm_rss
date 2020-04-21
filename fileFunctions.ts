import fs from 'fs'
import rimraf from 'rimraf'

export function RemoveAndRecreateDirectory(directoryPath: string) {
    rimraf.sync(directoryPath) // This recursively deletes the publish directory
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath)
    }
}

export function writeToFile(content: string, directory: string, filename: string) {
    const path = directory + '/' + filename
    fs.writeFile(path, content, (err) => {
        if (err) throw err;
        console.log('Saved data to ' + path);
    });
}