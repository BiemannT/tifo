/**
 * Prepare and returns the svg-symbol for a text snippet.
 * @returns Returns a svg-element with the symbol.
 */
function CreateSnippetSymbol() {
    const svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const svgPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const svgPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const svgPath3 = document.createElementNS("http://www.w3.org/2000/svg", "path");

    svgElem.setAttribute("viewBox", "0 0 200 200");
    svgElem.classList.add("UITextSnippet");

    svgPath1.setAttribute("d", "M100,0l90,50l-90,50l-90,-50Z");
    svgPath2.setAttribute("d", "M90,200l0,-90l-90,-50l0,90Z");
    svgPath3.setAttribute("d", "M110,200l0,-90l90,-50l0,90Z");

    svgElem.appendChild(svgPath1);
    svgElem.appendChild(svgPath2);
    svgElem.appendChild(svgPath3);

    return svgElem;
}

/**
 * Prepare and returns the svg-symbol for a document template snippet.
 * @returns Returns a svg-element with the symbol.
 */
function CreateTemplateSnippetSymbol() {
    const svgElem = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const svgPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const svgPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const svgLine1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const svgLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");

    svgElem.setAttribute("viewBox", "0 0 200 200");
    svgElem.classList.add("UITemplateSnippet");

    svgPath1.setAttribute("d", "M30,5h110l30,30v160h-140Z");
    svgPath2.setAttribute("d", "M50,70h100v60h-100Z");

    svgLine1.setAttribute("x1", "50");
    svgLine1.setAttribute("x2", "150");
    svgLine1.setAttribute("y1", "30");
    svgLine1.setAttribute("y2", "30");

    svgLine2.setAttribute("x1", "50");
    svgLine2.setAttribute("x2", "150");
    svgLine2.setAttribute("y1", "170");
    svgLine2.setAttribute("y2", "170");

    svgElem.appendChild(svgPath1);
    svgElem.appendChild(svgPath2);
    svgElem.appendChild(svgLine1);
    svgElem.appendChild(svgLine2);

    return svgElem;
}

/**
 * Loads the content of several xml-files into the navigation text catalog.
 * Only valid xml files with doctype "tifo" will be imported.
 * Otherwise an error will occour in the console, also if the xml parser fires an error during import.
 * @param {FileList} files The file-list returned from a input:file-element.
 */
function ImportTextSnippets(files) {
    // Check if FileAPI is available
    if (window.FileList && window.FileReader && files instanceof FileList) {
        
        if (files.length > 0) {

            // Iterate the selected files
            for (const selFile of files) {

                // Check correct file type
                if (selFile.type === "text/xml") {

                    // Prepare File-Reader
                    const fileRdr = new window.FileReader();
                    fileRdr.readAsText(selFile);

                    // Load File content
                    fileRdr.addEventListener("load", (event) => {
                        // Content should be able to parse
                        const fileParser = new DOMParser();
                        const fileContent = fileParser.parseFromString(event.target.result, "text/xml");

                        // Check if error occured during parsing
                        if (fileContent.querySelector("parsererror")) {
                            alert(`Die ausgewählte Datei ${selFile.name} konnte nicht geöffnet werden.`);
                            console.error(`The requested file ${selFile.name} can not be parsed!`);
                            console.dirxml(fileContent.querySelector("parsererror"));
                            return;
                        }

                        // Check if Doctype is "tifo"
                        if (fileContent.doctype.name === "tifo") {
                            const NodeName = fileContent.querySelector("info description").textContent;
                            const NodeGUID = fileContent.documentElement.getAttribute("guid");
                            let NodeStructure = TreeViewSnippets.TreeViewContainer.id;
                            fileContent.querySelectorAll("info structure level").forEach(function(currentValue, currentIndex, listObj) {
                                NodeStructure += "/";
                                NodeStructure += currentValue.textContent;
                            });

                            // Prepare Node symbol depending on tifo type
                            let NodeSymbol;
                            if (fileContent.documentElement.attributes.getNamedItem("isTemplate")) {
                                // Template document
                                NodeSymbol = CreateTemplateSnippetSymbol();

                            } else {
                                NodeSymbol = CreateSnippetSymbol();
                            }

                            // Create node in tree view
                            TreeViewSnippets.CreateNode(NodeName, NodeSymbol, NodeStructure, fileContent.documentElement);

                            // Search appended entry
                            const NewNode = document.querySelector(`nav tifo[guid="${NodeGUID}"]`).parentElement;

                            // Set double click event on <p>-element
                            NewNode.querySelector("p").setAttribute("ondblclick", "SnipDiag.ShowDiag(this.nextElementSibling)");

                        } else {
                            alert(`Die ausgewählte Datei ${selFile.name} ist ungültig.`);
                            return;
                        }
                    });
                }
            }
        }
    } else {
        alert("Der aktuelle Browser unterstützt keine Aktionen mit Dateien (FileAPI).");
    }
}

// Initialize the tree-view class for the text snippets
const TreeViewSnippets = new TreeView("nav section.NavCatalog ul.TreeView");

// Setup event-handler on the import button, to start the import function
document.querySelector("nav section.NavCatalog header div:first-of-type").addEventListener("click", () => {
    document.getElementById("SnippetImport").click();
});

// Setup event-handler on channging the file-input element
document.querySelector("nav section.NavCatalog header div:first-of-type input[type=file]").addEventListener("change", (event) =>{
    ImportTextSnippets(event.target.files);
});

// Initialize the dialog snippet class for editing the text snipping content
const SnipDiag = new DialogSnippets("DiagEditSnippet");

// Add Event-Handler for new snippet dialog
document.querySelector("section.NavCatalog header div:nth-of-type(2)").addEventListener("click", () => {
    SnipDiag.ShowDiagNewSnippet();
})