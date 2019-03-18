const puppeteer = require('puppeteer');

async function main() {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.goto('https://heidikieff.com', {"waitUntil" : "networkidle0"});
  await page.setViewport({width: 2560, height: 1600});

  const myfunc = (element) => {
          return element.map(function(img) {
             return {
                'url': img.src,
                'width': img.height,
                'height': img.width,
             }
          });
  }
 

  const extract_link = (element) => {
    return element.map(link => link.href);
  }

  const merge = (images) => {
    dict = new Map();
    for (let image of images.flat()) {
      let dimensions = {width: image.width, height: image.height};
      if dict.has(image.url) {
        dict[image.url].push(dimensions);
      } else {
        dict.set(image.url, [dimensions]);
      }
    }

    return dict;
  }
   
  //const images = await page.$$eval('img',myfunc);
  //console.log(images);

  //await page.setViewport({width: 750, height: 1334});
  //const iimages = await page.$$eval('img',myfunc);
  //console.log(iimages);

  const viewports = [{width: 750, height: 1334},{width: 2560, height: 1600}];

  const links = await page.$$eval('a', extract_link);
  const filtered_links = new Set(links.filter(link => link.includes("heidikieff.com")));

  crawler = await browser.newPage(); 

  for (let link of filtered_links) {
    await crawler.goto(link,{"waitUntil" : "networkidle0"});
    console.log("Going to ", link);
    images = new Array();
    for (let viewport of viewports) {
      await crawler.setViewport(viewport);
      images.push(await crawler.$$eval('img', myfunc));
    }
    console.log(merge(images));
  }

  await browser.close();
}

main();
