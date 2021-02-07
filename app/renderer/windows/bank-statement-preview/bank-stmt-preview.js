import popup from "../../utils/popup/popup";
import bankStatementAnalyser from "../../server/analyser/analyser";
import './bank-stmt-preview.css';
import toast from "../../utils/toast/toast";

window.onload = function () {
    BankStmtPreview.init();
}
const BankStmtPreview = new function () {
    const getFileContent = function (filePath) {

        return new Promise(async (resolve, reject) => {

            let workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);

            let worksheet = workbook.getWorksheet(1);

            let rowValues = [];
            worksheet.getRows(0, worksheet.rowCount + 1).forEach(row => { rowValues.push(row.values) });
            resolve(rowValues);

        });

    }

    const processBankData = function (rows) {
        let processedRows = [];
        rows.forEach(row => {
            let processedRow = [];
            for (let ind = 0; ind < row.length; ++ind) {
                let cell = row[ind];
                if (typeof cell === "object") {
                    if (cell.richText) {
                        processedRow[ind] = cell.richText[0].text;
                    }
                } else {
                    processedRow[ind] = cell;
                }
            }
            processedRows.push(processedRow);
        });
        return processedRows;
    }

    const parseBankData = function (rows, bankDataColumnIndexes) {

        rows = rows.filter(row => (row[bankDataColumnIndexes.credit] != null && row[bankDataColumnIndexes.debit] != null
            && row[bankDataColumnIndexes.balance] != null));

        rows.forEach(row => {
            if (typeof row[bankDataColumnIndexes.credit] === 'string') {
                row[bankDataColumnIndexes.credit] = parseFloat(row[bankDataColumnIndexes.credit].replace(/,/g, ''));
            }
            if (typeof row[bankDataColumnIndexes.debit] === 'string') {
                row[bankDataColumnIndexes.debit] = parseFloat(row[bankDataColumnIndexes.debit].replace(/,/g, ''));
            }
            if (typeof row[bankDataColumnIndexes.balance] === 'string') {
                row[bankDataColumnIndexes.balance] = parseFloat(row[bankDataColumnIndexes.balance].replace(/,/g, ''));
            }
        });

        return rows;

    }

    const populateData = function (rows) {

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
        for (let colNum = 1; colNum <= colMaxLen; ++colNum) {
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

            for (let colInd = 0; colInd < colMaxLen; ++colInd) {
                colName = String.fromCharCode('A'.charCodeAt(0) + colInd);

                if (row[colInd + 1]) {
                    rowContent.append(
                        '<td id="' + (colName + rowInd) + '" class="cell js-cell">' + row[colInd + 1] + '</td>'
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
        let descColInd = +descriptionColId.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

        let dateColId = /[A-Z]+/g.exec(columnHeaderCells.dateCellId)[0];
        let dateColInd = +dateColId.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

        let creditColId = /[A-Z]+/g.exec(columnHeaderCells.credtiCellId)[0];
        let creditColInd = +creditColId.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

        let debitColId = /[A-Z]+/g.exec(columnHeaderCells.debitCellId)[0];
        let debitColInd = +debitColId.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

        let balanceColId = /[A-Z]+/g.exec(columnHeaderCells.balanceCellId)[0];
        let balanceColInd = +balanceColId.charCodeAt(0) - 'A'.charCodeAt(0) + 1;

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

        getFileContent(filePath).then(async function (rows) {

            rows = processBankData(rows);
            populateData(rows);
            let columnHeaderInfo = await getColumnHeaderInformation();
            let bankDataColumnIndexes = getColumnIndices(columnHeaderInfo.headerCells);
            let headersIndex = +/[0-9]+/g.exec(columnHeaderInfo.headerCells.descCellId)[0];
            rows.splice(0, headersIndex + 1);
            rows = parseBankData(rows, bankDataColumnIndexes);
            console.log("rows : ", rows);
            let popupMessage = `Selected header contents are ${columnHeaderInfo.headerNames}Are you sure you want to continue?`;
            popup.display(popupMessage, {
                success: function () {
                    let consolidationData = bankStatementAnalyser.anaylseContent(rows, bankDataColumnIndexes);
                    localStorage.setItem("consolidationData", JSON.stringify(consolidationData));
                    window.location.href = "./consolidation-view.html";
                    localStorage.removeItem("filePath");
                },
                reject: function () {
                    window.location.reload();
                }
            })
        });

        $("#back-icon").on('click', function () {
            window.location.href = "./import-file.html";
        });

    }
}