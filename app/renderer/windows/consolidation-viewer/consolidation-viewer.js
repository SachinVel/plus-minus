import './consolidation-viewer.css';
const XLSX = require('xlsx');
const path = require('path');
const electron = require('electron');
const dialog = electron.remote.dialog;
import Index from '../../../index';
import consolidationViewerHtml from './consolidation-viewer.html';
import toast from '../../utils/toast/toast';


window.onload = function () {
    ConsolidationViewer.init();
}

const ConsolidationViewer = new function () {
    let groupDetails, groupTransactions, amountDetails;
    let accountNumber,bankName;
    let bankDataColumnIndexes;

    const writeToCell = function(worksheet,cellAddr,content){
        worksheet[cellAddr] = {};
        worksheet[cellAddr].v = content;
    }

    const writeToFile = function (filePath) {

        var workbook = XLSX.utils.book_new();

        //meta details
        workbook.Props = {
        Title: 'Consolidation Data',
            Subject: 'Bank Consolidation',
            Author: 'plus-minus',
            CreatedDate: new Date(Date.now())
        };

        //sheet name
        workbook.SheetNames.push('Sheet1');

        //create empty worksheet
        let worksheet =XLSX.utils.json_to_sheet([]);

        //merge cells content - 0 index
        let mergeCells = [
            //b2 to d3 merge
            { s: { r: 1, c: 1 }, e: { r: 2, c: 3 } },

        ];
        worksheet['!merges'] = mergeCells;

        var wscols = [
            { wch: 5 }, 
            { wch: 35 }, 
            { wch: 15 }, 
            { wch: 15 }, 
            { wch: 5 }, 

        ];
        worksheet['!cols'] = wscols;

        writeToCell(worksheet, 'B2', 'Credit Summation');
        writeToCell(worksheet, 'B5', 'Bank Name');
        writeToCell(worksheet, 'B6', 'Account Number');
        writeToCell(worksheet, 'C5', bankName);
        writeToCell(worksheet, 'C6', accountNumber);

        writeToCell(worksheet, 'B9', 'Opening Balance (A)');
        writeToCell(worksheet, 'D9', +amountDetails.openingBalance);

        writeToCell(worksheet, 'B11', 'Receipts (B)');

        let receiptsData = [];
        let rowData;
        let receipts = groupDetails.receipts;
        let receiptsLength = Object.keys(groupDetails.receipts).length;
        let curInd = 1;
        for( let key of Object.keys(groupDetails.receipts) ){
            if (receipts[key].amount==0 ){
                continue;
            }
            if( curInd!=receiptsLength ){
                rowData = [receipts[key].particular, receipts[key].amount];
            }else{
                rowData = [receipts[key].particular, receipts[key].amount, amountDetails.receiptTotalAmount];
            }
            receiptsData.push(rowData);
            ++curInd;
        }

        XLSX.utils.sheet_add_aoa(worksheet, receiptsData, { origin: 'B12' });

        let nextRowInd = 11+receiptsLength+2;

        writeToCell(worksheet, 'B' + nextRowInd, 'TOTAL AMOUNT AVAILABLE (C)=(A)+(B)');
        writeToCell(worksheet, 'D' + nextRowInd, +amountDetails.openingBalance + amountDetails.receiptTotalAmount);

        nextRowInd += 2;

        writeToCell(worksheet, 'B'+nextRowInd, 'Payments (D)');

        ++nextRowInd;

        let paymentsData = [];

        let payments = groupDetails.payments;
        let paymentsLength = Object.keys(groupDetails.payments).length;
        curInd = 1;
        for (let key of Object.keys(groupDetails.payments)) {
            if (payments[key].amount == 0) {
                continue;
            }
            if (curInd != paymentsLength) {
                rowData = [payments[key].particular, payments[key].amount];
            } else {
                rowData = [payments[key].particular, payments[key].amount, amountDetails.paymentTotalAmount];
            }
            paymentsData.push(rowData);
            ++curInd;
        }

        paymentsData.push([]);
        paymentsData.push(['CLOSING BALANCE (E)=(C)-(D)','' , amountDetails.closingBalance]);

        XLSX.utils.sheet_add_aoa(worksheet, paymentsData, { origin: 'B'+nextRowInd });

        workbook.Sheets['Sheet1'] = worksheet;

        XLSX.writeFile(workbook, filePath);
    }

    const populateData = function () {
        let receiptDetails = groupDetails.receipts;
        let receiptTable = $('#receipt-table');
        let receiptTotalTransaction = 0;
        for (let [mappingId, curGroupDetail] of Object.entries(receiptDetails)) {
            receiptTable.append(
                '<tr data-mapping-id="' + mappingId + '" class="js-group-row" data-group-type="credit">' +
                '<td contenteditable="true" class="js-group-particular">' + curGroupDetail.particular + '</td>' +
                '<td class="js-group-amount">' + curGroupDetail.amount.toFixed(2) + '</td>' +
                '<td class="js-total-transactions">' + curGroupDetail.totalTransactions + '</td>' +
                '</tr'
            );
            receiptTotalTransaction += curGroupDetail.totalTransactions;
        }

        let paymentDetails = groupDetails.payments;
        let paymentTable = $('#payment-table');
        let paymentTotalTransaction = 0;
        for (let [mappingId, curGroupDetail] of Object.entries(paymentDetails)) {
            paymentTable.append(
                '<tr data-mapping-id="' + mappingId + '" class="js-group-row" data-group-type="debit">' +
                '<td contenteditable="true" class="js-group-particular">' + curGroupDetail.particular + '</td>' +
                '<td class="js-group-amount">' + curGroupDetail.amount.toFixed(2) + '</td>' +
                '<td class="js-total-transactions">' + curGroupDetail.totalTransactions + '</td>' +
                '</tr'
            );
            paymentTotalTransaction += curGroupDetail.totalTransactions;
        }

        $('#payment-total-transaction').text(paymentTotalTransaction);
        $('#receipt-total-transaction').text(receiptTotalTransaction);

        $('#opening-balance-amount').text(amountDetails.openingBalance.toFixed(2));
        $('#closing-balance-amount').text(amountDetails.closingBalance.toFixed(2));
        $('#payment-total-amount').text(amountDetails.paymentTotalAmount.toFixed(2));
        $('#receipt-total-amount').text(amountDetails.receiptTotalAmount.toFixed(2));
        
    }

    const populateGroupTransactions = function (transactionData, mappingId, dataGroupType) {
        let transactionTable = $('#transaction-table');
        transactionTable.attr('data-mapping-id', mappingId);
        transactionTable.empty();
        transactionTable.append(
            '<tr>' +
            '<th>Date</th>' +
            '<th>Description</th>' +
            `<th>${dataGroupType.charAt(0).toUpperCase() + dataGroupType.slice(1)}</th>` +
            '</tr>'
        );
        for (let transRecord of transactionData) {
            transactionTable.append(
                '<tr draggable="true" class="js-transaction-record">' +
                '<td>' + transRecord[bankDataColumnIndexes.date] + '</td>' +
                '<td>' + transRecord[bankDataColumnIndexes.description] + '</td>' +
                `<td class="js-transaction-${dataGroupType}-amt">` + transRecord[bankDataColumnIndexes[dataGroupType]].toFixed(2) + '</td>' +
                '</tr>'
            )
        }
    }

    const updateGroupNames = function () {
        $('#payment-table tr').each(function () {
            let mappingId = $(this).attr('data-mapping-id');
            if (mappingId != null) {
                let curGroupDetails = groupDetails.payments[mappingId.toString()];
                curGroupDetails.particular = $(this).find('.js-group-particular').text();
            }
        });
        $('#receipt-table tr').each(function () {
            let mappingId = $(this).attr('data-mapping-id');
            if (mappingId != null) {
                let curGroupDetails = groupDetails.receipts[mappingId.toString()];
                curGroupDetails.particular = $(this).find('.js-group-particular').text();
            }

        });
    }

    this.init = function () {

        accountNumber = localStorage.getItem('accountNumber');
        bankName = localStorage.getItem('bankName');
        $('#account-number-value').text(bankName +' - ' + accountNumber);
        let consolidationData = JSON.parse(localStorage.getItem('consolidationData'));
        

        localStorage.clear();
        if (consolidationData) {
            groupDetails = consolidationData.groupDetails;
            groupTransactions = consolidationData.groupTransactions;
            amountDetails = consolidationData.amountDetails;
            bankDataColumnIndexes = consolidationData.bankDataColumnIndexes;
        }


        document.getElementById('export-btn').addEventListener('click', () => {
            updateGroupNames();
            dialog.showSaveDialog({
                title: 'Select the File Path to save',
                defaultPath: path.join(__dirname),
                buttonLabel: 'Save',
                // Restricting the user to only Text Files. 
                filters: [
                    {
                        name: 'consolidation-data',
                        extensions: ['xlsx', 'xls']
                    },],
                properties: []
            }).then(file => {
                // Stating whether dialog operation was cancelled or not.
                if (!file.canceled) {
                    writeToFile(file.filePath.toString());
                    toast('success','File has been saved successfully');
                }
            }).catch(err => {
                console.error(err)
            });

        });
        $('#back-icon').on('click', () => {
            Index.navigateTo('import-file');
        });

        $('.js-group-table').on('click', '.js-group-row', function () {
            $('.js-group-table tr').removeClass('group-row--selected');
            $(this).addClass('group-row--selected');
            let mappingId = $(this).attr('data-mapping-id');
            let selectedGroupTransactions = groupTransactions[mappingId.toString()];
            populateGroupTransactions(selectedGroupTransactions, mappingId, $(this).attr('data-group-type'));
        });

        $('#transaction-table').on('dragstart', '.js-transaction-record', function (event) {

            let sourceMappingId = $(this).closest('table').attr('data-mapping-id');
            event.originalEvent.dataTransfer.setData('mappingId', sourceMappingId);
            let creditAmount = $(this).find('.js-transaction-credit-amt').text();

            let debitAmount = $(this).find('.js-transaction-debit-amt').text();

            let selectedTransactionIndex = $(this).index();
            let selectedTransaction = groupTransactions[sourceMappingId.toString()][selectedTransactionIndex - 1];
            groupTransactions[sourceMappingId.toString()].splice(selectedTransactionIndex - 1, 1);

            event.originalEvent.dataTransfer.setData('selectedTransaction', JSON.stringify(selectedTransaction));
            if (+creditAmount > 0) {
                event.originalEvent.dataTransfer.setData('transactionAmount', creditAmount.toString());
                event.originalEvent.dataTransfer.setData('transactionType', 'credit');
            } else {
                event.originalEvent.dataTransfer.setData('transactionAmount', debitAmount.toString());
                event.originalEvent.dataTransfer.setData('transactionType', 'debit');
            }

        });

        $('#transaction-table').on('dragstop', '.js-transaction-record', function (event) {
            $('.js-group-table tr').removeClass('group-row--drop');
        });

        $('.js-group-table').on('dragover', '.js-group-row', function (event) {
            $('.js-group-table tr').removeClass('group-row--drop');
            $(this).addClass('group-row--drop');
            var transactionType = event.originalEvent.dataTransfer.getData('transactionType');
            if (transactionType && transactionType == $(this).attr('data-group-type')) {
                return true;
            }
            return false;
        });

        $('.js-group-table').on('drop', '.js-group-row', function (event) {
            event.preventDefault();
            $('.js-group-table tr').removeClass('group-row--drop');
            let amount = parseFloat(event.originalEvent.dataTransfer.getData('transactionAmount'));
            var transactionType = event.originalEvent.dataTransfer.getData('transactionType');
            let sourceMappingId = event.originalEvent.dataTransfer.getData('mappingId');
            let targetMappingId = $(this).attr('data-mapping-id');
            let sourceGroupDetails, targetGroupDetails;

            if (transactionType == 'credit') {
                sourceGroupDetails = groupDetails.receipts[sourceMappingId.toString()];
                targetGroupDetails = groupDetails.receipts[targetMappingId.toString()];
            } else {
                sourceGroupDetails = groupDetails.payments[sourceMappingId.toString()];
                targetGroupDetails = groupDetails.payments[targetMappingId.toString()];
            }

            sourceGroupDetails.amount -= amount;
            --sourceGroupDetails.totalTransactions;
            targetGroupDetails.amount += amount;
            ++targetGroupDetails.totalTransactions;

            let selectedTransaction = event.originalEvent.dataTransfer.getData('selectedTransaction');

            groupTransactions[targetMappingId.toString()].push(JSON.parse(selectedTransaction));

            let selectedGroupTransactions = groupTransactions[sourceMappingId.toString()];
            populateGroupTransactions(selectedGroupTransactions, sourceMappingId, $(this).attr('data-group-type'));

            $(this).find('.js-group-amount').text(targetGroupDetails.amount.toFixed(2));
            $(this).find('.js-total-transactions').text(targetGroupDetails.totalTransactions);

            $(this).siblings('tr[data-mapping-id="' + sourceMappingId + '"]').find('.js-group-amount').text(sourceGroupDetails.amount.toFixed(2));
            $(this).siblings('tr[data-mapping-id="' + sourceMappingId + '"]').find('.js-total-transactions').text(sourceGroupDetails.totalTransactions);

        });

        $('#payment-group-add-btn').on('click', function () {
            let newPaymentGroup = {
                amount: 0,
                totalTransactions: 0,
                particular: 'dummy'
            }
            let mappingId = Object.keys(groupDetails.receipts).length + Object.keys(groupDetails.payments).length + 2;
            $('#payment-table').append(
                '<tr data-mapping-id="' + mappingId + '" class="js-group-row" data-group-type="debit">' +
                '<td contenteditable="true" class="js-group-particular">' + newPaymentGroup.particular + '</td>' +
                '<td class="js-group-amount">' + newPaymentGroup.amount.toFixed(2) + '</td>' +
                '<td class="js-total-transactions">' + newPaymentGroup.totalTransactions + '</td>' +
                '</tr'
            )
            groupTransactions[mappingId.toString()] = [];
            groupDetails.payments[mappingId.toString()] = newPaymentGroup;
        });


        $('#receipt-group-add-btn').on('click', function () {
            let newPaymentGroup = {
                amount: 0,
                totalTransactions: 0,
                particular: 'dummy'
            }
            let mappingId = Object.keys(groupDetails.receipts).length + Object.keys(groupDetails.payments).length + 1;
            $('#receipt-table').append(
                '<tr data-mapping-id="' + mappingId + '" class="js-group-row" data-group-type="credit">' +
                '<td contenteditable="true" class="js-group-particular">' + newPaymentGroup.particular + '</td>' +
                '<td class="js-group-amount">' + newPaymentGroup.amount.toFixed(2) + '</td>' +
                '<td class="js-total-transactions">' + newPaymentGroup.totalTransactions + '</td>' +
                '</tr'
            )
            groupTransactions[mappingId.toString()] = [];
            groupDetails.receipts[mappingId.toString()] = newPaymentGroup;
        });


        populateData();
    }

    this.getHtmlContent = function(){
        return consolidationViewerHtml;
    }
}

export default ConsolidationViewer;