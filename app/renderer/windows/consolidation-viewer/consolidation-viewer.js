import './consolidation-viewer.css';
const XLSX = require('xlsx');
const path = require('path');
const electron = require('electron');
const dialog = electron.remote.dialog;

window.onload = function () {
    ConsolidationViewer.init();
}

const ConsolidationViewer = new function () {
    let groupDetails, groupTransactions, amountDetails, accountNumber, bankName, bankDataColumnIndexes;

    this.init = function () {
        accountNumber = localStorage.getItem('accountNumber');
        bankName = localStorage.getItem('bankName');
        $('#account-number-value').text(bankName + ' - ' + accountNumber);
        let consolidationData = JSON.parse(localStorage.getItem('consolidationData'));
        console.log(consolidationData);

        localStorage.clear();
        if (consolidationData) {
            groupDetails = consolidationData.groupDetails;
            groupTransactions = consolidationData.groupTransactions;
            amountDetails = consolidationData.amountDetails;
            bankDataColumnIndexes = consolidationData.bankDataColumnIndexes;
        }

        $('#back-icon').on('click', () => {
            window.location.href = './import-file.html';
        });

        exportData();
        showGroupsTransaction();
        dragAndDropTransactionRecord();
        addNewGroup();
        populateData();
    }

    const exportData = () => {
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
                }
            }).catch(err => {
                console.error(err)
            });
        });
    };

    const addNewGroup = () => {
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
                '</tr>'
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
                '</tr>'
            )
            groupTransactions[mappingId.toString()] = [];
            groupDetails.receipts[mappingId.toString()] = newPaymentGroup;
        });
    }

    const showGroupsTransaction = () => {
        $('.js-group-table').on('click', '.js-group-row', function () {
            $('.js-group-table tr').removeClass('group-row--selected');
            $(this).addClass('group-row--selected');
            let mappingId = $(this).attr('data-mapping-id');
            let selectedGroupTransactions = groupTransactions[mappingId.toString()];
            populateGroupTransactions(selectedGroupTransactions, mappingId, $(this).attr('data-group-type'));
        });
    }

    const dragAndDropTransactionRecord = () => {
        $('#transaction-table').on('dragstart', '.js-transaction-record', function (event) {
            let sourceMappingId = $(this).closest('table').attr('data-mapping-id');
            let creditAmount = $(this).find('.js-transaction-credit-amt').text();
            let debitAmount = $(this).find('.js-transaction-debit-amt').text();
            let selectedTransactionIndex = $(this).index();
            let selectedTransaction = groupTransactions[sourceMappingId.toString()][selectedTransactionIndex - 1];
            groupTransactions[sourceMappingId.toString()].splice(selectedTransactionIndex - 1, 1);

            event.originalEvent.dataTransfer.setData('mappingId', sourceMappingId);
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
    };

    const moveTransactionRecordsListener = (transactionType, sourceMappingId, amountIndex) => {
        let selectedTransactionsIndex = [];
        $('#move-debit-transaction, #move-credit-transaction').hide().off('click');

        $('.checkbox').off('change').on('change', function () {
            if (this.checked) {
                selectedTransactionsIndex.push($(this).attr('data-index'));
            } else {
                selectedTransactionsIndex = selectedTransactionsIndex.filter((selectedTransactionIndex) => selectedTransactionIndex !== $(this).attr('data-index'));
            }
            if (selectedTransactionsIndex.length >= 1) {
                $(`#move-${transactionType}-transaction`).show();
            } else {
                $(`#move-${transactionType}-transaction`).hide();
            }
        });
        
        $(`#move-${transactionType}-transaction`).on('click', function () {
            $('.js-group-table').off('click');
            $('.js-group-table').on('click', '.js-group-row', function () {
                let targetMappingId = $(this).attr('data-mapping-id');
                let sourceGroupDetails, targetGroupDetails, amount = 0;

                let selectedTransaction = selectedTransactionsIndex.map((selectedTransactionIndex) => {
                    let selectedTransaction = groupTransactions[sourceMappingId.toString()][selectedTransactionIndex];
                    amount += +selectedTransaction[amountIndex];
                    return selectedTransaction;
                })

                // Note: Do not put the splice function in the above loop as it will mess with the indexes.
                selectedTransactionsIndex.forEach((selectedTransactionIndex) => {
                    groupTransactions[sourceMappingId.toString()].splice(selectedTransactionIndex, 1)
                });

                if (transactionType == 'credit') {
                    sourceGroupDetails = groupDetails.receipts[sourceMappingId.toString()];
                    targetGroupDetails = groupDetails.receipts[targetMappingId.toString()];
                } else {
                    sourceGroupDetails = groupDetails.payments[sourceMappingId.toString()];
                    targetGroupDetails = groupDetails.payments[targetMappingId.toString()];
                }

                sourceGroupDetails.amount -= amount;
                sourceGroupDetails.totalTransactions -= selectedTransactionsIndex.length;
                targetGroupDetails.amount += amount;
                targetGroupDetails.totalTransactions += selectedTransactionsIndex.length;

                groupTransactions[targetMappingId.toString()].push(...selectedTransaction);

                let selectedGroupTransactions = groupTransactions[sourceMappingId.toString()];
                populateGroupTransactions(selectedGroupTransactions, sourceMappingId, $(this).attr('data-group-type'));

                $(this).find('.js-group-amount').text(targetGroupDetails.amount.toFixed(2));
                $(this).find('.js-total-transactions').text(targetGroupDetails.totalTransactions);
                $(this).siblings('tr[data-mapping-id="' + sourceMappingId + '"]').find('.js-group-amount').text(sourceGroupDetails.amount.toFixed(2));
                $(this).siblings('tr[data-mapping-id="' + sourceMappingId + '"]').find('.js-total-transactions').text(sourceGroupDetails.totalTransactions);
                $('.js-group-table').off('click');
                showGroupsTransaction();
            });
        })
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
                '</tr>'
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

    const writeToCell = function (worksheet, cellAddr, content) {
        worksheet[cellAddr] = {};
        worksheet[cellAddr].v = content;
    }

    const writeToFile = function (filePath) {
        let workbook = XLSX.utils.book_new();

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
        let worksheet = XLSX.utils.json_to_sheet([]);

        //merge cells content - 0 index
        let mergeCells = [
            //b2 to d3 merge
            { s: { r: 1, c: 1 }, e: { r: 2, c: 3 } },

        ];
        worksheet['!merges'] = mergeCells;

        let wscols = [
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

        for (let key of Object.keys(groupDetails.receipts)) {
            if (receipts[key].amount == 0) {
                continue;
            }
            if (curInd != receiptsLength) {
                rowData = [receipts[key].particular, receipts[key].amount];
            } else {
                rowData = [receipts[key].particular, receipts[key].amount, amountDetails.receiptTotalAmount];
            }
            receiptsData.push(rowData);
            ++curInd;
        }
        XLSX.utils.sheet_add_aoa(worksheet, receiptsData, { origin: 'B12' });

        let nextRowInd = 11 + receiptsLength + 2;

        writeToCell(worksheet, 'B' + nextRowInd, 'TOTAL AMOUNT AVAILABLE (C)=(A)+(B)');
        writeToCell(worksheet, 'D' + nextRowInd, +amountDetails.openingBalance + amountDetails.receiptTotalAmount);

        nextRowInd += 2;

        writeToCell(worksheet, 'B' + nextRowInd, 'Payments (D)');

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
        paymentsData.push(['CLOSING BALANCE (E)=(C)-(D)', '', amountDetails.closingBalance]);

        XLSX.utils.sheet_add_aoa(worksheet, paymentsData, { origin: 'B' + nextRowInd });

        workbook.Sheets['Sheet1'] = worksheet;

        XLSX.writeFile(workbook, filePath);
    }

    const populateGroupTransactions = function (transactionData, mappingId, dataGroupType) {
        let transactionTable = $('#transaction-table');
        transactionTable.attr('data-mapping-id', mappingId);
        transactionTable.empty();
        transactionTable.append(
            '<tr>' +
            '<th></th>' +
            '<th>Date</th>' +
            '<th>Description</th>' +
            `<th>${dataGroupType.charAt(0).toUpperCase() + dataGroupType.slice(1)}</th>` +
            '</tr>'
        );
        transactionData.forEach((transRecord, index) => {
            transactionTable.append(
                '<tr draggable="true" class="js-transaction-record">' +
                `<td><input type=checkbox style="width:50px" class="checkbox" data-index=${index}></td>` +
                '<td>' + transRecord[bankDataColumnIndexes.date] + '</td>' +
                '<td>' + transRecord[bankDataColumnIndexes.description] + '</td>' +
                `<td class="js-transaction-${dataGroupType}-amt">` + transRecord[bankDataColumnIndexes[dataGroupType]].toFixed(2) + '</td>' +
                '</tr>'
            )
        });

        moveTransactionRecordsListener(dataGroupType, mappingId, bankDataColumnIndexes[dataGroupType]);
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
}