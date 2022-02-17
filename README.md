# indesign-translate-INDD
Scripts that will extract stories to a translation.json file, and import stories from translation.json files

## ExportStoriesI18nJson
This script will extract all strings from an Indesign file and save them in nested JSON format to a `translation.json` file,
which is easily consumed by translation tools such as weblate.
The folder where the translations are extracted to will be saved as a label attached to the Indesign file,
after which the Indesign file will be automatically saved so that the label will stick.

## ImportTranslation
Once translations are complete, this script will scan the translations folder (as saved in the label attached to the document by the previous script),
and let you import either a single language translation or all language translations.
The translated strings will be imported in place of the source strings,
and a new Indesign document will be created in the current folder with the language flag added to the name of the document.

## Setup
Place these scripts in your Indesign script folder.
On Windows, this is something like: `C:\Users\{username}\AppData\Roaming\Adobe\InDesign\{version}\{language}\Scripts\Scripts Panel\`.
The scripts should then appear in the scripts panel under `User`.
In order to access the scripts panel, check `Window` >> `Utility` >> `Script`.

Also, make sure to add the es5 and es6 shims to the parent folder.
Adding them to the parent folder will prevent them from showing in the Scripts Panel.
References to these shims are hardcoded in the scripts to the parent folder for this reason.

These shims can be found here:
* ES5: https://github.com/ExtendScript/extendscript-es5-shim/blob/master/index.js
* ES6: https://github.com/ExtendScript/extendscript-es6-shim/blob/master/index.js

Make sure to use only the shims from these two repos, you cannot use other kinds of ES5 or ES6 shims which are meant for web development.
These two repos contains shims aimed specifically at Extendscript (which has no DOM, so cannot have any references to the `document` object).

Save them in the parent folder (on Windows, something like `C:\Users\{username}\AppData\Roaming\Adobe\InDesign\{version}\{language}\Scripts\`)
with the names `es5-shim.js` and `es6-shim.js`.

## Things that the graphic designer should keep in mind when designing the source file
* For each story expand the story editor to take up the full width of the screen, and turn on the end of line symbol in the story editor. We want to make sure that each sentence that should be translated as one sentence does not have an unnecessary line break.
* Avoid adjusting the format of specific pieces of text within a story as this causes that piece of text to have to be translated seperately from the rest of the sentence, in order to maintain the formatting.
* For the same reason DO NOT USE KERNING. Kerning results in each indivual letter needing translation.

* If the source document is written in English, keep in mind that English is a relatively compact language. For short peices of text assume that other languages could be up to 300% more characters, and for longer sections up to 170% more characters.
* Again if the source document is written in English, remember to expand text boxes as much as possible to support more characters than is in the English version.
