// Initialize Text-Reader
const OIReader = new InstructionTextReader("aside.TextReader svg.ReaderPlay", "aside.TextReader svg.ReaderPause", "aside.TextReader svg.ReaderStop", "#TextReaderChapter", "#TextReaderVoice", "#TextReaderVolume", "#TextReaderSpeed", "ReaderHighlight");

// Setup Event-Listener for each Text-Reader Button behind the chapter title
const Kapitel = document.querySelectorAll("main > section");
Kapitel.forEach((Chapter, index) => {
    Chapter.querySelector("h1 div").addEventListener("click", (event) => {
        // Show selected Chapter Title in Text-Reader Menu
        OIReader.InitializeChapter(`Chapter ${index + 1}`, Chapter);

        // Show Text-Reader Menu
        document.getElementById("TextReaderVisible").checked = true;
        document.getElementById("TextReaderProperties").checked = false;
    });
});

// Hide Text-Reader Menu on startup
document.getElementById("TextReaderVisible").checked = false;