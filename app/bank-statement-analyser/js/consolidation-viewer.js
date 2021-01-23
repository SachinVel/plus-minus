let ConsolidationViewer = new function(){
    let groudDetails,groupTransactions;
    
    const writeToFile = function(consolidationData){
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Bank Consolidation');


        worksheet.mergeCells('A1', 'B2');
        worksheet.getCell('A1').value = 'Receipts';
        worksheet.getCell('A1').font = {
            bold: true,
            size: 20,
        };
        worksheet.getCell('A1').alignment = {
            vertical: 'middle', horizontal: 'center'
        };

        worksheet.mergeCells('F1', 'G2');
        worksheet.getCell('F1').value = 'Payments';
        worksheet.getCell('F1').font = {
            bold: true,
            size: 20,
        };
        worksheet.getCell('F1').alignment = {
            vertical: 'middle', horizontal: 'center'
        };

        worksheet.getRow(5).values = ['Particulars', 'Amount','','','', 'Particulars', 'Amount'];
        worksheet.getRow(5).eachCell((cell, rowNumber) => { 
            cell.font = {
                bold: true,
                size: 16,
            };
            cell.alignment = {
                vertical: 'middle', horizontal: 'center'
            };
        })

        // add column headers
        worksheet.columns = [
            { key: 'receiptParticular',width: 50 },
            { key: 'receiptAmount',width: 25,style: {numFmt:'[>=10000000]##\,##\,##\,##0;[>=100000] ##\,##\,##0;##,##0.00'} },
            {},
            {},
            {},
            { key: 'paymentParticular',width: 50 },
            { key: 'paymentAmount',width: 25 ,style: {numFmt:'[>=10000000]##\,##\,##\,##0;[>=100000] ##\,##\,##0;##,##0.00'}}
        ];

        let receiptEntries = Object.entries(consolidationData.receipts);
        let paymentEntries = Object.entries(consolidationData.payments);

        let receiptTotalAmount = 0;
        let paymentTotalAmount = 0;
        while( receiptEntries.length>0 || paymentEntries.length>0 ){
            let row = {},particular,amount;
            if( receiptEntries.length>0 ){
                [particular,amount] = receiptEntries.shift();
                row = Object.assign({},{ receiptParticular: particular, receiptAmount:  amount });
                receiptTotalAmount += parseFloat(amount);
            }
            if( paymentEntries.length>0 ){
                [particular,amount] = paymentEntries.shift();
                row = Object.assign(row,{ paymentParticular: particular, paymentAmount:  amount });
                paymentTotalAmount += parseFloat(amount);
            }
            worksheet.addRow(row);
        }

        let receiptTotalRowind = 5+Object.keys(consolidationData.receipts).length+1;
        let paymentTotalRowind = 5+Object.keys(consolidationData.payments).length+1;
        let receiptTotalCellAddr = 'B'+receiptTotalRowind;
        let paymentTotalCellAddr = 'G'+paymentTotalRowind;

        let totalBorderStyles = {
                top: { style: "thin" },
                bottom: { style: "thin" }
            };

        worksheet.getCell(receiptTotalCellAddr).value = receiptTotalAmount;
        worksheet.getCell(receiptTotalCellAddr).numFmt = '[>=10000000]##\,##\,##\,##0;[>=100000] ##\,##\,##0;##,##0.00';
        worksheet.getCell(receiptTotalCellAddr).font = { bold: true }
        worksheet.getCell(receiptTotalCellAddr).border = totalBorderStyles;
        


        worksheet.getCell(paymentTotalCellAddr).value = paymentTotalAmount;
        worksheet.getCell(paymentTotalCellAddr).numFmt = '[>=10000000]##\,##\,##\,##0;[>=100000] ##\,##\,##0;##,##0.00';
        worksheet.getCell(paymentTotalCellAddr).font = { bold: true }
        worksheet.getCell(paymentTotalCellAddr).border = totalBorderStyles;

        // save workbook to disk
        workbook
        .xlsx
        .writeFile('../Consolidation-Report.xlsx')
        .then(() => {
            console.log("saved");
        })
        .catch((err) => {
            console.log("err", err);
        });
    }

    this.init = function(){
        return;
        let consolidationData = JSON.parse(localStorage.getItem("consolidationData"));
        localStorage.clear();
        groudDetails = consolidationData.groupDetails;
        groupTransactions = consolidationData.groupTransactions;
        console.log("group details : ",groudDetails);
        console.log("group transaction : ",groupTransactions);
    }
}