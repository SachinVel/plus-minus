const bankStatementGroups = [
    { displayName: 'Telephone/Internet charges', searchKeywords:   [
        {keyword : 'vodafone' , condition : 'contains'},
        {keyword : 'airtel' , condition : 'contains'},
        {keyword : 'airmob' , condition : 'contains'},//not permanent
        {keyword : 'bsnl' , condition : 'contains'},
        {keyword : 'jio' , condition : 'contains'}
    ]},
    { displayName: 'Entertainment', searchKeywords:   [
        {keyword : 'spicinemas' , condition : 'contains'},
        {keyword : 'inox' , condition : 'contains'},
        {keyword : 'imax' , condition : 'contains'},
        {keyword : 'pvr' , condition : 'contains'},
        {keyword : 'theatre' , condition : 'contains'},
        {keyword : 'bookmyshow' , condition : 'contains'},
    ]},
    { displayName: 'Food & Beverages', searchKeywords:   [
        {keyword : 'swiggy' , condition : 'contains'},
        {keyword : 'zomato' , condition : 'contains'},
    ]},
    { displayName: 'E-Commerce', searchKeywords:   [
        {keyword : 'amazon' , condition : 'word'},
        {keyword : 'flpkrt' , condition : 'contains'},
        {keyword : 'flipkart' , condition : 'contains'},
    ]},
    { displayName: 'Travelling & Conveyance', searchKeywords:   [
        {keyword : 'redbus' , condition : 'contains'},
        {keyword : 'irctc' , condition : 'contains'},
        {keyword : 'makemytrip' , condition : 'contains'},
        {keyword : 'jetairways' , condition : 'contains'},
        {keyword : 'indigo' , condition : 'contains'},
    ]},
    { displayName: 'Investments', searchKeywords:   [
        {keyword : 'mf' , condition : 'word'},
        {keyword : 'elss' , condition : 'contains'},
        {keyword : 'sip' , condition : 'contains'},
        {keyword : 'sbicap' , condition : 'contains'}
    ]},
    { displayName: 'Taxes', searchKeywords:   [
        {keyword : 'cbdt' , condition : 'contains'},
        {keyword : 'advancetax' , condition : 'contains'},
        {keyword : 'goodsandservicetax' , condition : 'contains'},
        {keyword : 'incometax' , condition : 'contains'},
        {keyword : 'propertytax' , condition : 'contains'},
        {keyword : 'watertax' , condition : 'contains'},
        {keyword : 'municipalcorporation' , condition : 'contains'}
    ]},
    { displayName: 'ESI & EPF Contributions', searchKeywords:   [
        {keyword : 'employeesstateinsurance' , condition : 'contains'},
        {keyword : 'employeesstateinsuranc' , condition : 'contains'},
        {keyword : 'employeesprovidentfund' , condition : 'contains'},
    ]},
    { displayName: 'Fuel Charges', searchKeywords:   [
        {keyword : 'fuel' , condition : 'contains'},
        {keyword : 'petrol' , condition : 'contains'},
    ]},
    { displayName: 'FD/RD', searchKeywords:   [
        {keyword : 'fd' , condition : 'word'},
        {keyword : 'rd' , condition : 'word'},
    ]},
    { displayName: 'Loan' , searchKeywords:   [
        {keyword : 'disbursement' , condition : 'contains'},
        {keyword : 'dsbmt' , condition : 'contains'},
        {keyword : 'jl' , condition : 'word'},
        {keyword : 'gl' , condition : 'word'},
        {keyword : 'sanction' , condition : 'contains'},
        {keyword : 'closure' , condition : 'contains'}
    ]},
    { displayName: 'Interest Payments' ,groupType:'debit' , searchKeywords:   [
        {keyword : 'onlineint' , condition : 'contains'},
        {keyword : 'loanint' , condition : 'contains'},
        {keyword : 'ecs' , condition : 'word'}
    ]},
    { displayName: 'Salary', searchKeywords: [
        {keyword : 'salary' , condition : 'contains'},
        {keyword : 'sal' , condition : 'word'}
    ]},
    { displayName: 'LIC', searchKeywords:   [
        {keyword : 'licofindia' , condition : 'contains'},
        {keyword : 'lifeinsurancecorporation' , condition : 'contains'}
    ]},
    { displayName: 'Cheques', searchKeywords: [
        {keyword : 'chq' , condition : 'contains'},
        {keyword : 'cheque' , condition : 'contains'}
    ]},
    { displayName: 'Insurance Charges', searchKeywords:  [
        {keyword : 'newindiaassurance' , condition : 'contains'},
        {keyword : 'pmsby' , condition : 'contains'},
        {keyword : 'premia' , condition : 'contains'}
    ]},
    { displayName: 'Rent', searchKeywords:   [
        {keyword : 'rent' , condition : 'contains'}
    ]},
    { displayName: 'Electricity charges', searchKeywords:  [
        {keyword : 'tangedco' , condition : 'contains'},
        {keyword : 'tneb' , condition : 'contains'}
    ]},
    { displayName: 'UPI', searchKeywords: [ 
        {keyword : 'upi' , condition : 'word'},
        {keyword : 'upim' , condition : 'word'},
        {keyword : 'paytm' , condition : 'contains'},
        {keyword : 'amazonpay' , condition : 'contains'}
    ]},
    { displayName: 'POS', searchKeywords: [
        {keyword : 'pos' , condition : 'word'},
        {keyword : 'ecom' , condition : 'word'}
    ]},
    { displayName: 'Online Transfers', searchKeywords:  [
        {keyword : 'neft' , condition : 'contains'},
        {keyword : 'rtgs' , condition : 'contains'},
        {keyword : 'imps' , condition : 'contains'},
        {keyword : 'mob' , condition : 'word'},
        {keyword : 'inb' , condition : 'word'}
    ]},
    { displayName: 'Interest receipts', searchKeywords:  [
        {keyword : 'sbint' , condition : 'contains'},
        {keyword : 'creditinterest' , condition : 'contains'},
        {keyword : 'intpd' , condition : 'contains'},
        {keyword : 'int' , condition : 'word'}
    ]},
    { displayName: 'Cash Deposit', groupType : 'credit', searchKeywords:  [
        {keyword : 'cash' , condition : 'contains'},
        {keyword : 'dep' , condition : 'word'},
        {keyword : 'atm' , condition : 'contains'},
        {keyword : 'cshdep' , condition : 'contains'},
        {keyword : 'deposit' , condition : 'contains'},
        {keyword : 'cdm' , condition : 'contains'}
    ]},
    { displayName: 'Cash Withdrawal', groupType : 'debit' , searchKeywords:  [
        {keyword : 'cash' , condition : 'contains'},
        {keyword : 'caswdl' , condition : 'contains'},
        {keyword : 'atmwdl' , condition : 'word'},
        {keyword : 'wthdrl' , condition : 'contains'},
        {keyword : 'atm' , condition : 'contains'},
        {keyword : 'self' , condition : 'contains'},
        {keyword : 'clearing' , condition : 'contains'},
        {keyword : 'cashwdl' , condition : 'contains'},
        {keyword : 'nfs' , condition : 'word'},
        {keyword : 'self' , condition : 'word'},
        {keyword : 'cshwdl' , condition : 'contains'},
        {keyword : 'atl' , condition : 'word'}
    ]},
    { displayName: 'Bank Charges', searchKeywords:   [
        {keyword : 'charge' , condition : 'contains'},
        {keyword : 'chgs' , condition : 'contains'},
        {keyword : 'chrg' , condition : 'contains'},
        {keyword : 'feechg' , condition : 'contains'},
        {keyword : 'lockerrent' , condition : 'contains'},
        {keyword : 'monthlyave' , condition : 'contains'},
        {keyword : 'minbal' , condition : 'contains'},
        {keyword : 'micrca' , condition : 'contains'},
        {keyword : 'chg' , condition : 'word'}
    ]},
    
    { displayName: 'Refund', searchKeywords:  [
        {keyword : 'refund' , condition : 'contains'}
    ]},
    
    { displayName: 'Debit Card', groupType:'debit' , searchKeywords:  [
        {keyword : 'debitcard' , condition : 'contains' }
    ]},
    
]

export default bankStatementGroups;
