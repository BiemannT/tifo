class DialogSnippets {
    #diagSnip;
    #diagForm;
    
    #btnClose;
    #btnIncStruct;
    #btnDecStruct;
    #btnNewVersion;

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
                fieldStruct.removeChild(lstStruct);
            }
        }
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
        svgDeletePath.setAttribute("d", "M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z");
        VersionContent.name = `Version-${indexNumber}-${language}`;
        VersionContent.wrap = "soft";
        VersionContent.required = true;
        VersionContent.innerHTML = content;

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
        // Clone the latest version and make it as the newest version
        const NewVersionElement = this.#fieldVersion.querySelector("section:first-of-type").cloneNode(true);

        // Adapt Properties

        // Version Number
        const CountExistingVersions = Number(this.#fieldVersion.querySelectorAll("section").length);
        NewVersionElement.querySelector("h1").textContent = `Version ${CountExistingVersions + 1}`;

        // Set date of langauge versions to today
        const NewDate = new Date();
        const UpdateDate = NewVersionElement.querySelectorAll("input[type=date]");
        UpdateDate.forEach(function(currentValue, currentIndex, listObj) {
            currentValue.value = NewDate.toLocaleDateString("en-CA");
        });

        // Update names of label and textarea-fields
        const UpdateEntries = NewVersionElement.querySelectorAll("li");
        UpdateEntries.forEach(function(currentValue, currentIndex, listObj) {
            const actLang = currentValue.querySelector("div select:first-of-type").value;
            const newName = `Version-${CountExistingVersions + 1}-${actLang}`;
            
            currentValue.querySelector("select:nth-of-type(1)").name = `${newName}-Lang`;
            currentValue.querySelector("select:nth-of-type(2)").name = `${newName}-Transtate`;
            currentValue.querySelector("textarea").name = newName;
        });

        // Switch "translated"-mark to "pending"
        const UpdateTranstate = NewVersionElement.querySelectorAll("div select:nth-of-type(2)");
        UpdateTranstate.forEach(function(currentValue, currentIndex, listObj) {
            if (currentValue.value == "translated") {
                currentValue.value = "pending";
            }
        });

        // Set previous versions to readonly
        this.#ToggleVersionEditable(this.#fieldVersion.querySelector("section:first-of-type"), false);

        this.#fieldVersion.insertBefore(NewVersionElement, this.#fieldVersion.querySelector("section:first-of-type"));
    }

    /**
     * Toggles the editable status of the complete version content.
     * @param {HTMLElement} versionSection The &lt;section&gt;-Element which content editable status should be toggled.
     * @param {boolean} editable true, if the elements should be editable, otherwise false.
     */
    #ToggleVersionEditable(versionSection, editable) {
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

    /**
     * Show the content of an tifo-Block in the Snippet Dialog.
     * @param {Element} tifoData Reference to the full tifo-Block, which content should be displayed.
     */
    ShowDiag(tifoData) {
        // Try to fetch tifo data and display the content
        this.#diagForm.Description.value = tifoData.querySelector("info description").textContent;
        this.#diagForm.Guid.value = tifoData.getAttribute("guid");
        
        // Load Structure Info
        const StructInfo = tifoData.querySelectorAll("info structure level");
        this.#numStruct.value = StructInfo.length;
        this.#SetupStructureLevels();

        for (let i = 1; i <= this.#numStruct.value; i++) {
            document.getElementById(`DiagEditSnipStructLvl${i}`).value = StructInfo[i - 1].textContent;
        }

        // Load Versions
        // Cleanup existing Versions, if dialog was opened before
        const OldVersions = this.#fieldVersion.querySelectorAll("section");
        for (let i = 0; i < OldVersions.length; i++) {
            this.#fieldVersion.removeChild(OldVersions[i]);
        }

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
}

// Initialize class
const SnipDiag = new DialogSnippets("DiagEditSnippet");