const http = require('http');
require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const puppeteer = require('puppeteer');
const port = 4000;
// const axios = require('axios');
const imgbbUploader = require("imgbb-uploader");
const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;
const db_host = process.env.DB_HOST;
const img_apikey = process.env.IMG_APIKEY;
const proxy_apikey = process.env.PROXY_APIKEY;
const scrap_url = 'http://api.scraperapi.com';

const app = express(); 
// app.enable('trust proxy');
app.get('/testing',function(req,res){
    (async () => {

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto(req.query.produit_url,{waitUntil: 'domcontentloaded'});
        const scrapedData = await page.evaluate(() =>
        Array.from(document.querySelectorAll('h4 a'))
          .map(link => ({
            title: link.innerHTML,
            link: link.getAttribute('href')
          }))
          )
        console.log('scrapedData',scrapedData);
        await page.close();
        await browser.close();
        return res.send(scrapedData);
    })();
});
app.get('/testing2',function(req,res){
    const puppeteer = require('puppeteer-extra')
        // Enable stealth plugin with all evasions
        puppeteer.use(require('puppeteer-extra-plugin-stealth')())
        ;(async () => {
        
        // Launch the browser in headless mode and set up a page.
        const browser = await puppeteer.launch({
            args: ['--no-sandbox','--disable-web-security'],
            headless: true
        })
        let chromeTmpDataDir = null;
        // find chrome user data dir (puppeteer_dev_profile-XXXXX) to delete it after it had been used
        let chromeSpawnArgs = browser.process().spawnargs;

        const page = await browser.newPage()
        await page.setExtraHTTPHeaders({
         'Accept-Language': 'en'
        });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36');
        var proxy = scrap_url+'?api_key='+proxy_apikey+'&url=';

        await page.goto(proxy+req.query.produit_url)
        const scrapedData = await page.evaluate(() => {
                return document.querySelector('body').innerHTML;
            })
        // const browser = await puppeteer.launch({
        //     headless: true,
        //     ignoreHTTPSErrors: true, 
        //     args: ['--disable-setuid-sandbox', '--no-sandbox', '--enable-features=NetworkService']
        // });
        // const page = await browser.newPage();
        // await page.goto(req.query.produit_url,{ waitUntil: 'load', timeout: 0 });
        // await page.waitForSelector('body');
        // const scrapedData = await page.evaluate(() => {
        //     return document.querySelector('body').innerHTML;
        // })
        console.log('scrapedData',scrapedData);
        await page.close();
        await browser.close();
        
        if (chromeTmpDataDir !== null) {
            fs.removeSync(chromeTmpDataDir);
        }
        return res.send(scrapedData);
    })();
});
app.get('/getproduct', async (req,res) => { 
    // res.status(200).jsonp({ status:true,data:req.query.produit_url });
    // res.send(req.query.produit_url); 
  const description = [];
    //start new page
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage(); 
  await page.setDefaultNavigationTimeout(0);
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en'
   });
   await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36');
   var proxy = scrap_url+'?api_key='+proxy_apikey+'&url=';

   await page.goto(proxy+req.query.produit_url,{waitUntil: 'load',timeout: 0});//{waitUntil: 'load',timeout: 0});
    //   await page.waitFor(1700);
    // await page.waitForSelector('.product-name');
    // res.status(200).jsonp({ status:true,data: await page.evaluate(async () => {return document.querySelector('body').innerHtml;}) });
    let urls = await page.evaluate(async () => { 
        let results = []; 
        let imgs = []; 
        let name = document.querySelector('.product-name h1').innerText; 
        let price = document.querySelector('span .price').getAttribute('content'); 
        let description = document.querySelector('.caracteristics .product-tabs:first-child .new-std').innerText;
        let items =  document.querySelectorAll('.main-container .product-slider img');
        let brand = document.querySelector('.product-brand a').getAttribute('title');  
        let category = document.querySelector('.product-shop').getAttribute('data-category');
        items.forEach( (item) => {
            imgs.push({ 
                src: item.getAttribute('content'),
            });  
        });   
        results.push({
            name: name,
            brand_name: brand,
            price: price,
            regular_price: price,
            description: description,
            images: imgs,
            categories: JSON.stringify(category)
            // imgs: JSON.stringify(imgs),
        });
        return results;
    }); 
    await browser.close(); 
    // let arrs = []; 
    // let tempurl = urls[0].images;
    // for(let val of tempurl) { 
    //     const options = {
    //         apiKey: img_apikey, // MANDATORY 
    //         imageUrl: val.url,    
    //       };  
    //       const imgresponse = await imgbbUploader(options)
    //       arrs.push({ 
    //         src: imgresponse.image.url,
    //         })
            
    // }
    // urls[0].images = JSON.stringify(arrs);
    res.status(200).jsonp({ status:true,data:urls });
    // saving catched data 
    // let sql = 'INSERT INTO products SET ?';
    // let _err = false;
    // let query = db.query(sql,urls, (err,result) => {
    //     if(err) {
    //         console.log(err);
    //         res.status(200).jsonp({ status:false,message: 'Product already exist' })
    //     }  else{
    //         res.status(200).jsonp({ status:true,message: 'Data Inserted Successfully',last_id:result.insertId });
    //     }
    //     // console.log(result);
    // });  
});
app.post('/getproductloop', async (req,res) => {
    // var fs = require('fs');
    // var links = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    // res.send(links);
    // res.send(links);
  const description = urls = response = [];
  const links = req.query.urls; 
  
  for(let index = 0;index<links.length;index++) {
    //start new page
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage(); 
    await page.goto(links[index],{waitUntil: 'load',timeout: 0});
    urls[index] = await page.evaluate(async () => {
        let results = []; 
        let imgs = [];  
        let name = document.querySelector('.product-name h1').innerText; 
        let price = document.querySelector('span .price').getAttribute('content'); 
        let description = document.querySelector('.caracteristics .product-tabs:first-child .new-std').innerText;
        let items =  document.querySelectorAll('.main-container .owl-item img');
        let category = document.querySelector('.product-shop').getAttribute('data-category');
        items.forEach( (item) => {  
            imgs.push({ 
                url: item.getAttribute('content'),
            });  
        });   
        results.push({
            name: name,
            price: price,
            regular_price: price,
            description: description,
            images: imgs,
            categories: JSON.stringify(category)
            // imgs: JSON.stringify(imgs),
        });
         
        return results;
    });
    await browser.close();  
    let arrs = []; 
    let tempurl = urls[index][0].images;
    for(let val of tempurl) { 
        const options = {
            apiKey: img_apikey, // MANDATORY 
            imageUrl: val.url,    
          };  
          const imgresponse = await imgbbUploader(options)
          arrs.push({ 
            src: imgresponse.image.url,
            })
            
    }
    urls[index][0].images = JSON.stringify(arrs);
    response.push(urls[index]);
    index++;
    // saving catched data 
    // let sql = 'INSERT INTO products SET ?';
    // let _err = false;
    // let query = db.query(sql,urls[index], (err,result) => {
    //     if(err) {
    //         console.log(err);
    //         // res.status(200).jsonp({ status:false,message: 'Product already exist' })
    //     }  else{
    //         response.push({last_id:result.insertId})
    //         res.status(200).jsonp({ status:true,message: 'Data Inserted Successfully',last_id:result.insertId });
    //     }
    //     console.log(response);
    // });  
  }
  res
  .status(200)
  .json({ status:true,result:response });
//   res.send(urls); 
    
    
});
app.get('/test', async (req,res) => {
    res.send('hellow');
    // let sql = 'Select first_name,email from users';  
    // let _err = false;
    // let query = db.query(sql, (err,result) => {
    //     if(err) {
    //         console.log(err); 
    //         res.send(err);
    //     }  else{
    //         res.send(result);
    //     }
        
    // });  
});
app.get('/beinlive/today', async (req,res) => {
    var db = mysql.createConnection({
        host: db_host,
        user: db_username,
        password: db_password,
        database: 'beinlive'
    });

    const link = 'https://kooora4lives.com:2096/matches-today/';
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage(); 
    await page.goto(link,{waitUntil: 'load',timeout: 0});
    let tem = await page.evaluate(async () => {
        let results = []; 
        let array = [];  
        // let name = document.querySelector('.product-name h1').innerText; 
        // let price = document.querySelector('span .price').getAttribute('content'); 
        // let description = document.querySelector('.caracteristics .product-tabs:first-child .new-std').innerText;
        // let category = document.querySelector('.product-shop').getAttribute('data-category');
        let items =  document.querySelectorAll('.match-container');
        items.forEach( (item) => {  
            //convert time 
            const [time, modifier] = item.querySelector('#match-time').innerText.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') {
            hours = '00';
            }
            if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
            }
            let timetosave = `${hours}:${minutes}`;

            //push to array data
            array.push({ 
                first_team: item.querySelector('.left-team .team-name').innerText,
                second_team: item.querySelector('.right-team .team-name').innerText,
                first_team_icon: item.querySelector('.left-team .team-logo img').getAttribute("data-src"),
                second_team_icon: item.querySelector('.right-team .team-logo img').getAttribute('data-src'),
                events_time: timetosave,
                result: item.querySelector('#result').innerText,
                league: item.querySelector('li:first-child').innerText,
                channel: item.querySelector('li:nth-child(3)').innerText,
                commentator: item.querySelector('li:nth-child(2)').innerText,
            });  
        });   
        return array;
    });
    await browser.close();  
    //get uploaded image 
    // const options = {
    //   apiKey: img_apikey, // MANDATORY 
    //   imageUrl: tem[0].second_team_icon,    
    // };  
    // const imgresponse = await imgbbUploader(options);
    // tem[0].second_team_icon = imgresponse.image.url;

    // const options2 = {
    //     apiKey: img_apikey, // MANDATORY 
    //     imageUrl: tem[0].first_team_icon,    
    // };  
    // const imgresponse2 = await imgbbUploader(options2);
    // tem[0].first_team_icon = imgresponse2.image.url;
    let values=tem.reduce((o,a)=>{
            let ini=[];
            ini.push(a.first_team);
            ini.push(a.second_team);
            ini.push(a.first_team_icon);
            ini.push(a.second_team_icon);
            ini.push(a.events_time);
            ini.push(a.result);
            ini.push(a.league);
            ini.push(a.channel);
            ini.push(a.commentator);
            o.push(ini);
            return o
    },[])
    
    let sql = "INSERT INTO events (first_team,second_team,first_team_icon,second_team_icon,events_time,result,league,channel,commentator) VALUES ?";  
    let _err = false;
    let query = db.query(sql,[values],(err,result) => {
        if(err) {
            res.send(err);
        }  else{
            res.send(result);
        }
    });  

   
});
app.get('/beinlive/tomorrow', async (req,res) => {//res.send('hellow');
    var db = mysql.createConnection({
        host: db_host,
        user: db_username,
        password: db_password,
        database: 'beinlive'
    });

    const link = 'https://kooora4lives.com:2096/matches-tomorrow/';
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage(); 
    await page.goto(link,{waitUntil: 'load',timeout: 0});
    let tem = await page.evaluate(async () => {
        let results = []; 
        let array = [];  
        // let name = document.querySelector('.product-name h1').innerText; 
        // let price = document.querySelector('span .price').getAttribute('content'); 
        // let description = document.querySelector('.caracteristics .product-tabs:first-child .new-std').innerText;
        // let category = document.querySelector('.product-shop').getAttribute('data-category');
        let items =  document.querySelectorAll('.match-container');
        items.forEach( (item) => {  
            //convert time 
            const [time, modifier] = item.querySelector('#match-time').innerText.split(' ');
            let [hours, minutes] = time.split(':');
            if (hours === '12') {
            hours = '00';
            }
            if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
            }
            let timetosave = `${hours}:${minutes}`;
            console.log(5);
            //push to array data
            array.push({ 
                first_team: item.querySelector('.left-team .team-name').innerText,
                second_team: item.querySelector('.right-team .team-name').innerText,
                first_team_icon: item.querySelector('.left-team .team-logo img').getAttribute("data-src"),
                second_team_icon: item.querySelector('.right-team .team-logo img').getAttribute('data-src'),
                events_time: timetosave,
                result: item.querySelector('#result').innerText,
                league: item.querySelector('li:first-child').innerText,
                channel: item.querySelector('li:nth-child(3)').innerText,
                commentator: item.querySelector('li:nth-child(2)').innerText,
            });  
        });   
        return array;
    });
    await browser.close();  
    //get uploaded image 
    // const options = {
    //   apiKey: img_apikey, // MANDATORY 
    //   imageUrl: tem[0].second_team_icon,    
    // };  
    // const imgresponse = await imgbbUploader(options);
    // tem[0].second_team_icon = imgresponse.image.url;

    // const options2 = {
    //     apiKey: img_apikey, // MANDATORY 
    //     imageUrl: tem[0].first_team_icon,    
    // };  
    // const imgresponse2 = await imgbbUploader(options2);
    // tem[0].first_team_icon = imgresponse2.image.url;
    let values=tem.reduce((o,a)=>{
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            let ini=[];
            ini.push(a.first_team);
            ini.push(a.second_team);
            ini.push(a.first_team_icon);
            ini.push(a.second_team_icon);
            ini.push(a.events_time);
            ini.push(a.result);
            ini.push(a.league);
            ini.push(a.channel);
            ini.push(a.commentator);
            ini.push(tomorrow);
            o.push(ini);
            return o
    },[])
    
    let sql = "INSERT INTO events (first_team,second_team,first_team_icon,second_team_icon,events_time,result,league,channel,commentator,created_at) VALUES ?";  
    let _err = false;
    let query = db.query(sql,[values],(err,result) => {
        if(err) {
            res.send(err);
        }  else{
            res.send(result);
        }
    });  

   
});

// const convertTime12to24 = (time12h) => {
//     const [time, modifier] = time12h.split(' ');
  
//     let [hours, minutes] = time.split(':');
  
//     if (hours === '12') {
//       hours = '00';
//     }
  
//     if (modifier === 'PM') {
//       hours = parseInt(hours, 10) + 12;
//     }
  
//     return `${hours}:${minutes}`;
//   }
// var db = mysql.createConnection({
//     host: db_host,
//     user: db_username,
//     password: db_password,
//     database: 'test_project2'
// });
app.listen(process.env.PORT || port, () => {
    console.log('Starting...');
}) 
 