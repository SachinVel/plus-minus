const bankStatementKeywords = require('../../constants/bank-details');

const bankStatementAnalyser = new function () {

    const processDescription = function (description) {

        let regex = /[0-9/\-:\s]+/g;
        let tempStr = description.toString().replace(regex, '');
        tempStr = tempStr.toLowerCase()
        tempStr = tempStr.trim();
        return tempStr.toLowerCase();

    }

    const convertExcelDateToString = function(serial) {
        var utc_days = Math.floor(serial - 25569);
        var utc_value = utc_days * 86400;
        var date_info = new Date(utc_value * 1000);

        var fractional_day = serial - Math.floor(serial) + 0.0000001;

        var total_seconds = Math.floor(86400 * fractional_day);

        var seconds = total_seconds % 60;

        total_seconds -= seconds;

        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;

        return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds).toDateString();
    }


    const analyseTransactionData = function (transactionData, bankDataColumnIndexes) {
        let descColInd = bankDataColumnIndexes.description;
        let creditColInd = bankDataColumnIndexes.credit;
        let debitColInd = bankDataColumnIndexes.debit;
        let dateColInd = bankDataColumnIndexes.date;
        let totalRecords;
        let debitAmount, creditAmount;
        let transactionGroupMappingID = 1;
        let currentGroupCreditTransaction, currentGroupDebitTransaction;
        let openingBalance, closingBalance, receiptTotalAmount = 0, paymentTotalAmount = 0;

        let groupTransactions = {};

        let groupDetails = {
            payments: {},
            receipts: {}
        }

        // calculating opening balance
        if (transactionData[0][bankDataColumnIndexes.debit] && transactionData[0][bankDataColumnIndexes.debit] > 0) {
            openingBalance = transactionData[0][bankDataColumnIndexes.balance] + transactionData[0][bankDataColumnIndexes.debit];
        }
        else {
            openingBalance = transactionData[0][bankDataColumnIndexes.balance] - transactionData[0][bankDataColumnIndexes.credit];
        }

        closingBalance = transactionData[transactionData.length - 1][bankDataColumnIndexes.balance];

        // extract common keywords data
        for (let keyword of bankStatementKeywords) {
            currentGroupCreditTransaction = [];
            currentGroupDebitTransaction = [];
            debitAmount = 0;
            creditAmount = 0;
            totalRecords = transactionData.length;
            for (let ind = 0; ind < totalRecords; ++ind) {
                let transRecord = transactionData.shift();
                if (typeof transRecord[dateColInd] == 'number' ){
                    transRecord[dateColInd] = convertExcelDateToString(transRecord[dateColInd]);
                }
                if (transRecord[descColInd] == null) {
                    continue;
                }
                let processedDesc = processDescription(transRecord[descColInd]);
                let isKeywordMatch = false;
                switch (keyword.condition) {
                    case 'contains':
                        isKeywordMatch = processedDesc.includes(keyword.name);
                        break;
                    case 'startsWith':
                        isKeywordMatch = processedDesc.indexOf(keyword.name) == 0;
                        break;
                    default:
                        isKeywordMatch = processedDesc.includes(keyword.name);
                }
                if (isKeywordMatch) {
                    if ( transRecord[creditColInd] != null && transRecord[creditColInd]>0 ) {
                        creditAmount += transRecord[creditColInd];
                        currentGroupCreditTransaction.push(transRecord);

                    } else if (transRecord[debitColInd] != null && transRecord[debitColInd] > 0) {
                        debitAmount += transRecord[debitColInd];
                        currentGroupDebitTransaction.push(transRecord);
                    }
                } else {
                    transactionData.push(transRecord);
                }
            }
            receiptTotalAmount += creditAmount;
            paymentTotalAmount += debitAmount;

            if (debitAmount > 0) {
                groupDetails.payments[transactionGroupMappingID] = {
                    amount: debitAmount,
                    totalTransactions: currentGroupDebitTransaction.length,
                    particular: keyword.name
                };
                groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                ++transactionGroupMappingID;
            }
            if (creditAmount > 0) {
                groupDetails.receipts[transactionGroupMappingID] = {
                    amount: creditAmount,
                    totalTransactions: currentGroupCreditTransaction.length,
                    particular: keyword.name
                }
                groupTransactions[transactionGroupMappingID] = currentGroupCreditTransaction;
                ++transactionGroupMappingID;
            }
        }

        // extract dynamic transaction
        while (transactionData.length > 0) {
            let curRecord = transactionData.shift();
            if (typeof curRecord[dateColInd] == 'number') {
                curRecord[dateColInd] = convertExcelDateToString(curRecord[dateColInd]);
            }
            if (curRecord[descColInd] == null) {
                continue;
            }
            let curRecDesc = processDescription(curRecord[descColInd]);

            debitAmount = curRecord[debitColInd] != null ? curRecord[debitColInd] : 0;
            creditAmount = curRecord[creditColInd] != null ? curRecord[creditColInd] : 0;
            currentGroupCreditTransaction = [];
            currentGroupDebitTransaction = [];

            if (debitAmount > 0) {
                currentGroupDebitTransaction.push(curRecord)
            } else {
                currentGroupCreditTransaction.push(curRecord);
            }


            totalRecords = transactionData.length;
            for (let ind = 0; ind < totalRecords; ++ind) {
                let transRecord = transactionData.shift();
                if (transRecord[descColInd] == null) {
                    continue;
                }
                let processedDesc = processDescription(transRecord[descColInd]);
                if (processedDesc.includes(curRecDesc)) {
                    if (transRecord[creditColInd] != null && transRecord[creditColInd] > 0) {
                        creditAmount += transRecord[creditColInd];
                        currentGroupCreditTransaction.push(transRecord);
                    } else if (transRecord[debitColInd] != null && transRecord[debitColInd] > 0) {
                        debitAmount += transRecord[debitColInd];
                        currentGroupDebitTransaction.push(transRecord);
                    }
                } else {
                    transactionData.push(transRecord);
                }
            }

            receiptTotalAmount += creditAmount;
            paymentTotalAmount += debitAmount;

            if (debitAmount > 0) {
                groupDetails.payments[transactionGroupMappingID] = {
                    amount: debitAmount,
                    totalTransactions: currentGroupDebitTransaction.length,
                    particular: curRecDesc
                };
                groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                ++transactionGroupMappingID;
            } else if (creditAmount > 0) {
                groupDetails.receipts[transactionGroupMappingID] = {
                    amount: creditAmount,
                    totalTransactions: currentGroupCreditTransaction.length,
                    particular: curRecDesc
                }
                groupTransactions[transactionGroupMappingID] = currentGroupCreditTransaction;
                ++transactionGroupMappingID;
            }

        }

        return {
            amountDetails: {
                openingBalance: openingBalance,
                closingBalance: closingBalance,
                receiptTotalAmount: receiptTotalAmount,
                paymentTotalAmount: paymentTotalAmount
            },
            groupDetails: groupDetails,
            groupTransactions: groupTransactions
        };

    }



    this.anaylseContent = function (rows, bankDataColumnIndexes) {

        let consolidationData = analyseTransactionData(rows, bankDataColumnIndexes);
        consolidationData.bankDataColumnIndexes = bankDataColumnIndexes;
        return consolidationData;

    }
}

module.exports = bankStatementAnalyser;