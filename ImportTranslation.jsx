#include "../es5-shim.js"
#include "../es6-shim.js"
//ImportTranslation.jsx
//An InDesign JavaScript

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

function myDisplayDialog(){
    langMap = {
        "en": "English",
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "pt": "Portuguese",
        "es": "Spanish" 
    };

    var validLangs = Object.keys(langMap);
    $.writeln( "is validLangs an array? typeof validLangs = " + typeof validLangs + ' so ' );
    if( Array.isArray( validLangs ) ) {
        $.writeln( 'validLangs does seem to be an array by Array.isArray standards' );
    }
    if( validLangs instanceof Array ) {
        $.writeln( 'validLangs does seem to be an array by instanceof standards' );
    }

    myI18nProjectFolderFullPath = app.activeDocument.extractLabel('myI18nProjectFolder');
    myI18nProjectFolderPath = myI18nProjectFolderFullPath.substr(0,myI18nProjectFolderFullPath.lastIndexOf('/'));
    myLocale = myI18nProjectFolderFullPath.substr(myI18nProjectFolderFullPath.lastIndexOf('/')+1);
    $.writeln( 'extractLabel = ' + myI18nProjectFolderFullPath + ', myI18nProjectFolderPath = ' + myI18nProjectFolderPath + ', myLocale = ' + myLocale );
    myI18nProjectFolder = new Folder(myI18nProjectFolderPath);
    translationLocaleFolders = myI18nProjectFolder.getFiles(function(file){
        langId = file.toString().split(/[\\\/]/).pop();
        return file instanceof Folder && langId !== myLocale && validLangs.indexOf( langId ) !== -1;
    });
    var langIds = [];
    for(var i = 0; i < translationLocaleFolders.length; i++) {
        langIds[i] = translationLocaleFolders[i].toString().split(/[\\\/]/).pop();
    }
    $.writeln( langIds.join(' | ') );
    with(myDialog = app.dialogs.add({name:"Import translated Stories"})){
        myDialogColumn = dialogColumns.add()
        with(myDialogColumn){
            with(borderPanels.add()){
                with(dialogRows.add()){
                    staticTexts.add({staticLabel:"From available language translation:"});
                }
                with(dialogRows.add()){
                    if( langIds.length > 0 ) {
                        with(mySourceLangButtons = radiobuttonGroups.add()){
                            for(i=0;i<langIds.length;i++){
                                radiobuttonControls.add({staticLabel:langMap[langIds[i]]});
                            }
                            radiobuttonControls.add({staticLabel:'All of the above'});
                        }
                    } else {
                        staticTexts.add({staticLabel:"!!! No language translations are currently available. Please create translations before running this script."});
                    }
                }
            }
        }
        myReturn = myDialog.show();
        if (myReturn === true) {
            if( mySourceLangButtons.selectedButton !== -1 ){
                importLangs = [];
                if( mySourceLangButtons.selectedButton !== langIds.length ) {
                    importLangs.push(langIds[mySourceLangButtons.selectedButton]);
                } else {
                    importLangs = langIds;
                }
                myDialog.destroy();
                steps = app.activeDocument.stories.length + 2;
                progress(steps);
                importLangs.forEach(function(importLang) {
                    progress.reset();
                    translationFilePath = myI18nProjectFolderPath + '/' + importLang + '/translation.json';
                    $.writeln('now importing translations from ' + myI18nProjectFolderPath + '/' + importLang + '/translation.json');
                    app.doScript('importStoriesFromJSON(importLang,translationFilePath,progress)', ScriptLanguage.JAVASCRIPT, undefined, UndoModes.FAST_ENTIRE_SCRIPT, "undoStoriesImport");
                });
                progress.close();
                /*
                //Test window layout
                storiesCount = app.activeDocument.stories.length;
                $.writeln('entered importStoriesFromJSON function...');
                progress.message("Reading translation file\nfrom path nnn...");
                progress.increment();
                while(steps--){
                    progress.message("translating story " + steps + "\ntesting 1,2,3...");
                    progress.increment();
                    //$.sleep(5);
                }
                */
            } else {
                alert('No translation selected. No action will be taken.');
                myDialog.destroy();
            }
        }
        else{
            myDialog.destroy();
        }
    }
}

