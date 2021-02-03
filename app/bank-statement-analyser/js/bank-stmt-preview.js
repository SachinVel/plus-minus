const {bankStatementAnalyser} = require("../js/analyser");
const ExcelJS = require('exceljs');


const BankStmtPreview = new function(){
    const getFileContent = function(filePath){

        return new Promise(async (resolve,reject)=>{
            let workbook = new ExcelJS.Workbook(); 
            await workbook.xlsx.readFile(filePath);
            
            let worksheet = workbook.getWorksheet(1);
            
            let rowValues = [];
            worksheet.getRows(0,worksheet.rowCount+1).forEach(row=>{ rowValues.push(row.values)});
            resolve(rowValues);
        });
        
    }

    const getCellValue = function(cell){
        if( typeof cell==="object" ){
            if( cell.richText ){
                return cell.richText[0].text;
            }
        }
        return cell;

    }

    const populateData = function( rows ){
        let tableElem = $("#bank-stmt-table");

        let colMaxLen = -1;
        rows.forEach(row => {
            if( row.length>colMaxLen ){
                colMaxLen = row.length;
            }
        });

        let headerContent = $("<tr></tr>");
        headerContent.append( '<th></th>' );
        let colName = 'A';
        for(let colNum=1 ; colNum<=colMaxLen ; ++colNum ){
            headerContent.append( '<th>'+colName+'</th>' );
            colName = String.fromCharCode(colName.charCodeAt(0)+1);
        }

        tableElem.append(
            headerContent
        );

        // tableContent += headerContent;

        let rowInd=1;
        rows.forEach(row => {
            let rowContent = $("<tr></tr>");
            rowContent.append(
                "<th>"+rowInd+"</th>"
            );
            
            for( let colInd=0 ; colInd<colMaxLen ; ++colInd ){
                colName = String.fromCharCode('A'.charCodeAt(0)+colInd);

                if( row[colInd+1] ){
                    rowContent.append(
                        "<td id="+(colName+rowInd)+">"+getCellValue(row[colInd+1])+"</td>"
                    );
                }else{
                    rowContent.append( 
                         "<td id="+(colName+rowInd)+"></td>"
                    );
                }
            }
            ++rowInd;
            tableElem.append(
                rowContent
            );
        });
    }

    const getUserInput = function(){
        return new Promise((resolve,reject)=>{
            $("#bank-stmt-table td").on('click',function(){
                let cellId = $(this).attr("id");
                console.log("Cell Id : ",cellId);
                resolve(cellId);
            });
        });
    }
    const getColumnInformation = async function(){
        let columInfo={};
        $("#user-prompt").text("Click on Description Column Header");
        await getUserInput().then((cellId)=>{
            columInfo.descCellId = cellId;
        });

        $("#user-prompt").text("Click on Date Column Header");
        await getUserInput().then((cellId)=>{
            columInfo.dateCellId = cellId;
        });

        $("#user-prompt").text("Click on Credit Column Header");
        await getUserInput().then((cellId)=>{
            columInfo.credtiCellId = cellId;
        });

        $("#user-prompt").text("Click on Debit Column Header");
        await getUserInput().then((cellId)=>{
            columInfo.debitCellId = cellId;
        });

        $("#user-prompt").text("Click on Balance Column Header");
        await getUserInput().then((cellId)=>{
            columInfo.balanceCellId = cellId;
        });

        console.log("CEll ID : ",columInfo);
        return columInfo;
    }

    this.init = function(){
        let filePath = localStorage.getItem("filePath");

        getFileContent(filePath).then(async function(rows){
            console.log("rows ",rows);
            populateData(rows);
            let columnInfo = await getColumnInformation();

            bankStatementAnalyser.anaylseContent(rows,columnInfo).then((consolidationData)=>{
                localStorage.setItem("consolidationData",JSON.stringify(consolidationData));
                window.location.href = "consolidation-view.html";
                localStorage.removeItem("filePath");
            }).catch(error=>{
                console.error("Error in analysing bank statement : ",error);
            });
        });

        $("#back-icon").on('click',function(){
            window.location.href = "import-file.html";
        });

        

    }
}