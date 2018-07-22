const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const excel = require('excel4node');

const npmWebsitePrefix = 'https://www.npmjs.com/package';
const  workbook = new excel.Workbook();
const worksheet = workbook.addWorksheet('Libraries');

if (fs.existsSync('./formattedPackage.txt')) {
    fs.unlinkSync('./formattedPackage.txt');
}

if (fs.existsSync('./packageWithLicenses.txt')) {
    fs.unlinkSync('./packageWithLicenses.txt');
}

// format packages.txt
fs.readFile('./packages.txt', 'utf8', function(err, data) {
    if (err) {
        console.log(err);
    }
    const packageArray = data.split('\n')
    packageArray.forEach(function(package) {
        if (package && package.length) {
            const packageName = package.split(":")[0].replace(/\"/g, '');
            fs.appendFileSync('./formattedPackage.txt', `${packageName}\n`, 'utf8', function(err) {
                if (err) {
                    console.log('couldnt write to file');
                }
            });
        }
    });
    fs.readFile('./formattedPackage.txt', 'utf8', function(err, data) {
        if (err) {
            console.log('Failed to read from formatted package', err);
        } else {
            const packagesWithLicenses = [];
            const packageList = data.split('\n');
            packageList.forEach(function(package, index) {
                const url = `${npmWebsitePrefix}/${package.replace(/\\n/g,'')}`;
                request(url, function(err, response, html) {
                    if(err) {
                        console.log('Error requesting site, ', url);
                    } else {
                        const $ = cheerio.load(html);
                        const license = $('h3').filter(function() {
                            return $(this).text().trim() === 'license';
                        }).next().text();
                        console.log('writing to excel');
                        worksheet.cell(index + 1,1).string(package.replace(/\\n/g,''));
                        worksheet.cell(index + 1,2).string(license);
                        fs.appendFileSync('./packageWithLicenses.txt', `${package.replace(/\\n/g,'')} - ${license}\n`, 'utf8', function(err) {
                            if (err) {
                                console.log('couldnt write to file');
                            }
                        });
                    }
                });
                workbook.write("Excel.xlsx");
            });
        }
    });
});

