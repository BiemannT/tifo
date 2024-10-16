class InstructionTextReader {
    /**
     * This method will initialize a new object of the InstructionTextReader-Class.
     * Every Parameter is required for full support of this class.
     * @param {string} SelectorButtonPlay HTML-Selector to the Play-Button Element.
     * @param {string} SelectorButtonPause HTML-Selector to the Pause-Button Element.
     * @param {string} SelectorButtonStop HTML-Selector to the Stop-Button Element.
     * @param {string} SelectorActualChapterTitle HTML-Selector to the Text-Field for the actual reading chapter title.
     * @param {string} SelectorVoiceSelection HTML-Selector to the voice selector. It must be of type "&lt;select&gt;".
     * @param {string} SelectorVolumeRange HTML-Selector to the Volume Setter Element. It must be of type "&lt;input type="range"&gt;".
     * @param {string} SelectorRateRange HTML-Selector to the speed rate Setter Element. It must be of type "&lt;input type="range"&gt;".
     * @param {string} ClsNameHighlight Class Name, which will be assigned to the actual readed node.
     */
    constructor (SelectorButtonPlay,
                SelectorButtonPause,
                SelectorButtonStop,
                SelectorActualChapterTitle,
                SelectorVoiceSelection,
                SelectorVolumeRange,
                SelectorRateRange,
                ClsNameHighlight) {
        /**
         * Returns true, if text is reading actually, otherwise false
         */
        this.Reading = false;

        /**
         * Returns an array of alle readable nodes, or null if not set.
         */
        this.ReadingNodes = null;

        /**
         * Returns the array index of this.ReadingNodes which is actually reading, or null if this.ReadingNodes is not set.
         */
        this.ActualReadingNodeIndex = null;

        // Determine Nodes for UI-Elements
        this.NodeButtonPlay = document.querySelector(SelectorButtonPlay);
        this.NodeButtonPause = document.querySelector(SelectorButtonPause);
        this.NodeButtonStop = document.querySelector(SelectorButtonStop);
        this.NodeActualChapterTitle = document.querySelector(SelectorActualChapterTitle);
        this.NodeVoiceSelection = document.querySelector(SelectorVoiceSelection);
        this.NodeVolumeRange = document.querySelector(SelectorVolumeRange);
        this.NodeRateRange = document.querySelector(SelectorRateRange);

        this.ClassNameHighlight = ClsNameHighlight;

        // Initialize Utterance
        this.utterance = new SpeechSynthesisUtterance();
        this.utterance.volume = 1.0;
        this.utterance.rate = 1.0;
        this.utterance.lang = document.documentElement.lang;

        // Initialize Voices
        this.QueryVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = this.QueryVoices;
        }

        // --- Setup Utterance-Events ---

        // Start
        this.utterance.addEventListener("start", (event) => {
            // Make Play-Button invisible
            this.NodeButtonPlay.style.display = "none";

            // Make Pause-Button visible
            this.NodeButtonPause.style.display = "block";

            // Set Property "Reading"
            this.Reading = true;

            // Highlighting actual reading context
            const actReaderNode = this.ReadingNodes[this.ActualReadingNodeIndex];
            if (actReaderNode) {
                
                if (actReaderNode.hasAttribute("class")) {
                    // If the class Attribute already exists

                    if (!actReaderNode.getAttribute("class").includes(this.ClassNameHighlight)) {
                        // If the highlight class isn't assigned yet
                        actReaderNode.setAttribute("class", actReaderNode.getAttribute("class").concat(" ", this.ClassNameHighlight));
                    }
                } else {
                    // In case, if the class Attribute don't exist
                    actReaderNode.setAttribute("class", this.ClassNameHighlight);
                }

                // Set Focus on node
                actReaderNode.scrollIntoView();
            }
        });

        // Pause
        this.utterance.addEventListener("pause", (event) => {
            // Make Play-Button visible
            this.NodeButtonPlay.style.display = "block";

            // Make Pause-Button invisible
            this.NodeButtonPause.style.display = "none";

            // Set Property "Reading"
            this.Reading = true;
        });

        // End
        this.utterance.addEventListener("end", (event) => {
            // If the reader reaches the end of the spoken text, try to fetch the next text and remove text highlighting
            if (event.charIndex === this.utterance.text.length) {
                // removing Highlighting-class
                this.ClearHighlightedNodes();

                this.FetchNextTextNode();

                // If next Text Node could be fetched, start reading
                if (this.ActualReadingNodeIndex !== null) {
                    window.speechSynthesis.speak(this.utterance);

                } else {
                    // Otherwise end of chapter reached: stop reading
                    // Make Play-Button visible
                    this.NodeButtonPlay.style.display = "block";

                    // Make Pause-Button invisible
                    this.NodeButtonPause.style.display = "none";

                    // Set Property "Reading", "ActualReadingNodeIndex" and reset reader to the first node
                    this.Reading = false;
                    this.ActualReadingNodeIndex = -1;
                    this.FetchNextTextNode();
                }

            } else {
                // Otherwise the stop-event was fired: stop reading

                // Make Play-Button visible
                this.NodeButtonPlay.style.display = "block";

                // Make Pause-Button invisible
                this.NodeButtonPause.style.display = "none";

                // Set Property "Reading", "ActualReadingNodeIndex" and reset reader to the first node
                this.Reading = false;
                this.ActualReadingNodeIndex = -1;
                this.FetchNextTextNode();

                // removing Highlighting-class
                this.ClearHighlightedNodes();
            }

        });

        // Resume
        this.utterance.addEventListener("resume", (event) => {
            // Make Play-Button invisible
            this.NodeButtonPlay.style.display = "none";

            // Make Pause-Button visible
            this.NodeButtonPause.style.display = "block";

            // Set Property "Reading"
            this.Reading = true;
        });

        // --- Setup UI-Events ---

        // Start
        if (this.NodeButtonPlay) {
            this.NodeButtonPlay.addEventListener("click", (event) => {
                // If Speech Synthesis actual not speaking, start speaking
                if (!window.speechSynthesis.speaking && this.utterance.text !== "") {
                    window.speechSynthesis.speak(this.utterance);
                }

                // If Speech Synthesis was paused, resume speaking
                if (window.speechSynthesis.paused && this.utterance.text !== "") {
                    window.speechSynthesis.resume();
                }
            });
        }

        // Pause
        if (this.NodeButtonPause) {
            this.NodeButtonPause.addEventListener("click", (event) => {
                // Pause speech synthesis, if speaking actually
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                }
            });
        }

        // Stop
        if (this.NodeButtonStop) {
            this.NodeButtonStop.addEventListener("click", (event) => {
                // Stop speech synthesis, if speaking actually
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
            });
        }

        // Volume
        if (this.NodeVolumeRange) {
            this.NodeVolumeRange.addEventListener("change", (event) => {
                this.ChangeVolume(event.target.value);
            });
        }

        // Speed
        if (this.NodeRateRange) {
            this.NodeRateRange.addEventListener("change", (event) => {
                this.ChangeSpeedRate(event.target.value);
            });
        }

        // Voice
        if (this.NodeVoiceSelection) {
            this.NodeVoiceSelection.addEventListener("change", (event) => {
                this.ChangeVoice(event.target.value);
            });
        }
    }

    /**
     * Determines the available voices on the system and list them into the selection Element "VoiceSelection", if named.
     */
    QueryVoices () {
        // Proceed only, if NodeVoiceSelection is available
        if (this.NodeVoiceSelection) {
            const VOICES = window.speechSynthesis.getVoices();

            // Clear Selector-List before filling
            this.NodeVoiceSelection.innerHTML = "";

            // Fill Selector-List with available Voices
            for (let i = 0; i < VOICES.length; i++) {
                const OPTION_ELEMENT = document.createElement("option");
                OPTION_ELEMENT.textContent = `${VOICES[i].name}`;

                // Add the name to the attribute value
                OPTION_ELEMENT.setAttribute("value", VOICES[i].name);

                this.NodeVoiceSelection.appendChild(OPTION_ELEMENT);
            }
        }
    }

    /**
     * Changes the volume level of the speech synthesis.
     * The speaking will stop before change and start again after changing the value.
     * @param {number} NewVolumeLevel Sets the new Volume level. Should be an number between 0 and 1.
     */
    ChangeVolume (NewVolumeLevel) {
        // Stop Reading before changing value, otherwise value change will have no effect
        if (this.Reading) {
            window.speechSynthesis.cancel();
        }

        // Change Volume
        if (NewVolumeLevel >= 0 && NewVolumeLevel <= 1) {
            this.utterance.volume = NewVolumeLevel;
        }

        // Start Reading, if Text-Reader was active before value change
        if (this.Reading) {
            window.speechSynthesis.speak(this.utterance);
        }
    }

    /**
     * Changes the speed rate of the speech synthesis.
     * The speaking will stop before change and start again after changing the value.
     * @param {number} NewSpeedRate Sets the new Speed Rate of the speech synthesis. Should be a number between 0.1 and 10.
     */
    ChangeSpeedRate (NewSpeedRate) {
        // Stop Reading before changing value, otherwise value change will have no effect
        if (this.Reading) {
            window.speechSynthesis.cancel();
        }

        // Change Speed Rate
        if (NewSpeedRate >= 0.1 && NewSpeedRate <= 10) {
            this.utterance.rate = NewSpeedRate;
        }

        // Start Reading, if Text-Reader was active before value change
        if (this.Reading) {
            window.speechSynthesis.speak(this.utterance);
        }
    }

    /**
     * Changes the voice of the speech synthesis.
     * The speaking will stop before change and start again after changing the value.
     * @param {string} NewVoiceName Switches to another voice of the speech synthesis. Should be a valid name of the available voices.
     */
    ChangeVoice (NewVoiceName) {
        // Stop Reading before changing value, otherwise value change will have no effect
        if (this.Reading) {
            window.speechSynthesis.cancel();
        }

        // Determine Voice-Element
        const VOICES = window.speechSynthesis.getVoices();
        for (let i = 0; i < VOICES.length; i++) {

            if (VOICES[i].name === NewVoiceName) {
                // Change Voice
                this.utterance.voice = VOICES[i];
                break;
            }
        }

        // Start Reading, if Text-Reader was active before value change
        if (this.Reading) {
            window.speechSynthesis.speak(this.utterance);
        }
    }

    /**
     * Initialize the Text-Reader to a specific Text Node.
     * @param {string} ActualChapterTitle Sets the actual chapter title name in the Text-Reader-Box.
     * @param {Node} ChapterNode Sets the complete HTML-Node, which should be read.
     */
    InitializeChapter(ActualChapterTitle, ChapterNode) {
        // Stop speaking first, if speech synthesis is reading a chapter
        window.speechSynthesis.cancel();

        // If applicable remove all highlighted boxes
        this.ClearHighlightedNodes();

        // Show Chapter Title
        if (this.NodeActualChapterTitle) {
            this.NodeActualChapterTitle.innerHTML = ActualChapterTitle;
        }

        // Select all Chapter Nodes
        this.ReadingNodes = ChapterNode.querySelectorAll("*");

        if (this.ReadingNodes.length > 0) {
            this.ActualReadingNodeIndex = -1;

            // Fetch the first text-Node
            this.FetchNextTextNode();
        } else {
            // Otherwise no Nodes selected
            this.ActualReadingNodeIndex = null;
        }
    }

    /**
     * Try to fetch the next readable Text-Node for the Text-Reader.
     * If successful the Property ActualReadingNodeIndex will be set to the next readable index in the ReadingNodes-Array.
     * If there is no more readable content, the Property ActualReadingNodeIndex will be set to null.
     */
    FetchNextTextNode() {
        if (this.ReadingNodes.length > 0 && this.ActualReadingNodeIndex !== null) {
            for (let i = this.ActualReadingNodeIndex + 1; i < this.ReadingNodes.length; i++) {

                // Check child node if it contains further child nodes, which are already part of the ReadingNodes-Array
                let SkipNode = false;
                const CheckChilds = this.ReadingNodes[i].children;
                for (let j = 0; j < CheckChilds.length; j++) {
                    if (CheckChilds[j].innerText !== undefined && CheckChilds[j].innerText !== "" && Array.from(this.ReadingNodes).includes(CheckChilds[j])) {
                        // If child node contains text and is part of the ReadingNodes-Array --> Skip this node.
                        SkipNode = true;
                        break;
                    }
                }

                if (SkipNode) {
                    continue;
                }

                if (this.ReadingNodes[i].innerText !== undefined && this.ReadingNodes[i].innerText !== "") {
                    // If Child Node has Inner Text, set this Text to the speech synthesis
                    this.utterance.text = this.ReadingNodes[i].innerText;
                    this.ActualReadingNodeIndex = i;
                    return;
                }
            }

            // If the code reaches this position, there is no more text to speech
            this.ActualReadingNodeIndex = null;
        }
    }

    /**
     * This Method will remove the Highlight-Class from each Node of the full document.
     */
    ClearHighlightedNodes() {
        Array.from(document.getElementsByClassName(this.ClassNameHighlight)).forEach((element) => {
            element.setAttribute("class", element.getAttribute("class").replace(this.ClassNameHighlight, "").trim());

            // Remove the class-Attribute if empty
            if (element.getAttribute("class").length === 0) {
                element.removeAttribute("class");
            }
        });
    }
}