const bankStatementAnalyser = require("../../server/analyser/analyser");
const XLSX = require('xlsx');
const toast = require('../../utils/toast/toast');

const BankStmtPreview = new function () {
    const getFileContent = function (filePath) {
        
        return new Promise(async (resolve, reject) => {
            let excelFile = XLSX.readFile(filePath);

            if (excelFile.SheetNames.length>1 ){
                reject("Upload excel file with single sheet");
            }

            let sheetname = excelFile.SheetNames[0];
            let sheetContent = excelFile.Sheets[sheetname];

            resolve(sheetContent);

        });

    }

    const parseBankData = function (rows, bankDataColumnIndexes) {

        rows = rows.filter(row => (row[bankDataColumnIndexes.date] != null && row[bankDataColumnIndexes.description] != null &&
            (row[bankDataColumnIndexes.credit] != null || row[bankDataColumnIndexes.debit] != null)
            && row[bankDataColumnIndexes.balance] != null));

        rows.sort(function (row1, row2) { return row1[bankDataColumnIndexes.date] - row2[bankDataColumnIndexes.date] });

        rows.forEach(row => {
            if (typeof row[bankDataColumnIndexes.credit] === 'string') {
                let numStr = row[bankDataColumnIndexes.credit].replace(/[,\s]/g, '');
                row[bankDataColumnIndexes.credit] = numStr.length > 0 ? parseFloat(numStr):0;
            }

            if (typeof row[bankDataColumnIndexes.debit] === 'string') {
                let numStr = row[bankDataColumnIndexes.debit].replace(/[,\s]/g, '');
                row[bankDataColumnIndexes.debit] = numStr.length > 0 ? parseFloat(numStr) : 0;
            }

            if (typeof row[bankDataColumnIndexes.balance] === 'string') {
                let numStr = row[bankDataColumnIndexes.balance].replace(/[,\s]/g, '');
                row[bankDataColumnIndexes.balance] = numStr.length > 0 ? parseFloat(numStr) : 0;
            }
        });

        return rows;

    }

    const populateData = function (sheetContent) {

        let rows = XLSX.utils.sheet_to_json(sheetContent, { header: 1, raw: false, dateNF: 'yyyy-mm-dd', blankrows: false });

        let tableElem = $("#bank-stmt-table");

        let colMaxLen = -1;
        rows.forEach(row => {
            if (row.length > colMaxLen) {
                colMaxLen = row.length;
            }
        });

        let headerContent = $("<tr></tr>");
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
            let rowContent = $("<tr></tr>");
            rowContent.append(
                "<th>" + rowInd + "</th>"
            );

            for (let colInd = 0; colInd <colMaxLen; ++colInd) {
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

    const getUserInput = function () {
        return new Promise((resolve, reject) => {
            $(".js-cell").on('click', function () {
                if (!$(this).hasClass("selected-cell")) {
                    resolve({
                        id: $(this).attr("id"),
                        name: $(this).text()
                    });
                    $(this).addClass("selected-cell");
                    $(".js-cell").off('click');
                }
            });

        });
    }

    const getColumnHeaderInformation = async function () {
        let columHeaderCells = {};
        let headerNames = '';

        $("#user-prompt").text("Click on Date Column Header");
        await getUserInput().then((cell) => {
            columHeaderCells.dateCellId = cell.id;
            headerNames += cell.name + ", ";
        });

        toast('success', 'Date header has been selected');

        $("#user-prompt").text("Click on Description Column Header");
        await getUserInput().then((cell) => {
            columHeaderCells.descCellId = cell.id;
            headerNames += cell.name + ", ";
        });

        toast('success', 'Description header has been selected');

        $("#user-prompt").text("Click on Debit Column Header");
        await getUserInput().then((cell) => {
            columHeaderCells.debitCellId = cell.id;
            headerNames += cell.name + ", ";
        });

        toast('success', 'Debit header has been selected');

        $("#user-prompt").text("Click on Credit Column Header");
        await getUserInput().then((cell) => {
            columHeaderCells.credtiCellId = cell.id;
            headerNames += cell.name + ", ";
        });

        toast('success', 'Credit header has been selected');

        $("#user-prompt").text("Click on Balance Column Header");
        await getUserInput().then((cell) => {
            columHeaderCells.balanceCellId = cell.id;
            headerNames += cell.name;
        });

        toast('success', 'Balance header has been selected');

        return {
            headerNames: headerNames,
            headerCells: columHeaderCells
        };
    }

    const getColumnIndices = function (columnHeaderCells) {

        let descriptionColId = /[A-Z]+/g.exec(columnHeaderCells.descCellId)[0];
        let descColInd = +descriptionColId.charCodeAt(0) - 'A'.charCodeAt(0);

        let dateColId = /[A-Z]+/g.exec(columnHeaderCells.dateCellId)[0];
        let dateColInd = +dateColId.charCodeAt(0) - 'A'.charCodeAt(0);

        let creditColId = /[A-Z]+/g.exec(columnHeaderCells.credtiCellId)[0];
        let creditColInd = +creditColId.charCodeAt(0) - 'A'.charCodeAt(0);

        let debitColId = /[A-Z]+/g.exec(columnHeaderCells.debitCellId)[0];
        let debitColInd = +debitColId.charCodeAt(0) - 'A'.charCodeAt(0);

        let balanceColId = /[A-Z]+/g.exec(columnHeaderCells.balanceCellId)[0];
        let balanceColInd = +balanceColId.charCodeAt(0) - 'A'.charCodeAt(0);

        return {
            description: descColInd,
            credit: creditColInd,
            debit: debitColInd,
            date: dateColInd,
            balance: balanceColInd
        }

    }

    this.init = function () {

        let filePath = localStorage.getItem("filePath");

        getFileContent(filePath).then( async function (sheetContent) {

            populateData(sheetContent);

            let columnHeaderInfo = await getColumnHeaderInformation();
            let bankDataColumnIndexes = getColumnIndices(columnHeaderInfo.headerCells);
            let headersIndex = +/[0-9]+/g.exec(columnHeaderInfo.headerCells.descCellId)[0];

            let rawContent = XLSX.utils.sheet_to_json(sheetContent, { header: 1, blankrows: false, defval : null});
            rawContent.splice(0, headersIndex);
            rawContent = parseBankData(rawContent, bankDataColumnIndexes);

            let popupMessage = `Selected header contents are ${columnHeaderInfo.headerNames}Are you sure you want to continue?`;
            popup.display(popupMessage, {
                success: function () {
                    let consolidationData = bankStatementAnalyser.anaylseContent(rawContent, bankDataColumnIndexes);
                    localStorage.setItem("consolidationData", JSON.stringify(consolidationData));
                    window.location.href = "../consolidation-viewer/consolidation-view.html";
                    localStorage.removeItem("filePath");
                },
                reject: function () {
                    window.location.reload();
                }
            })

        }).catch((errorMsg)=>{
            toast('error',errorMsg);
        });

        $("#back-icon").on('click', function () {
            window.location.href = "../import-file/import-file.html";
        });

    }
}