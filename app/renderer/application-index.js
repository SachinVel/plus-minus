import ImportFile from './windows/import-file/import-file';
import BankStatementPreview from './windows/bank-statement-preview/bank-stmt-preview';
import ConsolidationViewer from './windows/consolidation-viewer/consolidation-viewer';

const Index = new function () {

    let title = {
        'import-file': 'Import File',
        'bank-statement-preview': 'Bank Statement Preview',
        'consolidation-viewer': 'Consolidation Viewer'
    }

    window.onload = function () {
        $('body').html(
            ImportFile.getHtmlContent()
        );
        ImportFile.init();
        $('#page-title').text(title['import-file']);
    }

    this.navigateTo = function (location) {
        switch (location) {
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
        $('#page-title').text(title[location]);
    }
}

export default Index;