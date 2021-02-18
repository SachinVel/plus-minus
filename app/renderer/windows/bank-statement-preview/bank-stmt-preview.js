import bankStatementAnalyser from "../../server/analyser/analyser";
import './bank-stmt-preview.css';
import toast from "../../utils/toast/toast";
const XLSX = require('xlsx');

window.onload = function () {
    BankStmtPreview.init();
}

const BankStmtPreview = new function () {
    let worksheet, columnHeaderInfo;

    const getFileContent = function (filePath) {
        return new Promise(async (resolve, reject) => {
            let excelFile = XLSX.readFile(filePath);

            if (excelFile.SheetNames.length > 1) {
                reject('Upload the excel file containing a single sheet');
            }

            let firstSheetIndex = 0;
            let sheetname = excelFile.SheetNames[firstSheetIndex];
            let sheetContent = excelFile.Sheets[sheetname];

            resolve(sheetContent);

        });
    }

    const parseBankData = function (rows, bankDataColumnIndexes) {

        //filter rows that have only tranasaction record
        rows = rows.filter(function (row) {
            let transactionKeys = ['date', 'description', 'balance'];
            transactionKeys.forEach((key) => {
                if (row[bankDataColumnIndexes[key]] != null) {
                    if (typeof row[bankDataColumnIndexes[key]] === 'string' && row[bankDataColumnIndexes[key]].trim().length == 0) {
                        return false;
                    }
                } else {
                    return false;
                }
            });

            if ((row[bankDataColumnIndexes.credit] == null && row[bankDataColumnIndexes.debit] == null)) {
                return false;
            }

            return true;
        });

        // if transaction data is in reverse order, then sort by date
        if (rows[0][bankDataColumnIndexes.date] > rows[rows.length - 1][bankDataColumnIndexes.date]) {
            rows.sort(function (row1, row2) {
                if (row1[bankDataColumnIndexes.date] == row2[bankDataColumnIndexes.date]) {
                    //if two transaction dates are equal then the below is
                    return row2[bankDataColumnIndexes.date] - (row1[bankDataColumnIndexes.date] + 1);
                }
                return row1[bankDataColumnIndexes.date] - row2[bankDataColumnIndexes.date]
            });
        }

        //convert credit, debit, balance to number type.
        rows.forEach(row => {
            let transactionKeys = ['credit', 'debit', 'balance'];
            transactionKeys.forEach((key)=>{
                if (typeof row[bankDataColumnIndexes[key]] === 'string') {
                    let numStr = row[bankDataColumnIndexes[key]].replace(/[,\s]/g, '');
                    row[bankDataColumnIndexes[key]] = numStr.length > 0 ? parseFloat(numStr) : 0;
                }
            }); 
        });

        return rows;

    }

    const populateData = function (sheetContent) {

        //gets all values as string type since raw:false
        let rows = XLSX.utils.sheet_to_json(sheetContent, { header: 1, raw: false, dateNF: 'yyyy-mm-dd', blankrows: false });

        let tableElem = $('#bank-stmt-table');

        //populate table with cellId as id for <td>
        let colMaxLen = -1;
        rows.forEach(row => {
            if (row.length > colMaxLen) {
                colMaxLen = row.length;
            }
        });

        let headerContent = $('<tr></tr>');
        headerContent.append('<th></th>');
        let colName = 'A';
        for (let colNum = 0; colNum < colMaxLen; ++colNum) {
            headerContent.append('<th>' + colName + '</th>');
            colName = String.fromCharCode(colName.charCodeAt(0) + 1);
        }
        tableElem.append(
            headerContent
        );

        let rowInd = 1;
        rows.forEach(row => {
            let rowContent = $('<tr></tr>');
            rowContent.append(
                '<th>' + rowInd + '</th>'
            );

            for (let colInd = 0; colInd < colMaxLen; ++colInd) {
                colName = String.fromCharCode('A'.charCodeAt(0) + colInd);

                if (row[colInd]) {
                    rowContent.append(
                        '<td id="' + (colName + rowInd) + '" class="cell js-cell">' + row[colInd] + '</td>'
                    );
                } else {
                    rowContent.append(
                        '<td id="' + (colName + rowInd) + '"  class="cell js-cell"></td>'
                    );
                }
            }
            ++rowInd;
            tableElem.append(
                rowContent
            );
        });
    }

    const getUserInput = function (columHeaderCells) {
        //checks for cell click and selected header remove event
        return new Promise((resolve, reject) => {
            //resolves when cell is clicked
            //rejects when selected header remove is clicked.
            let dataHeaders = ['date', 'description', 'debit', 'credit', 'balance'];
            let curHeader;
            let ind = 0;
            while (ind < dataHeaders.length && columHeaderCells[dataHeaders[ind]]) {
                ++ind;
            }
            let proceedBtnElem = $('#proceed-btn');

            $('.js-cell').off('click');
            $('.js-select-name-remove').off('click');

            if (ind >= dataHeaders.length) {
                //all headers are selected 
                $('#user-prompt').text('Click Proceed to continue');
                if (proceedBtnElem.hasClass('js-btn-inactive')) {
                    proceedBtnElem.removeClass('js-btn-inactive');
                    proceedBtnElem.removeClass('btn-inactive');
                }
                $('.js-select-name-remove').on('click', function () {
                    let headerSelectParent = $(this).closest('.js-header-select');
                    let headerName = headerSelectParent.attr('data-header-name');
                    $('#' + headerName + '-header .js-selected-content').hide();
                    reject({
                        headerName: headerName
                    });
                    toast('success', `${headerName} header has been removed`);
                    //remove selected cell class in table
                    let cellId = $('#' + headerName + '-header .js-selected-content').attr('data-cell-id');
                    $('#' + cellId).removeClass('selected-cell');
                    $('#' + cellId).removeClass('js-selected-cell');
                });
                columnHeaderInfo = columHeaderCells;
            } else {
                //some headers are not selected 
                if (!proceedBtnElem.hasClass('js-btn-inactive')) {
                    proceedBtnElem.addClass('js-btn-inactive');
                    proceedBtnElem.addClass('btn-inactive');
                }
                curHeader = dataHeaders[ind];
                $('#user-prompt').text(`Select the ${curHeader.toUpperCase()} Column Header`);
                $('.js-cell').on('click', function () {
                    if (!$(this).hasClass('js-selected-cell')) {
                        $(this).addClass('js-selected-cell');
                        $(this).addClass('selected-cell');
                        toast('success', `${curHeader} header has been selected`);
                        $('#' + curHeader + '-header .js-selected-content').show();
                        $('#' + curHeader + '-header .js-selected-content').attr('data-cell-id', $(this).attr('id'));
                        $('#' + curHeader + '-header .js-selected-name-content').text((this).innerText);
                        resolve({
                            cellId: $(this).attr('id'),
                            headerName: curHeader
                        });
                    }
                });
                $('.js-select-name-remove').on('click', function () {
                    let headerSelectParent = $(this).closest('.js-header-select');
                    let headerName = headerSelectParent.attr('data-header-name');
                    $('#' + headerName + '-header .js-selected-content').hide();
                    let cellId = $('#' + headerName + '-header .js-selected-content').attr('data-cell-id');
                    $('#' + cellId).removeClass('selected-cell');
                    $('#' + cellId).removeClass('js-selected-cell');
                    reject({
                        headerName: headerName
                    });
                    toast('success',  `Selected ${headerName} header has been removed`);
                });
            }

        });
    }

    const getColumnHeaderInformation = function (columHeaderCells = {}) {
        getUserInput(columHeaderCells).then((data) => {
            columHeaderCells[data.headerName] = data.cellId;
            getColumnHeaderInformation(columHeaderCells);
        }).catch((data) => {
            columHeaderCells[data.headerName] = null;
            getColumnHeaderInformation(columHeaderCells);
        });
    }

    const getColumnIndices = function (columnHeaderCells) {

        let descriptionColId = /[A-Z]+/g.exec(columnHeaderCells.description)[0];
        let descColInd = +descriptionColId.charCodeAt(0) - 'A'.charCodeAt(0);

        let dateColId = /[A-Z]+/g.exec(columnHeaderCells.date)[0];
        let dateColInd = +dateColId.charCodeAt(0) - 'A'.charCodeAt(0);

        let creditColId = /[A-Z]+/g.exec(columnHeaderCells.credit)[0];
        let creditColInd = +creditColId.charCodeAt(0) - 'A'.charCodeAt(0);

        let debitColId = /[A-Z]+/g.exec(columnHeaderCells.debit)[0];
        let debitColInd = +debitColId.charCodeAt(0) - 'A'.charCodeAt(0);

        let balanceColId = /[A-Z]+/g.exec(columnHeaderCells.balance)[0];
        let balanceColInd = +balanceColId.charCodeAt(0) - 'A'.charCodeAt(0);

        return {
            description: descColInd,
            credit: creditColInd,
            debit: debitColInd,
            date: dateColInd,
            balance: balanceColInd
        }

    }

    const proceedToAnalyse = function () {

        let bankDataColumnIndexes = getColumnIndices(columnHeaderInfo);
        let headersIndex = +/[0-9]+/g.exec(columnHeaderInfo.description)[0];

        let rawContent = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: null });
        rawContent.splice(0, headersIndex);
        rawContent = parseBankData(rawContent, bankDataColumnIndexes);

        let consolidationData = bankStatementAnalyser.anaylseContent(rawContent, bankDataColumnIndexes);
        localStorage.setItem('consolidationData', JSON.stringify(consolidationData));
        window.location.href = './consolidation-viewer.html';
        localStorage.removeItem('filePath');

    }

    this.init = function () {

        let filePath = localStorage.getItem('filePath');

        $('#proceed-btn').on('click', function () {
            //if btn has js-btn-inactive,then some headers are not selected
            if (!$(this).hasClass('js-btn-inactive')) {
                proceedToAnalyse();
            }
        });

        getFileContent(filePath).then(async function (sheetContent) {
            worksheet = sheetContent;
            populateData(sheetContent);
            getColumnHeaderInformation();
        }).catch((errorMsg) => {
            toast('error', errorMsg);
        });

        $('#back-icon').on('click', function () {
            window.location.href = './import-file.html';
        });

    }
}