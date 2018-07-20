const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const npmWebsitePrefix = 'https://www.npmjs.com/package';

// fs.statSync('./formattedPackage.txt', function(err, stat) {
//     if (err) {
//         console.log('file not present');
//     } else {
        
//     }
// });
if (fs.existsSync('./formattedPackage.txt')) {
    fs.unlinkSync('./formattedPackage.txt');
}

if (fs.existsSync('./packageWithLicenses.txt')) {
    fs.unlinkSync('./packageWithLicenses.txt');
}

// fs.statSync('./packageWithLicenses.txt', function(err, stat) {
//     if (err) {
//         console.log('file not present');
//     } else {
        
//     }
// });

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
            packageList.forEach(function(package) {
                const url = `${npmWebsitePrefix}/${package.replace(/\\n/g,'')}`;
                request(url, function(err, response, html) {
                    if(err) {
                        console.log('Error requesting site, ', url);
                    } else {
                        const $ = cheerio.load(html);
                        const license = $('h3').filter(function() {
                            return $(this).text().trim() === 'license';
                        }).next().text();
                        fs.appendFileSync('./packageWithLicenses.txt', `${package.replace(/\\n/g,'')} - ${license}\n`, 'utf8', function(err) {
                            if (err) {
                                console.log('couldnt write to file');
                            }
                        });
                    }
                });
            });
        }
    });
});
process.nextTick(function() {
    
});