function progress(steps) {
    progress.cncl = false;
    win = new Window("palette", "Progress", [150, 150, 800, 340], {closeButton: false});
    win.pnl = win.add("panel", [10, 10, 640, 175], "Script Progress");
    win.pnl.progBarLabel = win.pnl.add("statictext", [20, 20, 610, 35], "0%");
    win.pnl.progBar = win.pnl.add("progressbar", [20, 35, 610, 60], 0, steps);
    win.pnl.progBarStatus = win.pnl.add("statictext", [20, 50, 610, 100], "initializing...\nrunning...");
    win.pnl.progBarStp = win.pnl.add("button", [220, 100, 380, 140], "Stop");
    win.pnl.progBarStp.onClick = function() {
        progress.cncl = true;
    }
    win.center();
    progress.close = function() {
        win.close();
    };
    progress.increment = function() {
        if(progress.cncl === false) {
            win.pnl.progBar.value++;
            ratio = win.pnl.progBar.value / steps;
            //$.writeln( 'ratio = ' + ratio);
            ratioRounded = +(Math.round((ratio) + "e+2")  + "e-2");
            //$.writeln( 'ratioRounded = ' + ratioRounded );
            progPercentage = Math.round( ratioRounded * 100 );
            //$.writeln( 'progPercentage = ' + progPercentage );
            win.pnl.progBarLabel.text = '' + progPercentage + '%';
            win.update();
        } else {
            win.close();
        }
    };
    progress.message = function(message) {
        win.pnl.progBarStatus.text = message;
        win.update();
    };
    progress.reset = function() {
        win.pnl.progBar.value = 0;
        win.pnl.progBarLabel.text = '0%';
        win.pnl.ProgBarStatus = 'reinitializing...\nrunning...';
    }
    win.show();
}

function importStoriesFromJSON (importLang,translationFilePath,progress) {
    storiesCount = app.activeDocument.stories.length;
    //$.writeln('entered importStoriesFromJSON function...');
    progress.message("Reading translation file " + translationFile);
    var translationFile = new File(translationFilePath);
    translationFile.open("r");
    translationObj = JSON.parse( translationFile.read() );
    translationFile.close();
    progress.increment();

    //$.writeln( 'finished loading translation strings from translation file:' );
    //$.writeln( JSON.stringify( translationObj, null, 4 ) );
    //$.writeln( 'There are ' + storiesCount + ' stories in the document' );
    translatedStories = Object.keys( translationObj );
    //$.writeln( 'There are ' + translatedStories.length + ' stories in the translation file.' );
    //$.writeln( 'If there are less in the translation file it is not necessarily a problem, because perhaps not all stories need translation...' );
    for(myCounter = 0; myCounter < storiesCount; myCounter++) {
        progress.message("Translating story " + myCounter + "...");
        myStory = app.activeDocument.stories.item(myCounter);
        if( /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(myStory.contents) ) {
            myStoryId = 'story_' + myStory.id;
            myTextStyleRanges = myStory.textStyleRanges;
            for(textRangeCounter = 0; textRangeCounter < myTextStyleRanges.length; textRangeCounter++) {
                myTextRange = myTextStyleRanges[textRangeCounter];
                myTextRangeContents = myTextRange.contents;
                if( /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(myTextRangeContents) ) {
                    myTextRange.contents = translationObj[myStoryId]['tsr_'+textRangeCounter] || myTextRange.contents;
                }
            }
        }
        progress.increment();
    }
    //$.writeln( 'finished translating stories' );
    var doc = app.activeDocument;
    var docNameFull = doc.name;
    //$.writeln( 'docName is ' + docNameFull );
    var docNameFirst = docNameFull.substr(0,docNameFull.lastIndexOf('.'));
    var docExtension = docNameFull.substr(docNameFull.lastIndexOf('.')+1);
    var saveName = decodeURI(doc.filePath)+'/'+docNameFirst+'_'+importLang+'.' + docExtension;
    progress.message('Saving translated document to:\n' + saveName);
    var saveFile = new File( saveName );
    try {
        doc.saveACopy( saveFile );
        progress.increment();
    }
    catch(error) {
        $.writeln(error);
        progress.close();
    }
}
