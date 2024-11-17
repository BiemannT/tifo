class DialogSnippets {
    #diagSnip;
    #diagForm;
    
    #btnClose;
    #btnIncStruct;
    #btnDecStruct;
    #btnNewVersion;
    #btnNewLanguageVersion;
    #btnSave;

    #fieldStruct;
    #fieldVersion;

    #numStruct;

    #languageArr = {
            "none": "Neutral",
            "de": "Deutsch",
            "en": "Englisch"
    };

    #transtateArr = {
            "original": "Original",
            "pending": "Übersetzung ausstehend",
            "translated": "Übersetzung"
    };
    
    /**
     * Initialize the logic for the Snippet Dialog.
     * @param {string} DialogID HTML Document ID of the Snippet Dialog.
     */
    constructor(DialogID) {
        // Setup local vars
        this.#diagSnip = document.getElementById(DialogID);
        this.#diagForm = this.#diagSnip.querySelector("form");
        this.#btnClose = this.#diagSnip.querySelector("header div.DiagClose");
        this.#fieldStruct = this.#diagForm.querySelector("fieldset:nth-of-type(2)");
        this.#numStruct = this.#fieldStruct.querySelector("legend input[type='number']");
        this.#btnIncStruct = this.#fieldStruct.querySelector("div.DiagButton:nth-of-type(1)");
        this.#btnDecStruct = this.#fieldStruct.querySelector("div.DiagButton:nth-of-type(2)");
        this.#fieldVersion = this.#diagForm.querySelector("fieldset:nth-of-type(3)");
        this.#btnNewVersion = this.#fieldVersion.querySelector("div.DiagButton:nth-of-type(1)");
        this.#btnNewLanguageVersion = this.#fieldVersion.querySelector("div.DiagButton:nth-of-type(2)");
        this.#btnSave = this.#diagForm.querySelector("fieldset:nth-of-type(4) svg");

        // Setup Event Handler for Buttons
        // Logic for close dialog button
        this.#btnClose.addEventListener("click", () => {
            this.#diagForm.reset();
            this.#diagSnip.close();
        });

        // Logic for increasing and decreasing structure levels
        // Increase-Button
        this.#btnIncStruct.addEventListener("click", () => {
            this.#diagForm.StructLvlCount.stepUp();
            this.#SetupStructureLevels();
        });

        // Decrease-Button
        this.#btnDecStruct.addEventListener("click", () => {
            if (this.#diagForm.StructLvlCount.value > 0) {
                this.#diagForm.StructLvlCount.stepDown();
                this.#SetupStructureLevels();
            }
        });

        // Event-Handler for changing Structure list
        this.#numStruct.addEventListener("change", () => {
            this.#SetupStructureLevels();
        });

        // Event-Handler for the the new version button
        this.#btnNewVersion.addEventListener("click", () => {
            this.#NewVersion();
        });

        // Event-Handler for the new language version button
        this.#btnNewLanguageVersion.addEventListener("click", () => {
            // Get required variables
            const number = this.#fieldVersion.querySelectorAll("section ul li").length;
            const lang = "none";
            const state = "pending";
            const newDate = new Date();
            const date = newDate.toLocaleDateString("en-CA");

            // Create new language and append child to the ul-list
            this.#fieldVersion.querySelector("section ul").appendChild(this.#CreateLanguageVersion(number, lang, state, date, "", true));
        });

        // Event-Handler for the save/download button
        this.#btnSave.addEventListener("click", () => {
            this.SaveChanges();
        });

    }

    /**
     * Resets all data fields in the dialog form.
     */
    #ResetForm() {
        this.#diagForm.reset();

        // Reset the structure levels
        this.#numStruct.value = 0;
        this.#SetupStructureLevels();

        // Make GUID-field editable
        this.#diagForm.Guid.disabled = false;

        // Cleanup existing Versions, if dialog was opened before
        this.#fieldVersion.querySelectorAll("section").forEach(function (currentValue, currentIndex, listObj) {
            this.removeChild(currentValue);
        }, this.#fieldVersion);
    }

    /**
     * This private method setup the visual content of the Snippet Structure viewbox.
     * The visible levels will be adapted to the #numStruct-value.
     */
    #SetupStructureLevels() {
        const NewNumberLevels = Number(this.#numStruct.value);
        const ActualNumberLevels = this.#fieldStruct.querySelectorAll("div.DiagStructLevel").length;

        if (NewNumberLevels > ActualNumberLevels) {
            // Adding New Structure Levels
            for (let i = ActualNumberLevels + 1; i <= NewNumberLevels; i++) {
                let div = document.createElement("div");
                let label = document.createElement("label");
                let input = document.createElement("input");

                label.setAttribute("for", `DiagEditSnipStructLvl${i}`);
                label.textContent = `Ebene ${i}:`;

                input.type = "text";
                input.name = `StructLvl${i}`;
                input.id = `DiagEditSnipStructLvl${i}`;
                input.placeholder = `Name Ebene ${i}...`;
                input.minLength = "2";
                input.maxLength = "20";
                input.required = true;

                div.className = "DiagStructLevel";
                div.appendChild(label);
                div.appendChild(input);

                this.#diagForm.querySelector("fieldset:nth-of-type(2)").appendChild(div);
                
            }
        }

        if (NewNumberLevels < ActualNumberLevels) {
            // Remove last Structure Levels
            for (let i = ActualNumberLevels; i > NewNumberLevels; i--) {
                const lstStruct = this.#fieldStruct.querySelector("div.DiagStructLevel:last-of-type");
                this.#fieldStruct.removeChild(lstStruct);
            }
        }
    }

    /**
     * Creates and return a new "section"-element representing a version, which can be appended to the version fieldset.
     * @param {number | string} indexNumber Version number will be used to name the header element
     * @returns Returns a HTML-Element "section", which can be directly append into the fieldset.
     * Afterwards the reateLanguageVersion()-method should be called to fill the list with a language version.
     */
    #CreateVersion(indexNumber) {
        // Create main Elements
        let sect = document.createElement("section");
        let sectHeader = document.createElement("h1");
        let sectList = document.createElement("ul");

        sectHeader.textContent = `Version ${indexNumber}`;

        sect.appendChild(sectHeader);
        sect.appendChild(sectList);

        return sect;
    }

    /**
     * This method will prepare a HTML &lt;li&gt;-Element with all necessary information.
     * @param {number | string} indexNumber Version number will be used to name the content controls
     * @param {string} language The abbreviation of the current content language
     * @param {string} transtate A valid option to preselect the actual translation state
     * @param {string} date The date of the current content. Must be in the following format: yyyy-mm-dd
     * @param {string} content The content to be shown in the textarea field
     * @param {boolean} active If true, the content will be presented editable
     * @returns Returns a HTML-Element "li", which can be directly appended to the list of language-versions.
     */
    #CreateLanguageVersion(indexNumber, language, transtate, date, content, active) {
        // Create main Elements
        let listEntry = document.createElement("li");
        let labelDiv = document.createElement("div");
        let langSelector = document.createElement("select");
        let langTranstate = document.createElement("select");
        let langDate = document.createElement("input");
        let svgDelete = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let svgDeletePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let VersionContent = document.createElement("textarea");

        // Populate language selector
        for (const lang in this.#languageArr) {
            let langOption = document.createElement("option");
            langOption.value = lang;
            langOption.textContent = this.#languageArr[lang];
            
            if (language == lang) {
                langOption.setAttribute("selected", "");
            }

            langSelector.appendChild(langOption);
        }

        // Populate Translation-State selector
        for (const state in this.#transtateArr) {
            let transtateOption = document.createElement("option");
            transtateOption.value = state;
            transtateOption.textContent = this.#transtateArr[state];

            if (transtate == state) {
                transtateOption.setAttribute("selected", "");
            }

            langTranstate.appendChild(transtateOption);
        }

        // Setup Elements
        langSelector.name = `Version-${indexNumber}-${language}-Lang`;
        langTranstate.name = `Version-${indexNumber}-${language}-Transtate`;
        langDate.type = "date";
        langDate.name = `Version-${indexNumber}-${language}-Date`;
        langDate.required = true;
        langDate.value = date;
        svgDelete.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svgDelete.setAttribute("viewBox", "0 -960 960 960");
        svgDelete.addEventListener("click", () => {
            this.DeleteLanguageVersion(listEntry);
        });
        svgDeletePath.setAttribute("d", "M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z");
        VersionContent.name = `Version-${indexNumber}-${language}`;
        VersionContent.wrap = "soft";
        VersionContent.required = true;
        VersionContent.innerHTML = this.#formatXml(content.replace(/\n|\s{2,}/gm, '')); // Remove all new lines and whitespaces and format the xml-text

        // Properties depending to active-state
        if (active) {
            svgDelete.classList.add("DiagButtonActive");

        } else {
            langSelector.disabled = true;
            langTranstate.disabled = true;
            langDate.disabled = true;
            VersionContent.readOnly = true;
        }

        // Append childs and return the list entry element
        svgDelete.appendChild(svgDeletePath);

        labelDiv.appendChild(langSelector);
        labelDiv.appendChild(langTranstate);
        labelDiv.appendChild(langDate);
        labelDiv.appendChild(svgDelete);

        listEntry.appendChild(labelDiv);
        listEntry.appendChild(VersionContent);

        return listEntry;
    }

    /**
     * This method will prepare a new version.
     * The complete content with all languages of the last version will be cloned and added as new version.
     * In the cloned version the translation dates will be updated to the current date.
     * All older versions will be disabled.
     */
    #NewVersion() {
        const NewDate = new Date();

        // Check first, if minimum one version is available
        if (this.#fieldVersion.querySelector("section") != null) {

            // Determine the new version number
            const NewVersNumber = this.#fieldVersion.querySelectorAll("section").length + 1;

            // Prepare new section-element
            const NewVersElement = this.#CreateVersion(NewVersNumber);

            // Copy latest language version elements into the new section-element
            const OldVersLang = this.#fieldVersion.querySelector("section:first-of-type").querySelectorAll("li");
            for (let i = 0; i < OldVersLang.length; i++) {
                const lang = OldVersLang[i].querySelector("div select:nth-of-type(1)").value;
                let transtate = OldVersLang[i].querySelector("div select:nth-of-type(2)").value;
                // Set translation state to pending, if state of copied item is translated
                if (transtate === "translated") {
                    transtate = "pending";
                }

                const content = OldVersLang[i].querySelector("textarea").textContent;

                // Append copied version to the section element
                NewVersElement.querySelector("ul").appendChild(this.#CreateLanguageVersion(NewVersNumber, lang, transtate, NewDate.toLocaleDateString("en-CA"), content, true));

            }

            // Set previous versions to readonly
            this.#ToggleVersionEditable(this.#fieldVersion.querySelector("section:first-of-type"), false);

            // Place new version at the beginning
            this.#fieldVersion.insertBefore(NewVersElement, this.#fieldVersion.querySelector("section:first-of-type"));

        } else {
            // If no version is available, create first version node
            const NewVersElement = this.#CreateVersion(1);

            NewVersElement.querySelector("ul").appendChild(this.#CreateLanguageVersion(1, "none", "original", NewDate.toLocaleDateString("en-CA"), "", true));

            this.#fieldVersion.appendChild(NewVersElement);
        }
    }

    /**
     * Toggles the editable status of the complete version content.
     * @param {HTMLElement} versionSection The &lt;section&gt;-Element which content editable status should be toggled.
     * @param {boolean} editable true, if the elements should be editable, otherwise false.
     */
    #ToggleVersionEditable(versionSection, editable) {
        if (versionSection instanceof HTMLElement) {
            const ExistingVersions = versionSection.querySelectorAll("li");
            
            ExistingVersions.forEach(function(currentValue, currentIndex, listObj) {

                if (editable) {
                    // Enable all elements
                    currentValue.querySelector("textarea").readOnly = false;
                    currentValue.querySelector("select:nth-of-type(1)").disabled = false;
                    currentValue.querySelector("select:nth-of-type(2)").disabled = false;
                    currentValue.querySelector("input[type=date]").disabled = false;
                    currentValue.querySelector("svg").classList.add("DiagButtonActive");

                } else {
                    // Disable all elements
                    currentValue.querySelector("textarea").readOnly = true;
                    currentValue.querySelector("select:nth-of-type(1)").disabled = true;
                    currentValue.querySelector("select:nth-of-type(2)").disabled = true;
                    currentValue.querySelector("input[type=date]").disabled = true;
                    currentValue.querySelector("svg").classList.remove("DiagButtonActive");

                }
            });
        }
    }

    /**
     * Show the content of an tifo-Block in the Snippet Dialog.
     * @param {Element} tifoData Reference to the full tifo-Block, which content should be displayed.
     */
    ShowDiag(tifoData) {
        // Reset form content, if form was loaded before
        this.#ResetForm();

        // Try to fetch tifo data and display the content
        this.#diagForm.Description.value = tifoData.querySelector("info description").textContent;
        this.#diagForm.Guid.value = tifoData.getAttribute("guid");

        // Make GUID-field disabled, if value is available
        if (this.#diagForm.Guid.value !== "") {
            this.#diagForm.Guid.disabled = true;
        }
        
        // Load Structure Info
        const StructInfo = tifoData.querySelectorAll("info structure level");
        this.#numStruct.value = StructInfo.length;
        this.#SetupStructureLevels();

        for (let i = 1; i <= this.#numStruct.value; i++) {
            document.getElementById(`DiagEditSnipStructLvl${i}`).value = StructInfo[i - 1].textContent;
        }

        // Load Versions

        // Iterate all available versions
        const tifoVersions = tifoData.querySelectorAll("version");
        for (let i = 0; i < tifoVersions.length; i++) {
            
            const VersionNumber = tifoVersions[i].getAttribute("number");
            let sect = document.createElement("section");
            let header = document.createElement("h1");
            let list = document.createElement("ul");

            header.textContent = `Version ${VersionNumber}`;

            // Iterate all available languages
            let tifoVersionsLangauges = tifoVersions[i].querySelectorAll("content");
            for (let j = 0; j < tifoVersionsLangauges.length; j++) {
                const TranslateLang = tifoVersionsLangauges[j].getAttribute("lang");
                const TranslateDate = tifoVersionsLangauges[j].getAttribute("date");
                const TranslateState = tifoVersionsLangauges[j].getAttribute("transtate");

                if (i == 0) {
                    // Newest Version
                    list.appendChild(this.#CreateLanguageVersion(VersionNumber, TranslateLang, TranslateState ,TranslateDate, tifoVersionsLangauges[j].innerHTML, true));

                } else {
                    // Older Versions
                    list.appendChild(this.#CreateLanguageVersion(VersionNumber, TranslateLang, TranslateState, TranslateDate, tifoVersionsLangauges[j].innerHTML, false));
                }
            }

            sect.appendChild(header);
            sect.appendChild(list);
            this.#fieldVersion.appendChild(sect);
        }

        this.#diagSnip.showModal();
    }

    /**
     * Show an empty Snippet Dialog to create a new snippet.
     */
    ShowDiagNewSnippet() {
        // Reset form content, if form was loaded before
        this.#ResetForm();

        // GUID field editable
        this.#diagForm.Guid.disabled = false;
        
        this.#diagSnip.showModal();
    }

    DeleteLanguageVersion(ListElement) {
        // Delete the defined <li>-Element from <ul>
        if (ListElement instanceof HTMLLIElement) {
            const ParentSection = ListElement.parentElement.parentElement;

            ListElement.parentElement.removeChild(ListElement);

            // If no more language version remain, delete the corresponding section and make the previous version editable
            if (ParentSection.querySelector("ul").hasChildNodes() == false) {
                this.#fieldVersion.removeChild(ParentSection);
                this.#ToggleVersionEditable(this.#fieldVersion.querySelector("section:first-of-type"), true);
            }
        }
    }

    /**
     * This method will export the edited snippet to a xml-file.
     * After the succesful validation of the form, the content will be prepared for downloading the xml-file.
     * The download will be initialized by this method.
     * Finally the form will be closed.
     */
    SaveChanges() {
        // Check Validity of form elements
        if (this.#diagForm.reportValidity()) {
            // Prepare XML-Document
            const tifoDoctype = document.implementation.createDocumentType("tifo", "", "../def/Snippet.dtd");
            let SaveDoc = document.implementation.createDocument(null, "tifo", tifoDoctype);
            let DownloadFileName = "";
            
            // Set Processing instruction
            const xmlSetting = SaveDoc.createProcessingInstruction("xml", 'version="1.0" encoding="UTF-8"');
            SaveDoc.insertBefore(xmlSetting, SaveDoc.firstChild);

            // Set "guid"-attribute
            SaveDoc.documentElement.setAttribute("guid", this.#diagForm.Guid.value);

            // Set <info>-Element
            const tifoInfo = SaveDoc.createElement("info");
            const tifoInfoDesc = SaveDoc.createElement("description");
            const tifoInfoStruct = SaveDoc.createElement("structure");
            
            tifoInfoDesc.textContent = this.#diagForm.Description.value;

            // Setup <structure>
            const tifoInfoStructLevels = this.#fieldStruct.querySelectorAll(".DiagStructLevel");
            for (let i = 0; i < tifoInfoStructLevels.length; i++) {
                const tifoInfoStructLvl = SaveDoc.createElement("level");
                tifoInfoStructLvl.setAttribute("number", i + 1);
                tifoInfoStructLvl.textContent = tifoInfoStructLevels[i].querySelector("input").value;

                DownloadFileName += tifoInfoStructLevels[i].querySelector("input").value;
                DownloadFileName += "_"

                tifoInfoStruct.appendChild(tifoInfoStructLvl);
            }

            DownloadFileName += tifoInfoDesc.textContent;
            DownloadFileName += ".xml";

            tifoInfo.appendChild(tifoInfoDesc);
            tifoInfo.appendChild(tifoInfoStruct);
            SaveDoc.documentElement.appendChild(tifoInfo);

            // Iterate Versions
            const tifoVersions = this.#fieldVersion.querySelectorAll("section");
            for (let i = 0; i < tifoVersions.length; i++) {
                const tifoVers = SaveDoc.createElement("version");
                
                tifoVers.setAttribute("number", tifoVersions.length - i);

                // Iterate languages
                const tifoVersionsLangauges = tifoVersions[i].querySelectorAll("li");
                for (let j = 0; j < tifoVersionsLangauges.length; j++) {
                    const tifoVersLang = SaveDoc.createElement("content");
                    
                    tifoVersLang.setAttribute("lang", tifoVersionsLangauges[j].querySelector("div select:nth-of-type(1)").value);

                    tifoVersLang.setAttribute("date", tifoVersionsLangauges[j].querySelector("div input[type=date]").value);

                    tifoVersLang.setAttribute("transtate", tifoVersionsLangauges[j].querySelector("div select:nth-of-type(2)").value);

                    // Parse content of the textarea
                    const ContentParser = new DOMParser();
                    const CleanContentReg = /\n|\s{2,}/gm;
                    const tifoVersLangContent = tifoVersionsLangauges[j].querySelector("textarea").value.replace(CleanContentReg, '');

                    const tifoVersLangContentParsed = ContentParser.parseFromString(tifoVersLangContent, "text/xml");
                    
                    tifoVersLang.appendChild(tifoVersLangContentParsed.documentElement);

                    tifoVers.appendChild(tifoVersLang);
                }

                SaveDoc.documentElement.appendChild(tifoVers);
            }

            // Prepare BLOB of the prepared tifo document
            const serialize = new XMLSerializer();
            let OutFileContent = [this.#formatXml(serialize.serializeToString(SaveDoc))];
            let OutFile = new window.Blob(OutFileContent, {type: "text/xml"});
            this.#btnSave.nextElementSibling.setAttribute("href", window.URL.createObjectURL(OutFile));
            this.#btnSave.nextElementSibling.setAttribute("download", DownloadFileName);
            this.#btnSave.nextElementSibling.click();

            // Reset the form and close the dialog
            this.#diagForm.reset();
            this.#diagSnip.close();

        }
    }

    /**
     * This method will format a xml-string for a readable output.
     * It could be used for example after serializing a document node with XMLSerializer.serializeToString() to get a pretty, readable output text.
     * @param {string} xml XML-String to be formatted.
     * @returns Formatted xml text with each tag in one line and indent.
     */
    #formatXml(xml) {
        const PADDING = ' '.repeat(4); // set desired indent size here
        const reg = /(>)(<)(\/*)/g;
        let pad = 0;
    
        xml = xml.replace(reg, '$1\r\n$2$3');
    
        return xml.split('\r\n').map((node, index) => {
            let indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {  // Any text... ends with </xyz> --> typical start and end-tag in one line, with or without content text
                indent = 0;
            } else if (node.match(/^<\w[^>]*\/>$/)) {  // Single tag, without content --> example <img... />
                indent = 0;
            } else if (node.match(/^<\/\w/) && pad > 0) {  // Starts with </xyz  --> typical standalone end-tag in one line
                pad -= 1;
            } else if (node.match(/^<\w[^>\/]*>$/)) {  // Single start tag, without content <xyz>  --> typical stand alone start-tag in one line without content text
                indent = 1;
            } else {
                indent = 0;
            }
    
            pad += indent;
    
            return PADDING.repeat(pad - indent) + node;
        }).join('\r\n');
    }
}