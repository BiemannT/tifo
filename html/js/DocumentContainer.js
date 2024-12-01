class DocumentContainer {

    #DocLevelCounter;

    /**
     * Initializes the DocumentContainer-class.
     */
    constructor () {
        this.#DocLevelCounter = 0;
    }

    /**
     * Loads the content of a Tifo-Template or Snippet and prepare a representation of the content and returns it.
     * The first version in the original language will be selected.
     * @param {string} TifoSelector A HTML Selector to the main Tifo-Element.
     * @returns Returns a HTMLUList-Element with a representation of the tifo content.
     */
    LoadTifoContent(TifoSelector) {
        // Prepare elements
        const LoadContent = document.querySelector(TifoSelector).querySelector("version:first-of-type content[transtate=original]");
        const ListContainer = document.createElement("ul");
        const ListHeader = document.createElement("li");
        const ListHeaderDocName = document.createElement("data");
        const ListHeaderVersion = document.createElement("data");

        ListContainer.className = "tifoDocRoot";

        // Set document Path as first header information
        ListHeader.className = "tifoHeader";
        ListHeaderDocName.value = document.querySelector(TifoSelector).getAttribute("guid");
        ListHeaderDocName.textContent = "Dokument: /";

        document.querySelector(TifoSelector).querySelectorAll("info structure level").forEach(function (currentValue, currentIndex, listObj) {
            ListHeaderDocName.textContent += currentValue.textContent;
            ListHeaderDocName.textContent += "/";
        });
        ListHeaderDocName.textContent += document.querySelector(TifoSelector).querySelector("info description").textContent;

        // Set document Version as second header information
        ListHeaderVersion.value = document.querySelector(TifoSelector).querySelector("version:first-of-type").getAttribute("number");
        ListHeaderVersion.textContent = "Version: ";
        ListHeaderVersion.textContent += ListHeaderVersion.value;

        // Append Header information to the output list
        ListHeader.appendChild(ListHeaderDocName);
        ListHeader.appendChild(ListHeaderVersion);
        ListContainer.appendChild(ListHeader);

        // Load the content of the tifo-element
        if (LoadContent instanceof Element && LoadContent.childElementCount > 0) {
            this.#IdentifyCreateNode(LoadContent.firstElementChild, ListContainer);
        }

        return ListContainer;
    }

    #IdentifyCreateNode(CheckNode, ParentNode) {
        if (CheckNode instanceof Element) {
            switch (CheckNode.nodeType) {
                case 1:
                    // ELEMENT_NODE

                    if (CheckNode.nodeName === "tifotarget") {
                        this.#CreateTifoTargetNode(CheckNode, ParentNode);
                        break;   
                    }

                    if (CheckNode.childElementCount > 0) {
                        // This Node has additional child nodes
                        this.#CreateSubElementNode(CheckNode, ParentNode);

                    } else {
                        // This Node is a single line node
                        this.#CreateSingleElementNode(CheckNode, ParentNode);
                    }
                    break;
            
                default:
                    break;
            }
        }
    }

    /**
     * 
     * @param {Element} Content The content node of the tifo-element
     * @param {Element} ParentNode The target parent node, where the detected content will be appended
     */
    #CreateSubElementNode(Content, ParentNode) {
        // Prepare Elements
        const listStartTag = document.createElement("li");
        const listStartTagName = document.createElement("span");
        const listStartTagLabel = document.createElement("label");
        const SubListCheckbox = document.createElement("input");
        const SubList = document.createElement("ul");
        const listEndTag = document.createElement("li");
        const listEndTagName = document.createElement("span");

        // Setup Start-Tag
        listStartTag.className = "Tag";
        listStartTagName.className = "TagName";
        listStartTagLabel.htmlFor = `tifoContent${this.#DocLevelCounter}`;
        listStartTagLabel.textContent = Content.nodeName;
        listStartTagName.appendChild(listStartTagLabel);
        listStartTag.appendChild(listStartTagName);

        SubListCheckbox.type = "checkbox";
        SubListCheckbox.id = `tifoContent${this.#DocLevelCounter}`;
        SubListCheckbox.checked = true;
        this.#DocLevelCounter++;

        // Check for additional attributes
        for (let i = 0; i < Content.attributes.length; i++) {
            let AttrName = document.createElement("span");
            let AttrValue = document.createElement("span");

            AttrName.className = "Attribute";
            AttrName.textContent = Content.attributes[i].name;
            listStartTag.appendChild(AttrName);

            AttrValue.className = "AttributeValue";
            AttrValue.textContent = Content.attributes[i].value;
            listStartTag.appendChild(AttrValue);
        }

        // Iterate childs
        for (let i = 0; i < Content.childNodes.length; i++) {
            this.#IdentifyCreateNode(Content.childNodes[i], SubList);
        }
        
        // Setup End-Tag
        listEndTag.className = "EndTag";
        listEndTagName.className = "TagName";
        listEndTagName.textContent = Content.nodeName;
        listEndTag.appendChild(listEndTagName);

        // Append child elements
        ParentNode.appendChild(listStartTag);
        ParentNode.appendChild(SubListCheckbox);
        ParentNode.appendChild(SubList);
        ParentNode.appendChild(listEndTag);
    }

    /**
     * 
     * @param {Element} Content The content node of the tifo-element
     * @param {Element} ParentNode The target parent node, where the content will be appended
     */
    #CreateSingleElementNode(Content, ParentNode) {
        // Prepare Elements
        const listStartTag = document.createElement("li");
        const listStartTagName = document.createElement("span");
        const listEndTagName = document.createElement("span");

        // Check, if the content-element is an empty tag or not
        if (Content.textContent === "") {
            // Empty-Tag
            listStartTag.className = "EmptyTag";

        } else {
            // Tag with text content
            listStartTag.className = "OnerowTag";
        }

        // Prepare start tag-name
        listStartTagName.className = "TagName";
        listStartTagName.textContent = Content.nodeName;

        // Check if additional attributes have to add to the start name-tag
        for (let i = 0; i < Content.attributes.length; i++) {
            let AttrName = document.createElement("span");
            let AttrValue = document.createElement("span");

            AttrName.className = "Attribute";
            AttrName.textContent = Content.attributes[i].name;
            listStartTagName.appendChild(AttrName);

            AttrValue.className = "AttributeValue";
            // AttrValue.textContent = Content.attributes[i].value;
            this.#IdentifyTifoVar(Content.attributes[i].value, AttrValue);
            listStartTagName.appendChild(AttrValue);
        }

        // Finish start tag-name
        listStartTag.appendChild(listStartTagName);

        // Insert text, if available
        if (Content.textContent !== "") {
            this.#IdentifyTifoVar(Content.textContent, listStartTag);
        }

        // Set optional end-tag, if the content is not an empty tag
        if (Content.textContent !== "") {
            listEndTagName.className = "TagName";
            listEndTagName.textContent = Content.nodeName;
            listStartTag.appendChild(listEndTagName);
        }

        // Append child elements
        ParentNode.appendChild(listStartTag);
    }

    /**
     * This methods handles the special &lt;tifotarget&gt;-node.
     * @param {Element} Content The content node of the special &lt;tifotarget&gt;-node.
     * @param {Element} ParentNode The target parent node, where the content will be appended.
     */
    #CreateTifoTargetNode(Content, ParentNode) {
        // Prepare Elements
        const listStartTag = document.createElement("li");
        const listHeader = document.createElement("header");
        const listHeaderTitle = document.createElement("p");
        const listRemark = document.createElement("div");

        listStartTag.className = "tifoTarget";
        listStartTag.id = Content.getAttribute("guid");

        listHeaderTitle.textContent = Content.textContent;
        listHeader.appendChild(listHeaderTitle);

        listRemark.className = "tifoTargetArea";
        listRemark.textContent = "Baustein hier platzieren";

        // Setup Drag Events
        listRemark.addEventListener("dragenter", (event) => {
            if (event instanceof DragEvent && event.dataTransfer.types.includes("application/tifo.textsnippet")) {
                event.currentTarget.classList.add("DropAllow");
                event.preventDefault();
            }
        });

        listRemark.addEventListener("dragleave", (event) => {
            event.currentTarget.classList.remove("DropAllow");
        });

        listRemark.addEventListener("dragover", (event) => {
            if (event instanceof DragEvent && event.dataTransfer.types.includes("application/tifo.textsnippet")) {
                event.preventDefault();
            }
        });

        listRemark.addEventListener("drop", (event) => {
            event.preventDefault();
            if (event instanceof DragEvent && event.dataTransfer.types.includes("application/tifo.textsnippet")) {
                // Get GUID of the selected element
                const targetGUID = event.dataTransfer.getData("application/tifo.textsnippet");

                // Load selected content
                const NewContent = this.LoadTifoContent(`nav tifo[guid=${targetGUID}]`);

                // Insert new content before div.tifoTargetArea
                const targetParent = event.currentTarget.parentElement;
                targetParent.insertBefore(NewContent, targetParent.querySelector("div.tifoTargetArea"));

                event.currentTarget.classList.remove("DropAllow");

            }
        });

        listStartTag.appendChild(listHeader);
        listStartTag.appendChild(listRemark);

        ParentNode.appendChild(listStartTag);
    }

    /**
     * Analyze a string, if it contains a tifo variable. 
     * @param {string} TextContent A string with an optional tifo variable. One or more tifo variables can occour at any position in the string.
     * @param {Element} ParentNode The parent node, where the detected contents will be added.
     */
    #IdentifyTifoVar(TextContent, ParentNode) {
        // Check, if TextContent contains a tifo-variable
        const tifoContent = TextContent.match(/(§{tifo\.uservars\.\w+([,='"\s\w]*})?)|(§{tifo\.general\.\w+})/g);

        // Copy original text in a new variable
        let TempText = TextContent;

        if (tifoContent) {
            for (let i = 0; i < tifoContent.length; i++) {
                // Iterate all detected tifo variables
                // Split the temp text at the actual tifo variable
                const SplitText = TempText.split(tifoContent[i], 2);

                // Create Pre-Text-Node, if text is available at the beginning
                if (SplitText[0] !== "") {
                    const PreTextNode = document.createTextNode(SplitText[0]);
                    ParentNode.appendChild(PreTextNode);
                }

                // Create tifoVar-span element
                const tifoNode = document.createElement("span");
                tifoNode.className = "tifoVar";
                tifoNode.textContent = tifoContent[i];
                ParentNode.appendChild(tifoNode);

                // Set the temp text to the remaining text after the actual tifo variable
                TempText = SplitText[1];
            }
        }

        // Append additional text remaining after last tifoVar, if available or if mno tifo variable was detected.
        if (TempText !== "") {
            const AppendText = document.createTextNode(TempText);
            ParentNode.appendChild(AppendText);
        }
    }
}