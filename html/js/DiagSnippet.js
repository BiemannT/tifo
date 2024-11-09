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
            SetupStructureLevels();
        });

        // Decrease-Button
        this.#btnDecStruct.addEventListener("click", () => {
            if (this.#diagForm.StructLvlCount.value > 0) {
                this.#diagForm.StructLvlCount.stepDown();
                SetupStructureLevels();
            }
        });

        // Event-Handler for changing Structure list
        this.#numStruct.addEventListener("change", () => {
            SetupStructureLevels();
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
                let listEntry = document.createElement("li");
                let EntryLabel = document.createElement("label");
                let EntryLabelLang = document.createElement("data");
                let EntryLabelTranstate = document.createElement("data");
                let EntryLabelDate = document.createElement("time");
                let EntryText = document.createElement("textarea");

                const TranslateLang = tifoVersionsLangauges[j].getAttribute("lang");
                const TranslateDate = new Date(tifoVersionsLangauges[j].getAttribute("date"));
                const TranslateState = tifoVersionsLangauges[j].getAttribute("transtate");

                EntryLabelLang.value = TranslateLang;
                EntryLabelLang.textContent = TranslateLang;

                EntryLabelTranstate.value = TranslateState;
                switch (TranslateState) {
                    case "original":
                        EntryLabelTranstate.textContent = "Original";
                        break;
                
                    case "pending":
                        EntryLabelTranstate.textContent = "Übersetzung ausstehend";
                        break;

                    case "translated":
                        EntryLabelTranstate.textContent = "Übersetzung";
                        break;

                    default:
                        break;
                }

                EntryLabelDate.dateTime = tifoVersionsLangauges[j].getAttribute("date");
                EntryLabelDate.textContent = TranslateDate.toLocaleDateString();

                EntryLabel.htmlFor = `DiagEditSnipVers${VersionNumber}${TranslateLang}`;
                EntryLabel.appendChild(EntryLabelLang);
                EntryLabel.appendChild(EntryLabelTranstate);
                EntryLabel.appendChild(EntryLabelDate);

                EntryText.name = `Version${VersionNumber}${TranslateLang}`;
                EntryText.id = `DiagEditSnipVers${VersionNumber}${TranslateLang}`;
                EntryText.wrap = "soft";
                EntryText.required = true;
                EntryText.innerHTML = tifoVersionsLangauges[j].innerHTML;

                if (j > 0) {
                    // Set readonly for older Versions, if available
                    EntryText.readOnly = true;
                }

                listEntry.appendChild(EntryLabel);
                listEntry.appendChild(EntryText);
                list.appendChild(listEntry);
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