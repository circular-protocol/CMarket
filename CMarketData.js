/******************************************************************************* 

        CIRCULAR CIRX MARKET DATA LIBRARY
        License : Open Source for private and commercial use
                     
        CIRCULAR GLOBAL LEDGERS, INC. - USA
        
                     
        Version : 1.0.0
                     
        Creation: 8/30/2024
        
                  
        Originator: Gianluca De Novi, PhD
        Contributors: <names here>           
        
*******************************************************************************/

var CMarket = (function(){


/*
 * helper functionto use abbreviation for values K,M,B,T
 */
function numToAbbreviation(num) {
    if (num < 1000) return num.toFixed(2);
    const suffixes = ["", "K", "M", "B", "T"];
    const i = Math.floor(Math.log(num) / Math.log(1000));
    return (num / Math.pow(1000, i)).toFixed(2) + suffixes[i];
}


/*
 * fetch BitMart Exchange token and pair market data
 * 
 * token: Token Symbol
 * pair: pair token symbol
 * 
 * example 'BTC','USDT'
 */
  
async function getBitMartData(token, pair) {
    const URL_bitmart = `https://nag.circularlabs.io/CProxy.php?url=https://api-cloud.bitmart.com/spot/quotation/v3/ticker?symbol=${token.toUpperCase()}_${pair.toUpperCase()}`;

    try {
        const response = await fetch(URL_bitmart);

        if (response.ok) {
            const data = await response.json();
            const bitmartLast = parseFloat(data.data.last);
            const bitmartFluc = parseFloat(data.data.fluctuation) * 100.0; // Convert fluctuation to percentage
            const bitmartVolC = parseFloat(data.data.v_24h);
            const bitmartVolU = parseFloat(data.data.qv_24h);

            // Create and return the result object
            const result = {
                lastPrice: bitmartLast.toFixed(6),
                fluctuation: bitmartFluc.toFixed(3),
                volumeToken: bitmartVolC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                volumePair: bitmartVolU.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            };

            return result;
        } else {
            console.log(`BitMart HTTP error! Status: ${response.status}`);
            return null;
        }

    } catch (error) {
        console.log('Failed to fetch BitMart data:', error);
        return null;
    }
}




/*
 * fetch XT Exchange token and pair market data
 * 
 * token: Token Symbol
 * pair: pair token symbol
 * 
 * example 'BTC','USDT'
 */
 
async function getXTData(token, pair) {
    const URL_xt = `https://nag.circularlabs.io/CProxy.php?url=https://sapi.xt.com/v4/public/ticker/24h?symbol=${token.toLowerCase()}_${pair.toLowerCase()}`;

    try {
        const response = await fetch(URL_xt);

        if (response.ok) {
            const data = await response.json();
            const xtLast = parseFloat(data.result[0].c); // Assuming result is an array
            const xtFluc = parseFloat(data.result[0].cr) * 100.0; // Convert fluctuation to percentage
            const xtVolC = parseFloat(data.result[0].q);
            const xtVolU = parseFloat(data.result[0].v);

            // Create and return the result object
            const result = {
                lastPrice: xtLast.toFixed(6),
                fluctuation: xtFluc.toFixed(3),
                volumeToken: xtVolC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                volumePair: xtVolU.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            };

            return result;
        } else {
            console.log(`XT HTTP error! Status: ${response.status}`);
            return null;
        }

    } catch (error) {
        console.log('Failed to fetch XT data:', error);
        return null;
    }
}



/*
 * fetch LBank Exchange token and pair market data
 * 
 * token: Token Symbol
 * pair: pair token symbol
 * 
 * example 'BTC','USDT'
 */
 
async function getLBankData(token, pair) {
    const URL_lbank = `https://nag.circularlabs.io/CProxy.php?url=https://api.lbkex.com/v2/ticker.do?symbol=${token.toLowerCase()}_${pair.toLowerCase()}`;

    try {
        const response = await fetch(URL_lbank);

        if (response.ok) {
            const data = await response.json();
            const lbankTicker = data.data[0].ticker;
            const lbankLast = parseFloat(lbankTicker.latest);
            const lbankFluc = parseFloat(lbankTicker.change) * 100.0; // Convert fluctuation to percentage
            const lbankVolC = parseFloat(lbankTicker.vol);
            const lbankVolU = parseFloat(lbankTicker.turnover);

            // Create and return the result object
            const result = {
                lastPrice: lbankLast.toFixed(6),
                fluctuation: lbankFluc.toFixed(3),
                volumeToken: lbankVolC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                volumePair: lbankVolU.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            };

            return result;
        } else {
            console.log(`LBank HTTP error! Status: ${response.status}`);
            return null;
        }

    } catch (error) {
        console.log('Failed to fetch LBank data:', error);
        return null;
    }
}


/*
 * fetch token and pair market data from all exchanges
 * 
 * token: Token Symbol
 * pair: pair token symbol
 * 
 * example 'BTC','USDT'
 */ 

async function getMarketData(token, pair) {
    var URL_Circul  = `https://nag.circularlabs.io/CProxy.php?url=https://nag.circularlabs.io/GetCirculatingSupply.php?Asset=CIRX`;
    var URL_bitmart = `https://nag.circularlabs.io/CProxy.php?url=https://api-cloud.bitmart.com/spot/quotation/v3/ticker?symbol=${token.toUpperCase()}_${pair.toUpperCase()}`;
    var URL_xt      = `https://nag.circularlabs.io/CProxy.php?url=https://sapi.xt.com/v4/public/ticker/24h?symbol=${token.toLowerCase()}_${pair.toLowerCase()}`;
    var URL_lbank   = `https://nag.circularlabs.io/CProxy.php?url=https://api.lbkex.com/v2/ticker.do?symbol=${token.toLowerCase()}_${pair.toLowerCase()}`;

    // Initialize variables to store the cumulative data
    let totalLast = 0;
    let totalFluc = 0;
    let totalVolC = 0;
    let totalVolU = 0;
    let count = 0;
    let circSupply = 0;

    try {
    
        // Fetch data from all APIs concurrently
        const [circulatingSupply, bitmartResponse, xtResponse, lbankResponse] = await Promise.all([
            fetch(URL_Circul),
            fetch(URL_bitmart),
            fetch(URL_xt),
            fetch(URL_lbank)
        ]);

        // Handle Circular response
        if (circulatingSupply.ok) {
          const CircularData = await circulatingSupply.json();

          circSupply = parseFloat(CircularData);
        }
        else
        {
          console.log(`Circulating Supply Error: ${JSON.stringify(CircularData)}`);
        }
        
        // Handle BitMart response
        if (bitmartResponse.ok) {
            const bitmartData = await bitmartResponse.json();
            if (bitmartData.data) {
                const bitmartLast = parseFloat(bitmartData.data.last);
                const bitmartFluc = parseFloat(bitmartData.data.fluctuation) * 100.0; // Convert fluctuation to percentage
                const bitmartVolC = parseFloat(bitmartData.data.v_24h);
                const bitmartVolU = parseFloat(bitmartData.data.qv_24h);

                totalLast += bitmartLast || 0;
                totalFluc += bitmartFluc || 0;
                totalVolC += bitmartVolC || 0;
                totalVolU += bitmartVolU || 0;
                count++;
                /**/
            } else {
                console.log(`Unexpected BitMart data format: ${JSON.stringify(bitmartData)}`);
            }
        } else {
            console.log(`BitMart HTTP error! Status: ${bitmartResponse.status}`);
        }

        // Handle XT response
        if (xtResponse.ok) {
            const xtData = await xtResponse.json();
            if (xtData.result && xtData.result[0]) {
                const xtLast = parseFloat(xtData.result[0].c); // Assuming result is an array
                const xtFluc = parseFloat(xtData.result[0].cr) * 100.0; // Convert fluctuation to percentage
                const xtVolC = parseFloat(xtData.result[0].q);
                const xtVolU = parseFloat(xtData.result[0].v);

                totalLast += xtLast || 0;
                totalFluc += xtFluc || 0;
                totalVolC += xtVolC || 0;
                totalVolU += xtVolU || 0;
                count++;
                /**/
            } else {
                console.log(`Unexpected XT data format: ${JSON.stringify(xtData)}`);
            }
        } else {
            console.log(`XT HTTP error! Status: ${xtResponse.status}`);
        }

        // Handle LBank response
        if (lbankResponse.ok) {
            const lbankData = await lbankResponse.json();
            if (lbankData.data && lbankData.data[0] && lbankData.data[0].ticker) {
                const lbankTicker = lbankData.data[0].ticker;
                const lbankLast = parseFloat(lbankTicker.latest);
                const lbankFluc = parseFloat(lbankTicker.change) * 100.0; // Convert fluctuation to percentage
                const lbankVolC = parseFloat(lbankTicker.vol);
                const lbankVolU = parseFloat(lbankTicker.turnover);

                totalLast += lbankLast || 0;
                totalFluc += (lbankFluc/100) || 0;
                totalVolC += lbankVolC || 0;
                totalVolU += lbankVolU || 0;
                count++;
            } else {
                console.log(`Unexpected LBank data format: ${JSON.stringify(lbankData)}`);
            }
        } else {
            console.log(`LBank HTTP error! Status: ${lbankResponse.status}`);
        }

        // Ensure at least one valid response was processed
        if (count === 0) {
            throw new Error('No valid data fetched from any of the exchanges.');
        }

        // Calculate averages
        const averageLast = (totalLast / count).toFixed(6);
        const averageFluc = (totalFluc / count).toFixed(3);

        // Sum of volumes
        const totalFormattedVolC = totalVolC.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const totalFormattedVolU = totalVolU.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Create the result object
        const result = {
            circulatingSupply: circSupply,
            averagePrice: averageLast,
            averageFluctuation: averageFluc,
            totalVolumeCIRX: totalFormattedVolC,
            totalVolumeUSDT: totalFormattedVolU
        };

        return result;

    } catch (error) {
        console.log('Failed to fetch the market data:', error);
        return null;
    }
}



/*
 * Periodically fetch market data at a given interval
 * 
 * token: Token Symbol
 * pair: pair token symbol
 * interval: Interval in milliseconds
 * callback: Function to call with the fetched data
 * 
 * example:  Start fetching market data every 5 seconds (5000 milliseconds)
 * 
 * CMarket.fetchMarketDataPeriodically('BTC', 'USDT', 5000, handleMarketData);
 */
 
function StartFetching(token, pair, interval, callback) {
    // Start the interval
    const intervalId = setInterval(async () => {
        try {
            // Fetch the market data
            const result = await getMarketData(token, pair);
            // Call the provided callback with the result
            callback(result);
        } catch (error) {
            console.log('Error fetching market data:', error);
        }
    }, interval);
}


/*
 * Stop the periodic fetching of market data
 * 
 * example: Stop fetching after 20 seconds
 * 
 * setTimeout(() => {CMarket.stopFetchingMarketData();}, 20000);
 */
function stopFetching() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        console.log('Stopped fetching market data.');
    } else {
        console.log('No ongoing market data fetching to stop.');
    }
}


return {
           numToAbbreviation : numToAbbreviation,
              getBitMartData : getBitMartData,
                   getXTData : getXTData,
                getLBankData : getLBankData,
               getMarketData : getMarketData,
               StartFetching : StartFetching, 
                stopFetching : stopFetching
  };  
})();
