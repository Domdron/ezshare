import axios from "axios";
import * as fs from "fs";
import * as path from "path";

/**
 * Extracts the url of the last image file from an EZ Share Wifi SD card.
 *
 * Given a URL for a directory on an EZ Share Wifi SD card, this function returns the URL of the last image file in
 * that directory. The EZ Share Wifi SD card http server returns the directory listing as html, so this function
 * scrapes the html to find the last image file. The html looks like this for an Olympus PEN E-PL5 camera:
 *
 * <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
 * "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
 * <html xmlns="http://www.w3.org/1999/xhtml">
 * <head>
 * <meta name="format-detection" content="telephone=no">
 * <meta http-equiv="Content-Language" content="zh-cn">
 * <meta http-equiv="Content-Type" content="text/html; charset=gb2312">
 * <link rel="shortcut icon" href="i-share/img/favicon.ico" type="image/x-icon">
 * <link rel="icon" href="i-share/img/favicon.ico" type="image/x-icon">
 * <title>Index of A:\DCIM\100OLYMP</title>
 * </head>
 * <body>
 * <h1><a href="photo">back to photo</a></h1>
 * <h1>Directory Index of A:\DCIM\100OLYMP</h1>
 * <pre>
 *    2023- 7-12    8:21:10         &lt;DIR&gt;   <a href="dir?dir=A:%5CDCIM%5C100OLYMP"> .</a>
 *    2023- 7-12    8:21:10         &lt;DIR&gt;   <a href="dir?dir=A:%5CDCIM"> ..</a>
 *    2023- 7-12    8:21:10       15184KB  <a href="http://192.168.4.1/download?file=DCIM%5C100OLYMP%5C_7120001.ORF">
 * _7120001.ORF</a>
 *
 * Total Entries: 3
 * Total Size: 15184KB
 * </pre>
 * </body>
 * </html>
 *
 * Therefore, the this function searches for the last line that starts with a date and time, and then extracts the
 * URL of the image file from that line.
 *
 * @param directoryUrl The URL of the directory to search for the image file.
 */
async function getLastImageUrl(directoryUrl: string): Promise<string> {
    // Get the directory listing.
    const directoryListing = (await axios.get(directoryUrl)).data;

    // Split the directory listing into lines.
    const directoryListingLines = directoryListing.split("\n");

    const lastLine = extractLastImageUrl(directoryListingLines);

    // Extract the URL of the image file from the last line.
    let lastImageUrl = lastLine.match(/<a href="([^"]+)">/)[1];

    // Return the URL of the image file.
    return lastImageUrl;
}

/**
 * Extracts the last image file URL from the given directory listing response lines.
 * @param directoryListingLines
 */
function extractLastImageUrl(directoryListingLines: string[]): string {
    // Find the last line that starts with a date and time.
    for (let i = directoryListingLines.length - 1; i >= 0; i--) {
        if (directoryListingLines[i].match(/download\?file=/)) {
            return directoryListingLines[i];
        }
    }
    return "Not found";
}

/**
 * This function downloads the file at the given URL to the working directory.
 * @param url The URL of the file to download.
 * @param directory The directory to download the file to.
 */
async function downloadFile(url: string, directory: string): Promise<void> {
    // Extract the file name from the URL.
    const fileName = getFileName(url);
    const fullFileName = path.join(directory, fileName);

    // Download the file and save it to the directory.
    const writer = fs.createWriteStream(fullFileName);
    const response = await axios.get(url, {responseType: "stream"});
    response.data.pipe(writer);
    writer.on("finish", () => {
        console.log("Downloaded " + fileName);
        writer.close();
    });
}

/**
 * Extracts the image file name from the given URL. The base path of the file URL in the EZ Share Wifi SD card directory
 * listing looks like this: download?file=DCIM%5C100OLYMP%5C_7120001.ORF
 * The file name is the last part of the encoded path, i.e. the last part after the last %5C: _7120001.ORF
 * @param url
 */
function getFileName(url: string): string {
    return path.basename(url).match(/%5C([^%]+)$/)[1];
}

/**
 * This function checks whether the image file in the given URL has already been downloaded and downloads it if not.
 */
async function downloadIfNotExisting(url: string, directory: string): Promise<string|false> {
    const fileName = getFileName(url);
    if (!fs.existsSync(path.join(directory, fileName))) {
        console.log("Downloading " + fileName);
        await downloadFile(url, directory);
        return fileName;
    }
    return false;
}

async function downloadLastImage(directoryUrl: string, directory: string = "./") {
    const lastImageUrl = await getLastImageUrl(directoryUrl);
    await downloadIfNotExisting(lastImageUrl, directory);
}

// Every half second, take the first command line argument and call getLastImageUrl with it, then download the file
// at the returned URL and save it to the directory given by the second command line argument.
setInterval(() => downloadLastImage(process.argv[2], process.argv[3]), 500);

