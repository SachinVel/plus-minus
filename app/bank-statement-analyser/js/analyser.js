
const ExcelJS = require('exceljs');
const bankDetails = require('./bank-details');

exports.bankStatementAnalyser = new function(){

    const convertToNum = function(numStr){
        var patt = /[^0-9\.]+/g;
        return numStr.toString().replace(patt,"");
    }
    
    // const checkHeadersInBankStatement = function(row,bankTye){
    //     let bankHeaders = bankDetails.bankStatementHeaders[bankTye];
    //     let isHeadersMatch = true;
    //     let headersInd=0;
    //     for( let ind=0 ; ind<row.length ; ++ind){
    //         if( row[ind]==null ){
    //             continue;
    //         }
    //         if( headersInd==6 ){
    //             break;
    //         }
    //         if( row[ind] instanceof String && row[ind].trim()!=bankHeaders[headersInd] ){
    //             isHeadersMatch = false;
    //             break;
    //         }
    //         ++headersInd;
    //     };
    //     if( isHeadersMatch && headersInd==6 ){
    //         return isHeadersMatch;
    //     }

    // }

    // const getHeaderRowIndex = function(records,columnInfo){
    //     let headersIndex=-1;
    //     let rowInd = /[0-9]+/.exec(columnInfo.)
    //     for(let index=0 ; index<records.length ; ++index ){
    //         let row = records[index];
    //         if( checkHeadersInBankStatement(row,bankName) ){
    //             headersIndex = index;
    //             break;
    //         }
    //     };
    //     return headersIndex;
    // }

    // const getFileContent = function(filePath){

    //     return new Promise(async (resolve,reject)=>{
    //         let workbook = new ExcelJS.Workbook(); 
    //         await workbook.xlsx.readFile(filePath);
            
    //         let worksheet = workbook.getWorksheet(1);
            
    //         let rowValues = [];
    //         worksheet.getRows(0,worksheet.rowCount+1).forEach(row=>{ rowValues.push(row.values)});
    //         resolve(rowValues);
    //     });
        
    // }

    const processDescription = function(description){

        let regex = /[0-9/\-:\s]+/g;
        let tempStr = description.toString().replace(regex,"");
        tempStr = tempStr.toLowerCase()
        tempStr = tempStr.trim();
        return tempStr.toLowerCase();

    }

    const getColumnIndices = function(columnInfo){
        
        let colIdRegex = /[A-Z]+/g;

        console.log("colIdRegex : ",colIdRegex.exec(columnInfo.dateCellId));

        let descriptionColId = /[A-Z]+/g.exec(columnInfo.descCellId)[0];
        let descColInd = +descriptionColId.charCodeAt(0)-'A'.charCodeAt(0)+1;

        let dateColId = /[A-Z]+/g.exec(columnInfo.dateCellId)[0];
        let dateColInd = +dateColId.charCodeAt(0)-'A'.charCodeAt(0)+1;

        let creditColId = /[A-Z]+/g.exec(columnInfo.credtiCellId)[0];
        let creditColInd = +creditColId.charCodeAt(0)-'A'.charCodeAt(0)+1;

        let debitColId = /[A-Z]+/g.exec(columnInfo.debitCellId)[0];
        let debitColInd = +debitColId.charCodeAt(0)-'A'.charCodeAt(0)+1;

        let balanceColId = /[A-Z]+/g.exec(columnInfo.balanceCellId)[0];
        let balanceColInd = +balanceColId.charCodeAt(0)-'A'.charCodeAt(0)+1;

        return {
            description : descColInd,
            credit: creditColInd,
            debit : debitColInd,
            date : dateColInd,
            balance : balanceColInd
        }

    }
    

    const analyseTransactionData = function(transactionData,bankDataColumnIndexes){

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
                let isKeywordMatch = false;
                switch( keyword.condition ){
                    case "contains":
                        isKeywordMatch =  processedDesc.includes(keyword.name)?true:false; 
                        break;
                    case "startsWith":
                        isKeywordMatch =  processedDesc.indexOf(keyword.name)==0?true:false; 
                        break;
                    default:
                        isKeywordMatch =  processedDesc.includes(keyword.name)?true:false; 
                }
                if( isKeywordMatch ){
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
                    particular : keyword.name
                };
                groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                ++transactionGroupMappingID;
            } 
            if( creditAmount>0 ){
                groupDetails.receipts[transactionGroupMappingID] = {
                    amount : creditAmount,
                    totalTransactions : currentGroupCreditTransaction.length,
                    particular : keyword.name
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

    

    this.anaylseContent = function(rows,columnInfo){

        return new Promise((resolve,reject)=>{

            let headersIndex = +/[0-9]+/g.exec(columnInfo.descCellId)[0];
            rows.splice(0,headersIndex+1);

            let bankDataColumnIndexes = getColumnIndices(columnInfo);

            let consolidationData = analyseTransactionData(rows,bankDataColumnIndexes);

            consolidationData.bankDataColumnIndexes = bankDataColumnIndexes;

            resolve(consolidationData);
        });
        
    }
}