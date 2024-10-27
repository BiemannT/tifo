const diagSnip = document.getElementById("DiagEditSnippet");
const diagForm = diagSnip.querySelector("form");
const btnClose = diagSnip.querySelector("header div.DiagClose");
const fieldStruct = diagForm.querySelector("fieldset:nth-of-type(2)");
const numStruct = fieldStruct.querySelector("legend input[type='number']");
const btnIncStruct = fieldStruct.querySelector("div.DiagButton:nth-of-type(1)");
const btnDecStruct = fieldStruct.querySelector("div.DiagButton:nth-of-type(2)");

function ShowDiagSnippet(tifoData) {
    // Try to fetch tifo data and display the content
    diagForm.Description.value = tifoData.querySelector("info description").textContent;
    diagForm.Guid.value = tifoData.getAttribute("guid");
    
    // Load Structure Info
    const StructInfo = tifoData.querySelectorAll("info structure level");
    numStruct.value = StructInfo.length;
    SetupStructureLevels();

    for (let i = 1; i <= numStruct.value; i++) {
        document.getElementById(`DiagEditSnipStructLvl${i}`).value = StructInfo[i - 1].textContent;
    }

    diagSnip.showModal();
}

// Logic for close dialog button
btnClose.addEventListener("click", () => {
    diagForm.reset();
    diagSnip.close();
});

// Logic for increasing and decreasing structure levels
// Increase-Button
btnIncStruct.addEventListener("click", () => {
    diagForm.StructLvlCount.stepUp();
    // AddStructLvl();
    SetupStructureLevels();
});

// Decrease-Button
btnDecStruct.addEventListener("click", () => {
    if (diagForm.StructLvlCount.value > 0) {
        diagForm.StructLvlCount.stepDown();
        // RemStructLvl();
        SetupStructureLevels();
    }
});

// Event-Handler for changing Structure list
numStruct.addEventListener("change", () => {
    SetupStructureLevels();
});

function SetupStructureLevels() {
    const NewNumberLevels = Number(numStruct.value);
    const ActualNumberLevels = fieldStruct.querySelectorAll("div.DiagStructLevel").length;

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

            diagForm.querySelector("fieldset:nth-of-type(2)").appendChild(div);
            
        }
    }

    if (NewNumberLevels < ActualNumberLevels) {
        // Remove last Structure Levels
        for (let i = ActualNumberLevels; i > NewNumberLevels; i--) {
            const lstStruct = fieldStruct.querySelector("div.DiagStructLevel:last-of-type");
            fieldStruct.removeChild(lstStruct);
        }
    }
}