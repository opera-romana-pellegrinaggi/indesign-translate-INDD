//ExportStoriesI18nJson.jsx
//An InDesign JavaScript
#include "../es5-shim.js"
#include "../es6-shim.js"

main();
function main(){
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    if(app.documents.length != 0){
        if (app.activeDocument.stories.length != 0){
            myDisplayDialog();
        }
        else{
            alert("The document does not contain any stories. Please run this script on a document with stories.");
        }
    }
    else{
        alert("No documents are open. Please open a document and try again.");
    }
}

function progress(steps) {
    win = new Window("palette", "Progress", [150, 150, 800, 260], {closeButton: false});
    win.pnl = win.add("panel", [10, 10, 640, 100], "Script Progress");
    win.pnl.progBar = win.pnl.add("progressbar", [20, 35, 610, 60], 0, steps);
    win.pnl.progBarLabel = win.pnl.add("statictext", [20, 20, 610, 35], "0%");
    win.center();
    progress.close = function() {
        win.close();
    };
    progress.increment = function() {
        win.pnl.progBar.value++;
        win.update();
    };
    progress.message = function(message) {
        win.pnl.progBarLabel.text = message;
        win.update();
    };
    win.show();
}

function myDisplayDialog(){

    exportLangs = [
        'en',
        'fr',
        'de',
        'it',
        'pt',
        'es'
    ];
    myLocale = $.locale.split('_')[0];

    with(myDialog = app.dialogs.add({name:"Export Stories to I18n JSON format"})){
        myDialogColumn = dialogColumns.add()
        with(myDialogColumn){
            with(borderPanels.add()){
                with(dialogRows.add()){
                    staticTexts.add({staticLabel:"Please specify the source language of this document (probably " + myLocale + "?):"});
                }
                with(dialogRows.add()){
                    with(mySourceLangButtons = radiobuttonGroups.add()){
                        radiobuttonControls.add({staticLabel:"English", checkedState:(myLocale === 'en')});
                        radiobuttonControls.add({staticLabel:"French", checkedState:(myLocale === 'fr')});
                        radiobuttonControls.add({staticLabel:"German", checkedState:(myLocale === 'de')});
                        radiobuttonControls.add({staticLabel:"Italian", checkedState:(myLocale === 'it')});
                        radiobuttonControls.add({staticLabel:"Portuguese", checkedState:(myLocale === 'pt')});
                        radiobuttonControls.add({staticLabel:"Spanish", checkedState:(myLocale === 'es')});
                    }
                }
            }
        }
        myReturn = myDialog.show();

        if (myReturn === true){
            exportLang = exportLangs[mySourceLangButtons.selectedButton];
            myDialog.destroy();
            myI18nProjectFolderFullPath = app.activeDocument.extractLabel('myI18nProjectFolder');
            myI18nProjectFolderPath = myI18nProjectFolderFullPath.substr(0,myI18nProjectFolderFullPath.lastIndexOf('/'));
            myI18nProjectFolder = Folder(myI18nProjectFolderPath).selectDlg("Where should we save the exported JSON file? Choose a project folder, not a language subfolder.");
            if((myI18nProjectFolder !== null)&&(app.activeDocument.stories.length > 0)){
                myI18nProjectFolderFullPath = myI18nProjectFolder + '/' + exportLang;
                if( app.activeDocument.extractLabel('myI18nProjectFolder') === '' || app.activeDocument.extractLabel('myI18nProjectFolder') !== myI18nProjectFolderFullPath ) {
                    $.writeln( 'now writing label "myI18nProjectFolder" to document with value "' + myI18nProjectFolderFullPath + '"' );
                    app.activeDocument.insertLabel('myI18nProjectFolder', myI18nProjectFolderFullPath);
                    app.activeDocument.save();
                }
                exportStoriesToJSON( myI18nProjectFolderFullPath );
            }
        }
        else{
            myDialog.destroy();
        }
    }
}

function exportStoriesToJSON (exportFolder) {
    translationObj = {};
    storiesCount = app.activeDocument.stories.length;
    progress(storiesCount);
    for(myCounter = 0; myCounter < storiesCount; myCounter++) {
        myStory = app.activeDocument.stories.item(myCounter);
        progress.message('Extracting story ' + myCounter + '...');
        if( /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(myStory.contents) ) {
            myStoryId = 'story_' + myStory.id;
            translationObj[myStoryId] = {};
            myTextStyleRanges = myStory.textStyleRanges;
            for(textRangeCounter = 0; textRangeCounter < myTextStyleRanges.length; textRangeCounter++) {
                myTextRange = myTextStyleRanges[textRangeCounter];
                myTextRangeContents = myTextRange.contents;
                if( /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(myTextRangeContents) ) {
                    translationObj[myStoryId]['tsr_'+textRangeCounter] = myTextRangeContents.trim();
                }
            }
        }
        progress.increment();
    }
    progress.message( 'Writing file ' + exportFolder + "/translation.json ...");
    //$.writeln( 'finished reading stories' );
    fileContents = JSON.stringify( translationObj, null, 4 );
    //$.writeln( fileContents );
    myFile = new File(exportFolder + "/translation.json");
    writeFile( myFile, fileContents, "utf-8" );
    progress.increment();
    progress.close();
    alert(myFile + " saved!");

}

function writeFile(fileObj, fileContent, encoding) {
    encoding = encoding || "utf-8";
    fileObj = (fileObj instanceof File) ? fileObj : new File(fileObj);
    var parentFolder = fileObj.parent;
    if (!parentFolder.exists && !parentFolder.create())
        throw new Error("Cannot create file in path " + fileObj.fsName);
    fileObj.encoding = encoding;
    fileObj.open("w");
    fileObj.write(fileContent);
    fileObj.close();
    return fileObj;
}
