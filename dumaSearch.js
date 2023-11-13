import puppeteer from 'puppeteer';
import * as path from 'path';

const centros = {
    "ESCUELA DE INGENIERÍAS INDUSTRIALES": "a01b01",
    "E. T. S. DE ARQUITECTURA": "a01b27",
    "E.T.S. DE INGENIERÍA DE TELECOMUNICACIÓN": "a01b07",
    "E. T. S. DE INGENIERÍA INFORMÁTICA": "a01b06",
    "E.U. DE ENFERMERÍA (CENTRO ADSCRITO, RONDA)": "a01b02",
    "FACULTAD DE BELLAS ARTES": "a01b26",
    "FACULTAD DE CIENCIAS": "a01b15",
    "FACULTAD DE CIENCIAS DE LA COMUNICACIÓN": "a01b16",
    "FACULTAD DE CIENCIAS DE LA EDUCACIÓN": "a01b17",
    "FACULTAD DE CIENCIAS DE LA SALUD": "a01b08",
    "FACULTAD DE CIENCIAS ECONÓMICAS Y EMPRESARIALES": "a01b19",
    "FACULTAD DE COMERCIO Y GESTIÓN": "a01b11",
    "FACULTAD DE DERECHO": "a01b20",
    "FACULTAD DE ESTUDIOS SOCIALES Y DEL TRABAJO": "a01b18",
    "FACULTAD DE FILOSOFÍA Y LETRAS": "a01b03",
    "FACULTAD DE MEDICINA": "a01b22",
    "FACULTAD DE PSICOLOGÍA Y LOGOPEDIA": "a01b23",
    "FACULTAD DE TURISMO": "a01b13",
    "INSTITUTO ANDALUZ DE CRIMINOLOGÍA": "a01b25"
};

const teacherMap = new Map();
    
/**
 * -Given the next parameters, returns an array with name and url from the teachers who appeared at the results
 * @param {*} name    Name of the teacher
 * @param {*} surname First Name
 * @param {*} college University College from UMA
 * @returns 
 */
async function dumasearch(nombre, apellido_1, centro, windows_on=true) {
    
    const browser = await puppeteer.launch({headless: !windows_on, timeout: 0});
    const page = await browser.newPage();

    await page.goto("https://duma.uma.es/duma/buscador/persona/");
    if (nombre !== undefined)
        await page.type("#id_nombre", nombre);    
    if (apellido_1 !== undefined)
        await page.type("#id_apellido_1", apellido_1);
    if (centro  !== undefined)
        await page.select("#id_centro", centro);
    await page.evaluate(() => {
        document.querySelector("#id_pas").click();
    });
    await page.keyboard.press("Enter");
    await page.waitForNavigation({timeout: 0});

    // Evaluates the page and gets the data from the search
    const teachernames = await page.$$eval("h4 a:first-child", (elements) => {
        const namesfound /*: {name: string, url: string}[] */= [];
        elements.map((element) => {
            const name = element.title;
            const url = element.href;
            if (name) namesfound.push({name: name, url: url});
        })
        return namesfound
    })
    teachernames.map((element) => {
        teacherMap.set(element.url, element.name)
    })
    await browser.close();
    // return teachernames;
}

async function aeiou_search(centro) {
    await Promise.allSettled([dumasearch("a", "", centro),
    dumasearch("e", "", centro),
    dumasearch("i", "", centro),
    dumasearch("o", "", centro),
    dumasearch("u", "", centro)])
    ;
}

async function main() {
    for (let property of Object.keys(centros)) {
        await aeiou_search(centros[property]);
    }
}

function getuuid(url){
    const regex = /\/([0-9a-fA-F-]+)\//;
    const match = url.match(regex);
    if (match && match[1]) {
        return match[1];
    } else {
        return false
    }

}
