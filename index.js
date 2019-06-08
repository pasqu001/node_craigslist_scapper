const request = require('request-promise');
const cheerio = require('cheerio');

const url = 'https://miami.craigslist.org/d/web-html-info-design/search/web';

const scrapeSample = {
    title: 'Name of the listed job advertisment',
    description: 'description of the job',
    datePosted: new Date('2019-06-06'), 
    url: '',
    hood: 'South Florida',
    address: "job location like 700 w hilsboro blvd",
    compensation : '50,000'
}
const scrapeResults =[];

async function scrapeJobHeader() {
    try {
        const htmlResult = await request.get(url);
        //console.log(htmlResult);
        const $ = await cheerio.load(htmlResult);

        $('.result-info').each((index, element) => {
            
            const resultTitle = $(element).children('.result-title');
            const title =  resultTitle.text();
            const url = resultTitle.attr('href');
            const datePosted = new Date(
                $(element)
                    .children("time")
                    .attr("datetime")
                );
            const hood = $(element).find(".result-hood").text();    
            const scrapeResult = {title, url, datePosted, hood};
            scrapeResults.push(scrapeResult);
            });

            return scrapeResults;
    }catch(err){
        console.error(err);
    }
}

async function scrapeDescription(jobsWithHeaders){
    return await Promise.all(jobsWithHeaders.map( async (job) => {
        try{
        const htmlResult = await request.get(job.url);
        const $ = await cheerio.load(htmlResult);
        $(".print-qrcode-container").remove();
        job.description = $('#postingbody').text();
        job.address = $('div.mapaddress').text();
        const compensationText = $('.attrgroup').children().first().text();
        job.compensation = compensationText.replace('compensation: ', "");

        return job;
        } catch(error){
            console.error(error);
        }
        })
    );
}

async function scrapeCraigslist(){
    const jobsWithHeaders = await scrapeJobHeader();
    const jobsFullData = await scrapeDescription(jobsWithHeaders);
    console.log(jobsFullData.length);
}

scrapeCraigslist();