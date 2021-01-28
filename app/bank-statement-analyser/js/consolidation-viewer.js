
const { bankDataColumnIndexes } = require("../js/bank-details");
const ExcelJS = require('exceljs');
const path = require('path'); 
const electron = require('electron'); 
const dialog = electron.remote.dialog; 

// var accountNumberValue = localStorage.getItem('accountNumberValue');
// // document.getElementById("account-number-value").innerHTML = accountNumberValue;
// console.log(accountNumberValue);

let ConsolidationViewer = new function(){
    let groupDetails, groupTransactions, amountDetails;
    let bankType;
    const writeToFile = function(filePath){

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bank Consolidation');
        let row;
        
        //40

        worksheet.mergeCells('B2', 'D3');

        worksheet.getCell('B2').value = 'CREDIT SUMMATION';

        worksheet.getCell('B2').font = {
            bold: true,
            size: 20,
            color: { argb: '317FED' }
        };

        worksheet.getCell('B2').alignment = {
            vertical: 'middle', horizontal: 'center'
        };

        worksheet.columns = [
            { header : "" ,key: 'col1',width: 5 },
            { header : "" ,key: 'col2',width: 35 },
            { header : "" ,key: 'col3',width: 15 },
            { header : "" ,key: 'col4',width: 15 },
            { header : "" ,key: 'col5',width: 5 },
        ];
        worksheet.addRow({});

        row = {
            col2 : "Name of Bank",
            col3 : bankType
        }
        worksheet.addRow(row);
        worksheet.addRow({});
        worksheet.addRow({});

        row = {
            col2 : "OPENING BALANCE (A)",
            col4 : amountDetails.openingBalance
        }
        worksheet.addRow(row);

        worksheet.addRow({});

        row = {
            col2 : "RECEIPTS (B)"
        }
        worksheet.addRow(row);

        let receiptObjKeys = Object.keys(groupDetails.receipts);
        let paymentObjKeys = Object.keys(groupDetails.payments);
        let particular,amount;
        let curObjectKey;
        while ( receiptObjKeys.length>1  ){
            
            curObjectKey = receiptObjKeys.shift();
            particular = groupDetails.receipts[curObjectKey.toString()].particular;
            amount = groupDetails.receipts[curObjectKey.toString()].amount;
            row = { col2: particular, col3:  amount };
            worksheet.addRow(row);
        }



        curObjectKey = receiptObjKeys.shift();
        particular = groupDetails.receipts[curObjectKey.toString()].particular;
        amount = groupDetails.receipts[curObjectKey.toString()].amount;
        row = { col2: particular, col3:  amount, col4 : amountDetails.receiptTotalAmount };
        worksheet.addRow(row);

        worksheet.addRow({});

        row = {
            col2 : "TOTAL AMOUNT AVAILABLE (C)=(A)+(B)",
            col4 : amountDetails.openingBalance+amountDetails.receiptTotalAmount
        }
        worksheet.addRow(row);

        worksheet.addRow({});

        row = {
            col2 : "PAYMENTS (D)"
        }
        worksheet.addRow(row);
        
        while ( paymentObjKeys.length>1  ){
            
            curObjectKey = paymentObjKeys.shift();
            particular = groupDetails.payments[curObjectKey.toString()].particular;
            amount = groupDetails.payments[curObjectKey.toString()].amount;
            row = { col2: particular, col3:  amount };
            worksheet.addRow(row);
        }

        curObjectKey = paymentObjKeys.shift();
        particular = groupDetails.payments[curObjectKey.toString()].particular;
        amount = groupDetails.payments[curObjectKey.toString()].amount;
        row = { col2: particular, col3:  amount, col4 : amountDetails.paymentTotalAmount };
        worksheet.addRow(row);

        worksheet.addRow({});

        row = {
            col2 : "CLOSING BALANCE (E)=(C)-(D)",
            col4 : amountDetails.closingBalance
        }
        worksheet.addRow(row);

        let topBorderStyles = {
            top: { style: "thin" }
        };

        let verticalBorderStyles = {
            top: { style: "thin" },
            bottom: { style: "thin" }
        };







        // worksheet.getCell('A1').value = 'Receipts';
        // worksheet.getCell('A1').font = {
        //     bold: true,
        //     size: 20,
        // };
        // worksheet.getCell('A1').alignment = {
        //     vertical: 'middle', horizontal: 'center'
        // };

        // worksheet.mergeCells('F1', 'G2');
        // worksheet.getCell('F1').value = 'Payments';
        // worksheet.getCell('F1').font = {
        //     bold: true,
        //     size: 20,
        // };
        // worksheet.getCell('F1').alignment = {
        //     vertical: 'middle', horizontal: 'center'
        // };

        // // worksheet.getRow(5).values = ['Particulars', 'Amount','','','', 'Particulars', 'Amount'];
        // worksheet.getRow(5).eachCell((cell, rowNumber) => { 
        //     cell.font = {
        //         bold: true,
        //         size: 16,
        //     };
        //     cell.alignment = {
        //         vertical: 'middle', horizontal: 'center'
        //     };
        // })

        // // add column headers
        

       

        // while( receiptObjKeys.length>0 || paymentObjKeys.length>0 ){
        //     let row = {},particular,amount;
        //     if( receiptObjKeys.length>0 ){
        //         let curObjectKey = receiptObjKeys.shift();
        //         particular = groupDetails.receipts[curObjectKey.toString()].particular;
        //         amount = groupDetails.receipts[curObjectKey.toString()].amount;
        //         row = Object.assign({},{ receiptParticular: particular, receiptAmount:  amount });
        //     }
        //     if( paymentObjKeys.length>0 ){
        //         let curObjectKey = paymentObjKeys.shift();
        //         particular = groupDetails.payments[curObjectKey.toString()].particular;
        //         amount = groupDetails.payments[curObjectKey.toString()].amount;
        //         row = Object.assign(row,{ paymentParticular: particular, paymentAmount:  amount });
        //     }
        //     worksheet.addRow(row);
        // }

        // let receiptTotalRowind = 5+Object.keys(groupDetails.receipts).length+1;
        // let paymentTotalRowind = 5+Object.keys(groupDetails.payments).length+1;
        // let receiptTotalCellAddr = 'B'+receiptTotalRowind;
        // let paymentTotalCellAddr = 'G'+paymentTotalRowind;

        // let totalBorderStyles = {
        //         top: { style: "thin" },
        //         bottom: { style: "thin" }
        //     };

        // worksheet.getCell(receiptTotalCellAddr).value = amountDetails.receiptTotalAmount;
        // worksheet.getCell(receiptTotalCellAddr).numFmt = '[>=10000000]##\,##\,##\,##0;[>=100000] ##\,##\,##0;##,##0.00';
        // worksheet.getCell(receiptTotalCellAddr).font = { bold: true }
        // worksheet.getCell(receiptTotalCellAddr).border = totalBorderStyles;
        


        // worksheet.getCell(paymentTotalCellAddr).value = amountDetails.paymentTotalAmount;
        // worksheet.getCell(paymentTotalCellAddr).numFmt = '[>=10000000]##\,##\,##\,##0;[>=100000] ##\,##\,##0;##,##0.00';
        // worksheet.getCell(paymentTotalCellAddr).font = { bold: true }
        // worksheet.getCell(paymentTotalCellAddr).border = totalBorderStyles;

        // save workbook to disk
        workbook
        .xlsx
        .writeFile(filePath)
        .then(() => {
            console.log("saved");
        })
        .catch((err) => {
            console.log("err", err);
        });
    }

    const populateData = function(){
        let receiptDetails = groupDetails.receipts;
        let receiptTable = $("#receipt-table");
        for(let [mappingId,curGroupDetail] of Object.entries(receiptDetails)){
            receiptTable.append(
                '<tr data-mapping-id="'+mappingId+'" class="js-group-row">'+
                    '<td contenteditable="true" class="js-group-particular">'+curGroupDetail.particular+'</td>'+
                    '<td class="js-group-amount">'+curGroupDetail.amount+'</td>'+
                    '<td class="js-total-transactions">'+curGroupDetail.totalTransactions+'</td>'+
                '</tr'
            );
        }

        let paymentDetails = groupDetails.payments;
        let paymentTable = $("#payment-table");
        for(let [mappingId,curGroupDetail] of Object.entries(paymentDetails)){
            paymentTable.append(
                '<tr data-mapping-id="'+mappingId+'" class="js-group-row">'+
                    '<td contenteditable="true" class="js-group-particular">'+curGroupDetail.particular+'</td>'+
                    '<td class="js-group-amount">'+curGroupDetail.amount+'</td>'+
                    '<td class="js-total-transactions">'+curGroupDetail.totalTransactions+'</td>'+
                '</tr'
            );
        }
        // Excel formulas if applied, the result(value) is an json object with result key
        if(typeof(amountDetails.openingBalance)=="object"){
            $("#opening-balance-amount").text(amountDetails.openingBalance.result);
        }
        else{
            $("#opening-balance-amount").text(amountDetails.openingBalance);
        }

        if(typeof(amountDetails.closingBalance)=="object"){
            $("#closing-balance-amount").text(amountDetails.closingBalance.result);
        }
        else{
            $("#closing-balance-amount").text(amountDetails.closingBalance);
        }

        if(typeof(amountDetails.paymentTotalAmount)=="object"){
            $("#payment-total-amount").text(amountDetails.paymentTotalAmount.result);
        }
        else{
            $("#payment-total-amount").text(amountDetails.paymentTotalAmount);
        }

        if(typeof(amountDetails.receiptTotalAmount)=="object"){
            $("#receipt-total-amount").text(amountDetails.receiptTotalAmount.result);
        }
        else{
            $("#receipt-total-amount").text(amountDetails.receiptTotalAmount)
        }
    }

    const populateGroupTransactions = function(transactionData,mappingId){
        let transactionTable = $("#transaction-table");
        transactionTable.attr("data-mapping-id",mappingId);
        transactionTable.empty();
        transactionTable.append(
            '<tr>'+
                '<th>Date</th>'+
                '<th>Description</th>'+
                '<th>Credit</th>'+
                '<th>Debit</th>'+
            '</tr>'
        );
        let curBankDataColumn = bankDataColumnIndexes[bankType];
        for( let transRecord of transactionData ){
            transactionTable.append(
                '<tr draggable="true" class="js-transaction-record">'+
                    '<td>'+transRecord[curBankDataColumn.date]+'</td>'+
                    '<td>'+transRecord[curBankDataColumn.description]+'</td>'+
                    '<td class="js-transaction-credit-amt">'+transRecord[curBankDataColumn.credit]+'</td>'+
                    '<td class="js-transaction-debit-amt">'+transRecord[curBankDataColumn.debit]+'</td>'+
                '</tr>'
            )
        }
    }

    const updateGroupNames = function(){
        $("#payment-table tr").each(function(){
            let mappingId = $(this).attr("data-mapping-id");
            if( mappingId!=null ){
                let curGroupDetails = groupDetails.payments[mappingId.toString()];
                curGroupDetails.particular = $(this).find(".js-group-particular").text();
            }
        });
        $("#receipt-table tr").each(function(){
            let mappingId = $(this).attr("data-mapping-id");
            if( mappingId!=null ){
                let curGroupDetails = groupDetails.receipts[mappingId.toString()];
                curGroupDetails.particular = $(this).find(".js-group-particular").text();
            }
            
        });
    }

    this.init = function(){

        let consolidationData = JSON.parse(localStorage.getItem("consolidationData"));
        bankType = localStorage.getItem("bankType");
        localStorage.clear();
        if( consolidationData ){
            groupDetails = consolidationData.groupDetails;
            groupTransactions = consolidationData.groupTransactions;
            amountDetails = consolidationData.amountDetails;
        }
        

        document.getElementById("export-btn").addEventListener("click",()=>{
            updateGroupNames();
            dialog.showSaveDialog({ 
                title: 'Select the File Path to save', 
                defaultPath: path.join(__dirname), 
                // defaultPath: path.join(__dirname, '../assets/'), 
                buttonLabel: 'Save', 
                // Restricting the user to only Text Files. 
                filters: [ 
                    { 
                        name: 'consolidation-data', 
                        extensions: ['xlsx', 'xls'] 
                    }, ], 
                properties: [] 
            }).then(file => { 
                // Stating whether dialog operation was cancelled or not.
                if (!file.canceled) { 
                    writeToFile(file.filePath.toString());
                } 
            }).catch(err => { 
                console.log(err) 
            });
            
        });

        $("#back-icon").on('click',()=>{
            window.location.href = "importFile.html";
        });

        $(".js-group-table").on('click','.js-group-row',function(){
            let mappingId = $(this).attr("data-mapping-id");
            let selectedGroupTransactions = groupTransactions[mappingId.toString()];
            populateGroupTransactions(selectedGroupTransactions,mappingId);
        }); 

        $(".js-group-table").on('click','.js-group-row',function(){
            let mappingId = $(this).attr("data-mapping-id");
            let selectedGroupTransactions = groupTransactions[mappingId.toString()];
            populateGroupTransactions(selectedGroupTransactions,mappingId);
        }); 

        $("#transaction-table").on('dragstart', '.js-transaction-record',function(event){
            let sourceMappingId = $(this).closest("table").attr("data-mapping-id");
            event.originalEvent.dataTransfer.setData("mappingId",sourceMappingId);
            let creditAmount = $(this).find(".js-transaction-credit-amt").text();
 
            let debitAmount = $(this).find(".js-transaction-debit-amt").text();            
            
            let selectedTransactionIndex = $(this).index();
            let selectedTransaction = groupTransactions[sourceMappingId.toString()][selectedTransactionIndex-1];
            groupTransactions[sourceMappingId.toString()].splice(selectedTransactionIndex-1,1);

            event.originalEvent.dataTransfer.setData("selectedTransaction",JSON.stringify(selectedTransaction));
            if( +creditAmount>0 ){
                event.originalEvent.dataTransfer.setData("transactionAmount", creditAmount.toString());
                event.originalEvent.dataTransfer.setData("transactionType", "credit");
            }else{
                event.originalEvent.dataTransfer.setData("transactionAmount", debitAmount.toString());
                event.originalEvent.dataTransfer.setData("transactionType", "debit");
            }
            
        });

        $("#transaction-table").on('dragstop', '.js-transaction-record',function(event){
            $(".js-group-table tr").removeClass("group-row--selected");
        });

        $(".js-group-table").on('dragover', '.js-group-row',function(event){
            $(".js-group-table tr").removeClass("group-row--selected");
            $(this).addClass("group-row--selected");
            var transactionType = event.originalEvent.dataTransfer.getData("transactionType");
            if( transactionType && transactionType==$(this).attr("data-group-type") ){    
                return true;
            }
            return false;
        });

        $(".js-group-table").on('drop', '.js-group-row',function(event){
            event.preventDefault();
            let amount = parseFloat(event.originalEvent.dataTransfer.getData("transactionAmount"));
            var transactionType = event.originalEvent.dataTransfer.getData("transactionType");
            let sourceMappingId = event.originalEvent.dataTransfer.getData("mappingId");
            let targetMappingId = $(this).attr("data-mapping-id");
            let sourceGroupDetails,targetGroupDetails;

            if( transactionType=="credit" ){
                sourceGroupDetails = groupDetails.receipts[sourceMappingId.toString()];
                targetGroupDetails = groupDetails.receipts[targetMappingId.toString()];
            }else{
                sourceGroupDetails = groupDetails.payments[sourceMappingId.toString()];
                targetGroupDetails = groupDetails.payments[targetMappingId.toString()];
            }

            sourceGroupDetails.amount -= amount;
            --sourceGroupDetails.totalTransactions;
            targetGroupDetails.amount += amount;
            ++targetGroupDetails.totalTransactions;
            
            let selectedTransaction = event.originalEvent.dataTransfer.getData("selectedTransaction");

            groupTransactions[targetMappingId.toString()].push(JSON.parse(selectedTransaction));

            let selectedGroupTransactions = groupTransactions[sourceMappingId.toString()];
            populateGroupTransactions(selectedGroupTransactions,sourceMappingId);

            $(this).find(".js-group-amount").text(targetGroupDetails.amount);
            $(this).find(".js-total-transactions").text(targetGroupDetails.totalTransactions);

            $(this).siblings('tr[data-mapping-id="'+sourceMappingId+'"]').find(".js-group-amount").text(sourceGroupDetails.amount);
            $(this).siblings('tr[data-mapping-id="'+sourceMappingId+'"]').find(".js-total-transactions").text(sourceGroupDetails.totalTransactions);

        });

        $("#payment-group-add-btn").on('click', function(){

            let newPaymentGroup = {
                amount: 0,
                totalTransactions : 0,
                particular : "dummy"
            }
            let mappingId = Object.keys(groupDetails.receipts).length+Object.keys(groupDetails.payments).length+2;
            $("#payment-table").append(
                '<tr data-mapping-id="'+mappingId+'" class="js-group-row">'+
                    '<td contenteditable="true" class="js-group-particular">'+newPaymentGroup.particular+'</td>'+
                    '<td class="js-group-amount">'+newPaymentGroup.amount+'</td>'+
                    '<td class="js-total-transactions">'+newPaymentGroup.totalTransactions+'</td>'+
                '</tr'
            )
            groupTransactions[mappingId.toString()] = [];
            groupDetails.payments[mappingId.toString()] = newPaymentGroup;

        });


        $("#receipt-group-add-btn").on('click', function(){

            let newPaymentGroup = {
                amount: 0,
                totalTransactions : 0,
                particular : "dummy"
            }
            let mappingId = Object.keys(groupDetails.receipts).length+Object.keys(groupDetails.payments).length+1;
            $("#receipt-table").append(
                '<tr data-mapping-id="'+mappingId+'" class="js-group-row">'+
                    '<td contenteditable="true" class="js-group-particular">'+newPaymentGroup.particular+'</td>'+
                    '<td class="js-group-amount">'+newPaymentGroup.amount+'</td>'+
                    '<td class="js-total-transactions">'+newPaymentGroup.totalTransactions+'</td>'+
                '</tr'
            )
            groupTransactions[mappingId.toString()] = [];
            groupDetails.receipts[mappingId.toString()] = newPaymentGroup;

        });


        populateData();
    }
}