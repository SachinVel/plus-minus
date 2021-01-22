const xlsxFile = require('read-excel-file/node');
const bankDetails = require('./bank-details');
const ExcelJS = require('exceljs');

exports.bankStatementAnalyser = new function(){
    
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
        let totalRecords;
        let debitAmount,creditAmount;
        let transactionGroupMappingID=1;
        let currentGroupCreditTransaction, currentGroupDebitTransaction;;

        let groupTransactions = {};

        let groupDetails = {
            payments : {},
            receipts : {}
        }

        // extract common keywords data
        
        for( let keyword of bankStmtCommonWords ){
            currentGroupCreditTransaction = [];
            currentGroupDebitTransaction = [];
            debitAmount = 0;
            creditAmount = 0;
            totalRecords = transactionData.length;
            for( let ind=0 ; ind<totalRecords ; ++ind ){
                let transRecord = transactionData.shift();
                if( transRecord[descColInd]==null ){
                    continue;
                }
                let processedDesc = processDescription(transRecord[descColInd]);
                if( processedDesc.includes(keyword) ){
                    if( transRecord[creditColInd] ){
                        creditAmount += transRecord[creditColInd];
                        currentGroupCreditTransaction.push(transRecord);
                    }else if( transRecord[debitColInd] ){
                        debitAmount += transRecord[debitColInd];
                        currentGroupDebitTransaction.push(transRecord);
                    }
                }else{
                    transactionData.push(transRecord);
                }
            }

            if( debitAmount>0 ){
                groupDetails.payments[keyword] = {
                    amount : debitAmount,
                    totalTransactions : currentGroupDebitTransaction.length,
                    mappingId : transactionGroupMappingID
                };
                groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                ++transactionGroupMappingID;
            }else if( creditAmount>0 ){
                groupDetails.receipts[keyword] = {
                    amount : creditAmount,
                    totalTransactions : currentGroupCreditTransaction.length,
                    mappingId : transactionGroupMappingID
                }
                groupTransactions[transactionGroupMappingID] = currentGroupCreditTransaction;
                ++transactionGroupMappingID;
            }
        }

        // extract dynamic transaction
        while( transactionData.length>0 ){
            let curRecord = transactionData.shift();
            if( curRecord[descColInd]==null ){
                continue;
            }
            let curRecDesc = processDescription(curRecord[descColInd]);
            debitAmount = 0;
            creditAmount = 0;
            currentGroupCreditTransaction = [];
            currentGroupDebitTransaction = [];
            totalRecords = transactionData.length;
            for( let ind=0 ; ind<totalRecords ; ++ind ){
                let transRecord = transactionData.shift();
                if( transRecord[descColInd]==null ){
                    continue;
                }
                let processedDesc = processDescription(transRecord[descColInd]);
                if( processedDesc.includes(curRecDesc) ){
                    if( transRecord[creditColInd] ){
                        creditAmount += transRecord[creditColInd];
                        currentGroupCreditTransaction.push(transRecord);
                    }
                    if( transRecord[debitColInd] ){
                        debitAmount += transRecord[debitColInd];
                        currentGroupDebitTransaction.push(transRecord);
                    }
                }else{
                    transactionData.push(transRecord);
                }
            }   

            if( debitAmount>0 ){
                groupDetails.payments[curRecDesc] = {
                    amount : debitAmount,
                    totalTransactions : currentGroupDebitTransaction.length,
                    mappingId : transactionGroupMappingID
                };
                groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                ++transactionGroupMappingID;
            }else if( creditAmount>0 ){
                groupDetails.receipts[curRecDesc] = {
                    amount : creditAmount,
                    totalTransactions : currentGroupCreditTransaction.length,
                    mappingId : transactionGroupMappingID
                }
                groupTransactions[transactionGroupMappingID] = currentGroupCreditTransaction;
                ++transactionGroupMappingID;
            }
            
        }

        console.log(" groupDetails : ",groupDetails);

        return {
            groupDetails : groupDetails,
            groupTransactions : groupTransactions
        };

    }

    

    this.anaylseFile = function(filePath,bankType){
        return new Promise((resolve,reject)=>{
            getFileContent(filePath).then(function(rows){
                let records = rows;

                console.log("before transaction data : ",records);
                let headersIndex = getHeaderRowIndex(records,bankType);
                if( headersIndex===-1){
                    console.error("unable to identify headers.");
                    return;
                }
                records.splice(0,headersIndex+1);
                console.log("after transaction data : ",records);

                let consolidationData = analyseTransactionData(records,bankType);

                resolve(consolidationData);

                // writeToFile(consolidationData);

            }).catch(function(error){
                reject(error);
            });
        })
        
        
        
    }
}