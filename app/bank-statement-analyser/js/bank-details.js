

// let bankStatementKeywords = ["upi","salary","sbiint","pos","upi","neft","rtgs","cash deposit",
//     "cash withdrawal","bank charges","lic of india","new india assurance",'sbint','imps',
//     "refund", "rent", "tangedco"]

let bankStatementKeywords = [
    { name : "upi" , condition : "startsWith"},
    { name : "pos" , condition : "startsWith"},
    { name : "salary" , condition : "contains"},
    { name : "sbiint" , condition : "contains"},
    { name : "neft" , condition : "contains"},
    { name : "rtgs" , condition : "contains"},
    { name : "cash deposit" , condition : "contains"},
    { name : "cash withdrawal" , condition : "contains"},
    { name : "bank charges" , condition : "contains"},
    { name : "lic of india" , condition : "contains"},
    { name : "new india assurance" , condition : "contains"},
    { name : "sbint" , condition : "contains"},
    { name : "imps" , condition : "contains"},
    { name : "refund" , condition : "contains"},
    { name : "rent" , condition : "contains"},
    { name : "tangedco" , condition : "contains"}
]

module.exports = {
    bankStatementKeywords : bankStatementKeywords,
}