import bankStatementGroups from '../../constants/bank-details';

const bankStatementAnalyser = new function () {

    const parseDescription = function (transactionData, descColInd) {
        let processedDescriptionArr = [];
        let splitRegex = /[^0-9a-zA-z]/;
        transactionData.forEach(singleTransaction => {
            let transactionDescription = singleTransaction[descColInd];

            let wordsArr = transactionDescription.split(splitRegex).filter(word => {
                return (word.length > 0 && isNaN(word));
            }).map(word => {
                return word.replace(/[0-9]/g, '').toLowerCase();
            });

            processedDescriptionArr.push({
                descWords: wordsArr,
                wholeDesc: wordsArr.join('')
            });
        });

        return processedDescriptionArr;
    }

    const convertExcelDateToString = function (serial) {
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
        let currentGroupDebitAmount, currentGroupCreditAmount;
        let transactionGroupMappingID = 1;
        let currentGroupCreditTransaction, currentGroupDebitTransaction;
        let openingBalance, closingBalance, receiptTotalAmount = 0, paymentTotalAmount = 0;

        let groupTransactions = {};

        let groupDetails = {
            payments: {},
            receipts: {}
        }

        let firstRowIndex = 0;
        // calculating opening balance
        if (transactionData[firstRowIndex][bankDataColumnIndexes.debit] && transactionData[firstRowIndex][bankDataColumnIndexes.debit] > 0) {
            openingBalance = transactionData[firstRowIndex][bankDataColumnIndexes.balance] + transactionData[firstRowIndex][bankDataColumnIndexes.debit];
        }
        else {
            openingBalance = transactionData[firstRowIndex][bankDataColumnIndexes.balance] - transactionData[firstRowIndex][bankDataColumnIndexes.credit];
        }

        closingBalance = transactionData[transactionData.length - 1][bankDataColumnIndexes.balance];

        let processedDescriptionArr = parseDescription(transactionData, descColInd);

        // extract common keywords data
        for (let group of bankStatementGroups) {
            currentGroupCreditTransaction = [];
            currentGroupDebitTransaction = [];
            currentGroupDebitAmount = 0;
            currentGroupCreditAmount = 0;

            group.searchKeywords.forEach(groupSearchUnit => {
                let keyword = groupSearchUnit.keyword;
                let searchCondition = groupSearchUnit.condition;
                totalRecords = transactionData.length;
                for (let ind = 0; ind < totalRecords; ++ind) {
                    let transRecord = transactionData.shift();
                    let processedDescription = processedDescriptionArr.shift();
                    if (typeof transRecord[dateColInd] == 'number') {
                        transRecord[dateColInd] = convertExcelDateToString(transRecord[dateColInd]);
                    }
                    if (group.groupType) {
                        if (group.groupType == 'credit' && transRecord[debitColInd] > 0) {
                            transactionData.push(transRecord);
                            processedDescriptionArr.push(processedDescription);
                            continue;
                        }
                        if (group.groupType == 'debit' && transRecord[creditColInd] > 0) {
                            transactionData.push(transRecord);
                            processedDescriptionArr.push(processedDescription);
                            continue;
                        }
                    }

                    let isKeywordMatch = false;
                    switch (searchCondition) {
                        case 'contains':
                            isKeywordMatch = processedDescription.wholeDesc.includes(keyword);
                            break;
                        case 'word':
                            isKeywordMatch = processedDescription.descWords.some(word => word === keyword);
                            break;
                    }
                    if (isKeywordMatch) {
                        if (transRecord[creditColInd] !== null && transRecord[creditColInd] > 0) {
                            currentGroupCreditAmount += transRecord[creditColInd];
                            currentGroupCreditTransaction.push(transRecord);
                        } else if (transRecord[debitColInd] !== null && transRecord[debitColInd] > 0) {
                            currentGroupDebitAmount += transRecord[debitColInd];
                            currentGroupDebitTransaction.push(transRecord);
                        }
                    } else {
                        transactionData.push(transRecord);
                        processedDescriptionArr.push(processedDescription);
                    }
                }
            });

            receiptTotalAmount += currentGroupCreditAmount;
            paymentTotalAmount += currentGroupDebitAmount;

            if (currentGroupDebitAmount > 0) {
                groupDetails.payments[transactionGroupMappingID] = {
                    amount: currentGroupDebitAmount,
                    totalTransactions: currentGroupDebitTransaction.length,
                    particular: group.displayName
                };
                groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                ++transactionGroupMappingID;
            }
            if (currentGroupCreditAmount > 0) {
                groupDetails.receipts[transactionGroupMappingID] = {
                    amount: currentGroupCreditAmount,
                    totalTransactions: currentGroupCreditTransaction.length,
                    particular: group.displayName
                }
                groupTransactions[transactionGroupMappingID] = currentGroupCreditTransaction;
                ++transactionGroupMappingID;
            }

        }

        let creditUngroupedTransactions = [];
        let debitUngroupedTransactions = [];
        let debitUngroupedAmount = 0, creditUngroupedAmount = 0;

        // extract dynamic transaction
        while (transactionData.length > 0) {

            let curRecord = transactionData.shift();

            let curProcessedDescription = processedDescriptionArr.shift();
            if (typeof curRecord[dateColInd] === 'number') {
                curRecord[dateColInd] = convertExcelDateToString(curRecord[dateColInd]);
            }

            currentGroupDebitAmount = curRecord[debitColInd] != null ? curRecord[debitColInd] : 0;
            currentGroupCreditAmount = curRecord[creditColInd] != null ? curRecord[creditColInd] : 0;
            currentGroupCreditTransaction = [];
            currentGroupDebitTransaction = [];

            if (currentGroupDebitAmount > 0) {
                currentGroupDebitTransaction.push(curRecord)
            } else {
                currentGroupCreditTransaction.push(curRecord);
            }

            totalRecords = transactionData.length;
            for (let ind = 0; ind < totalRecords; ++ind) {
                let transRecord = transactionData.shift();
                let processedDescription = processedDescriptionArr.shift();
                if (curProcessedDescription.wholeDesc === processedDescription.wholeDesc) {
                    if (transRecord[creditColInd] != null && transRecord[creditColInd] > 0) {
                        currentGroupCreditAmount += transRecord[creditColInd];
                        currentGroupCreditTransaction.push(transRecord);
                    } else if (transRecord[debitColInd] != null && transRecord[debitColInd] > 0) {
                        currentGroupDebitAmount += transRecord[debitColInd];
                        currentGroupDebitTransaction.push(transRecord);
                    }
                } else {
                    transactionData.push(transRecord);
                    processedDescriptionArr.push(processedDescription);
                }
            }

            receiptTotalAmount += currentGroupCreditAmount;
            paymentTotalAmount += currentGroupDebitAmount;

            console.log('after curgroup : ', currentGroupCreditAmount, ' ', currentGroupDebitAmount);

            if (currentGroupDebitAmount > 0) {
                if (currentGroupDebitTransaction.length === 1) {
                    debitUngroupedTransactions.push(curRecord);
                    debitUngroupedAmount += currentGroupDebitAmount;
                } else {
                    groupDetails.payments[transactionGroupMappingID] = {
                        amount: currentGroupDebitAmount,
                        totalTransactions: currentGroupDebitTransaction.length,
                        particular: curProcessedDescription.descWords.join(' ')
                    };
                    groupTransactions[transactionGroupMappingID] = currentGroupDebitTransaction;
                    ++transactionGroupMappingID;
                }
            }
            if (currentGroupCreditAmount > 0) {
                if (currentGroupCreditTransaction.length === 1) {
                    creditUngroupedTransactions.push(curRecord);
                    creditUngroupedAmount += currentGroupCreditAmount;
                } else {
                    groupDetails.receipts[transactionGroupMappingID] = {
                        amount: currentGroupCreditAmount,
                        totalTransactions: currentGroupCreditTransaction.length,
                        particular: curProcessedDescription.descWords.join(' ')
                    }
                    groupTransactions[transactionGroupMappingID] = currentGroupCreditTransaction;
                    ++transactionGroupMappingID;
                }
            }

        }


        if (debitUngroupedTransactions.length > 0) {
            groupDetails.payments[transactionGroupMappingID] = {
                amount: debitUngroupedAmount,
                totalTransactions: debitUngroupedTransactions.length,
                particular: 'Ungrouped Transactions'
            }
            groupTransactions[transactionGroupMappingID] = debitUngroupedTransactions;
            ++transactionGroupMappingID;
        }

        if (creditUngroupedTransactions.length > 0) {
            groupDetails.receipts[transactionGroupMappingID] = {
                amount: creditUngroupedAmount,
                totalTransactions: creditUngroupedTransactions.length,
                particular: 'Ungrouped Transactions'
            }
            groupTransactions[transactionGroupMappingID] = creditUngroupedTransactions;
            ++transactionGroupMappingID;
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

export default bankStatementAnalyser;