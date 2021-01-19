const xlsxFile = require('read-excel-file/node');
const bankDetails = require('./bank-details');

exports.bankStatementAnalyser = new function(){
    let bankType = {
        canara : "canara"
    }
    
    const checkHeadersInBankStatement = function(row,bankTye){
        let bankHeaders = bankDetails.bankStatementHeaders[bankTye];
        let isHeadersMatch = true;
        let headersInd=0;
        for( let ind=0 ; ind<row.length ; ++ind){
            if( row[ind]==null ){
                continue;
            }
            if( headersInd==6 ){
                break;
            }
            if( row[ind] instanceof String && row[ind].trim()!=bankHeaders[headersInd] ){
                isHeadersMatch = false;
                break;
            }
            ++headersInd;
        };
        if( isHeadersMatch && headersInd==6 ){
            return isHeadersMatch;
        }

    }

    const getHeaderRowIndex = function(records,bankName){
        let headersIndex=-1;
        for(let index=0 ; index<records.length ; ++index ){
            let row = records[index];
            if( checkHeadersInBankStatement(row,bankName) ){
                headersIndex = index;
                break;
            }
        };
        return headersIndex;
    }

    const getFileContent = function(filePath){
        return new Promise((resolve,reject)=>{
            xlsxFile(filePath).then((rows) => {
                resolve(rows);
            }).catch(error=>{
                reject(error);
            });
        });
    }

    const processDescription = function(description){

        let regex = /[0-9/\-:\s]+/g;
        let tempStr = description.replace(regex,"");
        tempStr = tempStr.toLowerCase()
        tempStr = tempStr.trim();
        return tempStr.toLowerCase();

    }
    

    const analyseTransactionData = function(transactionData,bankName){

        let bankDataColumnIndexes = bankDetails.bankDataColumnIndexes[bankName];
        let bankStmtCommonWords = bankDetails.bankStatementKeywords;

        let descColInd =  bankDataColumnIndexes.description;
        let creditColInd = bankDataColumnIndexes.credit;
        let debitColInd = bankDataColumnIndexes.debit;

        let result = {
            payments : {},
            receipts : {}
        }

        let safeTransData = transactionData ; 

        // extract common keywords data
        
        for( let keyword of bankStmtCommonWords ){
            let netAmount = 0;
            transactionData = safeTransData;
            for( let ind=0 ; ind<transactionData.length ; ++ind ){
                let transRecord = transactionData[ind];
                if( transRecord[descColInd]==null ){
                    continue;
                }
                let processedDesc = processDescription(transRecord[descColInd]);
                if( processedDesc.includes(keyword) ){
                    if( transRecord[creditColInd] ){
                        netAmount += transRecord[creditColInd];
                    }
                    if( transRecord[debitColInd] ){
                        netAmount -= transRecord[debitColInd];
                    }
                    safeTransData.splice(ind,1);
                }
            }

            if( netAmount<0 ){
                result.payments[keyword] = Math.abs(netAmount);
            }else if( netAmount>0 ){
                result.receipts[keyword] = Math.abs(netAmount);
            }
        }

        transactionData = safeTransData;

        // extract dynamic transaction
        while( transactionData.length>0 ){
            let curRecord = transactionData.shift();
            if( curRecord[descColInd]==null ){
                continue;
            }
            let curRecDesc = processDescription(curRecord[descColInd]);
            let netAmount = 0;
            for( let ind=0 ; ind<transactionData.length ; ++ind ){
                let transRecord = transactionData[ind];
                if( transRecord[descColInd]==null ){
                    continue;
                }
                let processedDesc = processDescription(transRecord[descColInd]);
                if( processedDesc.includes(curRecDesc) ){
                    if( transRecord[creditColInd] ){
                        netAmount += transRecord[creditColInd];
                    }
                    if( transRecord[debitColInd] ){
                        netAmount -= transRecord[debitColInd];
                    }
                    safeTransData.splice(ind,1);
                } 
            }   

            if( netAmount<0 ){
                result.payments[curRecDesc] = Math.abs(netAmount);
            }else if( netAmount>0 ){
                result.receipts[curRecDesc] = Math.abs(netAmount);
            }

            transactionData = safeTransData;
            
        }

        console.log(" result : ",result);

    }

    this.anaylseFile = function(filePath){
        
        getFileContent(filePath).then(function(rows){
            let records = rows;
            let bankName = bankType.canara;
            console.log("before transaction data : ",records);
            let headersIndex = getHeaderRowIndex(records,bankName);
            if( headersIndex===-1){
                console.error("unable to indentify headers.");
                return;
            }
            records.splice(0,headersIndex+1);
            console.log("after transaction data : ",records);

            analyseTransactionData(records,bankName);

        }).catch(function(error){
            console.error("Error while finding headers : ",error);
        });
        
    }
}