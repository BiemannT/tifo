class TreeView {
    TreeViewContainer;

    #TreeViewStructure = [];

    /**
     * Initialize the TreeView-Class to get access to methods to work with the tree view.
     * @param {string} TreeViewMainSelector A HTML selector to the main &lt;ul&gt; tree view element.
     */
    constructor(TreeViewMainSelector) {
        // Setup local vars
        if (document.querySelector(TreeViewMainSelector) instanceof HTMLUListElement) {
            this.TreeViewContainer = document.querySelector(TreeViewMainSelector);
            this.#TreeViewStructure[0] = this.TreeViewContainer.id;
        } else {
            throw new Error("Wrong Selector for TreeView!");
        }
    }

    /**
     * Find the ul-list with the requested location ID.
     * If the requested location ID doesn't exist, a new list element will be generated automatically and returned.
     * @param {string} location The requested path to the &lt;ul&gt;-list.
     * @returns Returns the requested HTML &lt;ul&gt;-element.
     */
    #IdentifyLocation(location) {
        // Check if the location string starts with the name id of the root tree view element
        if (!location.startsWith(this.#TreeViewStructure[0])) {
            throw new Error("Location name has to start with the ID of the tree view root node!");
        }

        if (this.#TreeViewStructure.includes(location)) {
            // In case the location already exists
            return document.getElementById(location);

        } else {
            // In case the location does not exist create the <ul>-list at the desired location
            // Split the location string
            const levels = location.split("/");

            if (levels.length > 0) {

                let actLevel = levels[0];
                let actLevelNode = document.getElementById(actLevel);

                for (let i = 1; i < levels.length; i++) {
                    // Check if actual level exist
                    // Start with i = 1 to skip the root level
                    if (document.getElementById(`${actLevel}/${levels[i]}`)) {
                        actLevel += "/";
                        actLevel += levels[i];
                        actLevelNode = document.getElementById(actLevel);

                    } else {
                        // Create <ul>-list, if actual level doesn't exist
                        actLevel += "/"
                        actLevel += levels[i]
                        let newLevel = this.#CreateList(levels[i], actLevel);
                        actLevelNode.appendChild(newLevel);
                        actLevelNode = document.getElementById(actLevel);
                        
                        // Append the new location to the structure-array
                        this.#TreeViewStructure.push(actLevel);
                    }
                }

                return actLevelNode;
            }
        }
    }

    /**
     * Prepare an list element with a new structure level.
     * @param {string} name The name of the new list level. This name will be used to show the list title.
     * @param {string} locationID The location ID for the new list. It should start with the root level ID and should end with the new level name.
     * @returns Returns a prepared new &lt;li&gt;-element, which should be appended to the desired parent &lt;ul&gt;-element.
     */
    #CreateList(name, locationID) {
        // Parameter validation
        if (name === "") {
            throw new Error("The name for the new list was not defined!");
        }

        if (locationID === "" || !locationID.startsWith(this.#TreeViewStructure[0]) || !locationID.endsWith(name) ) {
            throw new Error("The location ID of the new list has to start with the ID-name of the tree view root element and ends with the value of 'name'!");
        }

        // Declare elements
        const listEntry = document.createElement("li");
        const listCheckbox = document.createElement("input");
        const listLabel = document.createElement("label");
        const listSymbol = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const listSymbolPath1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const listSymbolPath2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const listName = document.createElement("p");
        const list = document.createElement("ul");

        // Setup attributes
        listCheckbox.id = `lbl${locationID}`;
        listCheckbox.type = "checkbox";
        listCheckbox.checked = true;

        listLabel.htmlFor = `lbl${locationID}`;

        listSymbol.classList.add("UIMenuExpander");
        listSymbol.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        listSymbol.setAttribute("viewBox", "0 0 200 200");

        listSymbolPath1.classList.add("UIMenuOpen");
        listSymbolPath1.setAttribute("d", "M0,200h200v-200Z");
        
        listSymbolPath2.classList.add("UIMenuClosed");
        listSymbolPath2.setAttribute("d", "M50,0v200l150,-100Z");

        listName.textContent = name;

        list.id = locationID;
        
        // Build nodes
        listEntry.appendChild(listCheckbox);
        listSymbol.appendChild(listSymbolPath1);
        listSymbol.appendChild(listSymbolPath2);
        listLabel.appendChild(listSymbol);
        listLabel.appendChild(listName);
        listEntry.appendChild(listLabel);
        listEntry.appendChild(list);

        // Return <li>-element
        return listEntry;
    }

    /**
     * Creates a new element to the tree view, at a specified location.
     * @param {string} title The title for the new node-element
     * @param {Element | null} elemBefore An optional element which will be placed before the node &lt;p&gt;-element.
     * @param {string} location The location/structure-level where the new node should be appended. If the structure-level does not exist, the level will be created.
     * @param {Element | null} elemAfter An optional element which will be placed after the node &lt;p&gt;-element.
     */
    CreateNode(title, elemBefore, location, elemAfter) {
        // Check, if required parameters are set
        if (title !== "" && location !== "") {

            // Identify target ul-list
            const targetList = this.#IdentifyLocation(location);

            const listEntry = document.createElement("li");
            const NameNode = document.createElement("p");

            NameNode.textContent = title;

            if (elemBefore instanceof Element) {
                listEntry.appendChild(elemBefore);
            }

            listEntry.appendChild(NameNode);

            if (elemAfter instanceof Element) {
                listEntry.appendChild(elemAfter);
            }

            targetList.appendChild(listEntry);

        }
    }
}