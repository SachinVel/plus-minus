import ImportFile from './renderer/windows/import-file/import-file';
import BankStatementPreview from './renderer/windows/bank-statement-preview/bank-stmt-preview';
import ConsolidationViewer from './renderer/windows/consolidation-viewer/consolidation-viewer';

window.onload = function(){
    $('body').html(
        ImportFile.getHtmlContent()
    );
    ImportFile.init();
}

const Index = new function(){

    this.navigateTo = function(location){
        switch(location){
            case 'import-file':
                $('body').html(
                    ImportFile.getHtmlContent()
                );
                ImportFile.init();
            break;
            case 'bank-statement-preview':
                $('body').html(
                    BankStatementPreview.getHtmlContent()
                );
                BankStatementPreview.init();
            break;
            case 'consolidation-viewer':
                $('body').html(
                    ConsolidationViewer.getHtmlContent()
                );
                ConsolidationViewer.init();
            break;
        }
    }
}

export default Index;