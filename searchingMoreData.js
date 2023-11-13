import data from './target/datos.json' assert { type: 'json' };
import puppeteer from 'puppeteer';
import fs from'fs';

async function umasearch(url, windows_on=true) {
    
    const browser = await puppeteer.launch({headless: !windows_on, timeout: 0});
    const page = await browser.newPage();

    await page.goto(url);
    await page.waitForSelector(".gcsc-more-maybe-branding-root");
    let res = await page.$$eval('a.gs-title', urlList => {
        const arr = [];
        urlList.forEach(urlReference => {
            if (urlReference !== '')
                arr.push(urlReference.href);
        });
        return (arr);
    });
    console.log(res);
    let departmentURL;
    for (const url of res) {
        if (url.startsWith("https://www.uma.es/departments/teachers/")) {
            departmentURL = url;
            break ;
        }
    }
    console.log(departmentURL);
    if (departmentURL !== undefined) {
        await page.goto(departmentURL);
        await page.waitForSelector("ul.rightList li a");
        let subjects = await page.$$eval('ul.rightList li a', el => {
            const arr = [];
            console.log("Hoy");
            console.log(el.__proto__);
            console.log(el.className);

            if (el !== undefined)
            {
                for (const anchor of el) {
                    arr.push({
                        name : anchor.textContent,
                        url : anchor.href,
                    });
                }
                
            }
            return (arr);
        });
        console.log(subjects);
    }
    await browser.close();
}

const element = data[2]; // Do it for all the json
const nameEncoded = element.title.replace(/ /g, "%20");
const url = ("https://www.uma.es/busqueda/?q=" + nameEncoded);
console.log(url);

umasearch(url).then(() => {
    /*const mySetArray = Array.from(mySet);
    fs.writeFileSync("./target/more_data.json", JSON.stringify(mySetArray));*/
}).catch();