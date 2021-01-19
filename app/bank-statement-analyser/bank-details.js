let bankStatementHeaders = {
    'canara': [ 'Transaction Date','Value Date', 'Cheque No.','Description','Branch Code', 'Debit', 'Credit', 'Balance' ]
}

let bankDataColumnIndexes = {
    'canara': {
        date : 1,
        description : 3,
        debit : 5,
        credit : 6
    }
}

let bankStatementKeywords = ["upi","salary","sbiint","pos","upi","neft","rtgs","cash deposit",
    "cash withdrawal","bank charges","lic of india","new india assurance",
    "refund", "rent", "tangedco"]

exports.bankStatementHeaders =  bankStatementHeaders;
exports.bankDataColumnIndexes =  bankDataColumnIndexes;
exports.bankStatementKeywords = bankStatementKeywords;