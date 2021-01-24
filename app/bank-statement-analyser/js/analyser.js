
const ExcelJS = require('exceljs');
const bankDetails = require('./bank-details');

exports.bankStatementAnalyser = new function(){

    const convertToNum = function(numStr){
        var patt = /[^0-9\.]+/g;
        return numStr.toString().replace(patt,"");
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

        return new Promise(async (resolve,reject)=>{
            let workbook = new ExcelJS.Workbook(); 
            await workbook.xlsx.readFile(filePath);
            
            let worksheet = workbook.getWorksheet(1);
            
            let rowValues = [];
            worksheet.getRows(0,worksheet.rowCount+1).forEach(row=>{ rowValues.push(row.values)});
            resolve(rowValues);
        });
        
    }

    const processDescription = function(description){

        let regex = /[0-9/\-:\s]+/g;
        let tempStr = description.toString().replace(regex,"");
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
        let currentGroupCreditTransaction, currentGroupDebitTransaction;
        let openingBalance, closingBalance, receiptTotalAmount=0, paymentTotalAmount=0;

        let groupTransactions = {};

        let groupDetails = {
            payments : {},
            receipts : {}
        }
        transactionData.forEach(transRecord => {
            if( transRecord[bankDataColumnIndexes.debit]!=null && typeof transRecord[bankDataColumnIndexes.debit] != 'number' ){
                transRecord[bankDataColumnIndexes.debit] = +convertToNum(transRecord[bankDataColumnIndexes.debit]);
            }
            if( transRecord[bankDataColumnIndexes.credit]!=null &&  typeof transRecord[bankDataColumnIndexes.credit] != 'number' ){
                transRecord[bankDataColumnIndexes.credit] = +convertToNum(transRecord[bankDataColumnIndexes.credit]);
            }
        });

        transactionData = transactionData.filter((transRecord)=>
            (
                transRecord[bankDataColumnIndexes.description]!=null 
                && ( !isNaN(transRecord[bankDataColumnIndexes.debit]) || transRecord[bankDataColumnIndexes.debit]==undefined ) 
                && ( !isNaN(transRecord[bankDataColumnIndexes.credit]) || transRecord[bankDataColumnIndexes.credit]==undefined ) 
                && transRecord[bankDataColumnIndexes.balance]!=null 
                && transRecord[bankDataColumnIndexes.date]!=null 
            ));

        openingBalance = transactionData[0][bankDataColumnIndexes.balance];
        closingBalance = transactionData[transactionData.length-1][bankDataColumnIndexes.balance];

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
            receiptTotalAmount += creditAmount;
            paymentTotalAmount += debitAmount;

            if( debitAmount>0 ){
                groupDetails.payments[transactionGroupMappingID] = {
                    amount : debitAmount,
                    totalTransactions : currentGroupDebitTransaction.length,
                    particular : keyword
                };
                groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                ++transactionGroupMappingID;
            } 
            if( creditAmount>0 ){
                groupDetails.receipts[transactionGroupMappingID] = {
                    amount : creditAmount,
                    totalTransactions : currentGroupCreditTransaction.length,
                    particular : keyword
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

            debitAmount = curRecord[debitColInd]!=null?curRecord[debitColInd]:0;
            creditAmount = curRecord[creditColInd]!=null?curRecord[creditColInd]:0;
            currentGroupCreditTransaction = [];
            currentGroupDebitTransaction = [];

            if( debitAmount>0 ){
                currentGroupDebitTransaction.push(curRecord)
            }else{
                currentGroupCreditTransaction.push(curRecord);
            }

            
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

            receiptTotalAmount += creditAmount;
            paymentTotalAmount += debitAmount;

            if( debitAmount>0 ){
                groupDetails.payments[transactionGroupMappingID] = {
                    amount : debitAmount,
                    totalTransactions : currentGroupDebitTransaction.length,
                    particular : curRecDesc
                };
                groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                ++transactionGroupMappingID;
            }else if( creditAmount>0 ){
                groupDetails.receipts[transactionGroupMappingID] = {
                    amount : creditAmount,
                    totalTransactions : currentGroupCreditTransaction.length,
                    particular : curRecDesc
                }
                groupTransactions[transactionGroupMappingID] = currentGroupCreditTransaction;
                ++transactionGroupMappingID;
            }
            
        }

        return {
            amountDetails : {
                openingBalance : openingBalance,
                closingBalance : closingBalance,
                receiptTotalAmount : receiptTotalAmount,
                paymentTotalAmount : paymentTotalAmount
            },
            groupDetails : groupDetails,
            groupTransactions : groupTransactions
        };

    }

    

    this.anaylseFile = function(filePath,bankType){
        return new Promise((resolve,reject)=>{
            getFileContent(filePath).then(function(rows){
                let records = rows;

                let headersIndex = getHeaderRowIndex(records,bankType);
                if( headersIndex===-1){
                    console.error("unable to identify headers.");
                    return;
                }
                records.splice(0,headersIndex+1);

                let consolidationData = analyseTransactionData(records,bankType);

                resolve(consolidationData);

            }).catch(function(error){
                reject(error);
            });
        })
        
        
        
    }
}