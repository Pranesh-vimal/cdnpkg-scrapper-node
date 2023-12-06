const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
require("dotenv").config();

const extractJsFileUrls = async (url) => {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const jsFileUrls = [];

    $("table.ui.very.basic.compact.small.table tbody tr").each(
        (index, element) => {
            const jsFileUrl = $(element).find("td a").attr("href");
            // get first td element
            const jsFileName = $(element).find("td").first().text();
            jsFileUrls.push({
                jsFileUrl,
                jsFileName,
            });
        }
    );

    return jsFileUrls;
};

const downloadJsFile = async (jsFileUrls) => {
    const downloadDir = "download";
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }

    for (const jsFileUrl of jsFileUrls) {
        console.log(`Downloading: ${jsFileUrl.jsFileName}`);
        const response = await axios.get(jsFileUrl.jsFileUrl);
        const filePath = `${downloadDir}/${jsFileUrl.jsFileName}`;
        // jsFileUrl.jsFileName might require new folder to be created
        const folderPath = filePath.substring(0, filePath.lastIndexOf("/"));
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }
        fs.writeFileSync(filePath, response.data);
        console.log(`Downloaded: ${jsFileUrl.jsFileName}`);

        // sleep for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
};

(async () => {
    try {
        const url = process.env.CDN_URL;
        const jsFileUrls = await extractJsFileUrls(url);
        await downloadJsFile(jsFileUrls);
    } catch (error) {
        console.error(error.message);
    }
})();
