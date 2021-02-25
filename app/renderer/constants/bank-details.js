const bankStatementKeywords = [
    { name : 'upi' , condition : 'startsWith'},
    { name : 'pos' , condition : 'startsWith'},
    { name : 'salary' , condition : 'contains'},
    { name : 'sbiint' , condition : 'contains'},
    { name : 'neft' , condition : 'contains'},
    { name : 'rtgs' , condition : 'contains'},
    { name : 'cashdeposit' , condition : 'contains'},
    { name : 'cashwithdrawal' , condition : 'contains'},
    { name : 'bankcharges' , condition : 'contains'},
    { name : 'licofindia' , condition : 'contains'},
    { name : 'newindiaassurance' , condition : 'contains'},
    { name : 'sbint' , condition : 'contains'},
    { name : 'imps' , condition : 'contains'},
    { name : 'refund' , condition : 'contains'},
    { name : 'rent' , condition : 'contains'},
    { name : 'tangedco' , condition : 'contains'}
]

export default bankStatementKeywords;
