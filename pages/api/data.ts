// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import client from '../../libs/client'

// 크롤링
import axios from 'axios';
import { execPath } from 'process';
const cheerio = require('cheerio');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const nameEngList = [];
  const brandList = [];
  const nameKrList = [];
  const imgList =[];
  const pricelist =[];
  const quickdlivery = [];
  
  const getHtml = async () => {
    try {
      // return await axios.get('https://kream.co.kr/brands/acne%20studios');
      // return await axios.get('https://kream.co.kr/brands/Moncler');
      // return await axios.get('https://kream.co.kr/brands/Apple');
      // return await axios.get('https://kream.co.kr/brands/Prada');
      // return await axios.get('https://kream.co.kr/brands/Louis%20Vuitton');
      // return await axios.get('https://kream.co.kr/brands/Rolex');
      // return await axios.get('https://kream.co.kr/brands/Celine');

    } catch (error) {
      console.error(error);
    }
  };


  await getHtml()
  .then((html) => {
    // axios 응답 스키마 `data`는 서버가 제공한 응답(데이터)을 받는다.
    // load()는 인자로 html 문자열을 받아 cheerio 객체 반환
    // console.log(html)
    const $ = cheerio.load(html.data);
    
    const bodyList = $('#__layout > div > div:nth-child(2) > div > div.brand_feed_wrap > div.brand_feed_content > div.search_content > div:nth-child(2) > div > div.brand_products ').filter((i,e)=>{

      
      let price = $(e).find('div.amount').text().trimStart().split('  ')
      for(let i = 0 ; i < price.length ; i++){
        pricelist.push(parseInt(price[i].replace(/원/g, '').replace(/,/g,'').replace(/-/g,'0')))
      }
      
      // const makerlist = String($(e).find('p.brand').text().trimStart()).replace(/sA/g, 's,A').split(',') // 40 
      // div.product_info > div.badge.badge_product.shipping_express
      
      String($(e).find('div.product_info').each((i,e)=>{
        quickdlivery.push(!!$(e).find('div.badge.badge_product.shipping_express').text())
      })) // 40

      String($(e).find('div.title').each((i,e)=>{
        brandList.push($(e).find('p.brand').text());
        nameKrList.push($(e).find('p.translated_name').text());
        nameEngList.push($(e).find('p.name').text());
      })) // 40

      const img= String($(e).find('picture').children('img'))
      const imglist = img.split('><');
      for(let imgs of imglist){
        let startIndex = imgs.indexOf('http') ;
        let endIndex = imgs.indexOf('class')-2;
        imgList.push(imgs.slice(startIndex,endIndex))
      }
    })
    
  })
  .then((res) => console.log('res'));


  
  try {

    
    // console.log(nameEngList,brandList,nameKrList,imgList,pricelist,quickdlivery)
    // 객체 생성 후 db insert
    for(let i = 0 ; i < nameKrList.length ; i++){
      const result = await client.product.create({
        data:{
          "price": pricelist[i],
          "nameEng":String(nameEngList[i]),
          "brand": String(brandList[i]),
          "nameKr": String(nameKrList[i]),
          "imgUrl": String(imgList[i]),
          'quickdlivery': quickdlivery[i]
      }})
      console.log(result);
    }
    console.log('끝')
res.status(200).send('후잉')
  } catch (error) {
    console.log(error)
  }
    
}
