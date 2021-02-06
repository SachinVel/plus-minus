const { bankStatementAnalyser } = require("../js/analyser");
const ExcelJS = require('exceljs');
const toast = require('../../common/js/toast');

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

    const getCellValue = function (cell) {
        if (typeof cell === "object") {
            if (cell.richText) {
                return cell.richText[0].text;
            }
        }
        return cell;
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
                        '<td id="' + (colName + rowInd) + '" class="cell js-cell">' + getCellValue(row[colInd + 1]) + '</td>'
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

    this.init = function () {

        let filePath = localStorage.getItem("filePath");

        getFileContent(filePath).then(async function (rows) {
            populateData(rows);
            let columnHeaderInfo = await getColumnHeaderInformation();
            let popupMessage = `Selected header contents are ${columnHeaderInfo.headerNames}Are you sure you want to continue?`;
            popup.display(popupMessage, {
                success: function () {
                    let consolidationData = bankStatementAnalyser.anaylseContent(rows, columnHeaderInfo.headerCells)
                    localStorage.setItem("consolidationData", JSON.stringify(consolidationData));
                    window.location.href = "consolidation-view.html";
                    localStorage.removeItem("filePath");
                },
                reject: function () {
                    window.location.reload();
                }
            })
        });

        $("#back-icon").on('click', function () {
            window.location.href = "import-file.html";
        });

    }
}