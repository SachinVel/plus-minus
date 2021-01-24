let bankStatementHeaders = {
    'canara': [ 'Transaction Date','Value Date', 'Cheque No.','Description','Branch Code', 'Debit', 'Credit', 'Balance' ],
    'hdfc': [ 'Date','Narration', 'Chq./Ref.No.','Value Dt','Withdrawal Amt.', 'Deposit Amt.', 'Closing Balance'],
    'icici' : ['Date','Particulars','Chq.No.','Withdrawals','Deposits','Autosweep','Reverse Sweep','Balance(INR)'],
    'sbi' : ['Txn Date','Value Date','Description', 'Ref No./Cheque No.', 'Branch Code', 'Debit', 'Credit','Balance']
}

let bankDataColumnIndexes = {
    'canara': {
        date : 1,
        description : 4,
        debit : 6,
        credit : 7,
        balance : 8
    },
    hdfc : {
        date : 1,
        description : 2,
        debit : 5,
        credit : 6,
        balance : 7
    },
    icici : {
        date : 1,
        description : 2,
        debit : 4,
        credit : 5,
        balance : 8
    },
    sbi : {
        date : 1,
        description : 3,
        debit : 6,
        credit : 7,
        balance : 8
    }
}

let bankStatementKeywords = ["upi","salary","sbiint","pos","upi","neft","rtgs","cash deposit",
    "cash withdrawal","bank charges","lic of india","new india assurance",'sbint','imps',
    "refund", "rent", "tangedco"]

module.exports = {
    bankStatementKeywords : bankStatementKeywords,
    bankDataColumnIndexes : bankDataColumnIndexes,
    bankStatementHeaders : bankStatementHeaders
}