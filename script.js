//// დაგვჭირდება ეს ელემენტები
let elements = {
    editor: null, /// ტექსტის ჩასაწერი div-ი
    status: null, /// სტატუსის მესიჯი
    themeSelect: null, /// თემის სარჩევი
    fontSizeSelect: null, /// ფონტის სიდიდე
    fontFamilySelect: null, /// ფონტის ოჯახი
    textColorInput: null, /// ფერის ასარჩევი
    boldButton: null, /// bold-ის ღილაკი
    italicButton: null, /// Italic-ის ღილაკი
    underlineButton: null, /// Underline-ის ღილაკი
    alignLeftButton: null, /// ტექსტი მარცხნივ
    alignCenterButton: null, /// ტექსტი ცენტრში
    alignRightButton: null, /// ტექსტი მარჯვნივ
    saveButton: null, /// დასეივების ღილაკი
    loadButton: null, /// Load from file button
    clearButton: null, /// Clear editor button
    fileInput: null, /// Hidden file input element
  };
  
  //// სტატუსის მესიჯები
  const STATUS = {
    READY: "Ready to edit",
    EDITING: "Editing...",
    SAVED: "Changes saved",
    DOCUMENT_SAVED: "Document saved as document.html",
    DOCUMENT_LOADED: "Document loaded successfully",
    EDITOR_CLEARED: "Editor cleared",
  };
  
  //// დასეივებული ტექსტის გასაღები (სახელი)
  const STORAGE_KEY = "textEditorContent";
  
  //// ამ ფუნქციით არ მოგვიწევს ყოველ ჯერზე
  //// document.getElementById(id); დაწერა
  function getElement(id) {
    return document.getElementById(id);
  }
  
  //// შევინახოთ ყველა DOM-ის ელემენტი ობიექტში
  
  function cacheElements() {
    elements.editor = getElement("editor");
    elements.status = getElement("status");
    elements.themeSelect = getElement("theme");
    elements.fontSizeSelect = getElement("font-size");
    elements.fontFamilySelect = getElement("font-family");
    elements.textColorInput = getElement("text-color");
    elements.boldButton = getElement("bold-button");
    elements.italicButton = getElement("italic-button");
    elements.underlineButton = getElement("underline-button");
    elements.alignLeftButton = getElement("align-left-button");
    elements.alignCenterButton = getElement("align-center-button");
    elements.alignRightButton = getElement("align-right-button");
    elements.saveButton = getElement("save-button");
    elements.loadButton = getElement("load-button");
    elements.clearButton = getElement("clear-button");
    elements.fileInput = getElement("file-input");
  }
  
  //// სტატუსის ტექსტის გამოჩენა
  function setStatus(message) {
    elements.status.textContent = message;
  }
  
  //// დოკუმენტის კომანდებისთვის (BOLD, ITALIC, UNDERLINE)
  function execCmd(command) {
    //| მონიშნულ ტექსტზე გამოიყენებს შესაბამის კომანდს
    document.execCommand(command, false, null);
    //\ დაკლიკების გარეშე გააგრძელოს მომხმარებელმა წერა
    elements.editor.focus();
    //* დაკლიკებულ ღილაკს highlight-ს უკეთებს
    updateButtonStates();
  }
  
  //// დოკუმენტის კომანდებისთვის (FONTSIZE, FONTFAMILY, FONTCOLOR)
  function execCmdWithArg(command, arg) {
    document.execCommand(command, false, arg);
    elements.editor.focus();
    updateButtonStates();
  }
  
  function onEditorFocus(e) {
    if (e.target.innerHTML === "") {
      e.target.innerHTML = "";
    }
    updateButtonStates();
  }
  
  function onEditorBlur(e) {
    if (e.target.innerHTML === "") {
      e.target.innerHTML = "";
    }
  }
  
  //// მოქმედების სტატუსის საჩვენებლად
  function onEditorInput() {
    setStatus(STATUS.EDITING);
    saveToStorage();
    setTimeout(() => setStatus(STATUS.SAVED), 1000);
  
    updateCounts();
  }
  
  ////  როდესაც ტექსტი აირჩევა ან კურსორი გადაადგილდება  updates აკეთებს style-ებზე
  
  function onSelectionChange() {
    updateButtonStates();
  }
  
  //// ==============================================
  //// UPDATE BUTTONS BASED ON TEXT FORMATTING
  //// ==============================================
  
  ////ეს კოდი ანაახლებს ფორმატის და განლაგებას buttoneb-ის
  
  function updateButtonStates() {
    toggleButtonState(elements.boldButton, "bold");
    toggleButtonState(elements.italicButton, "italic");
    toggleButtonState(elements.underlineButton, "underline");
  
    /// ამოწმებს ახლანდელ ტექსტის განლაგებას და ანაახლებს buttons
    let alignment = getSelectionAlignment();
    toggleButtonState(elements.alignLeftButton, alignment === "left");
    toggleButtonState(elements.alignCenterButton, alignment === "center");
    toggleButtonState(elements.alignRightButton, alignment === "right");
  }
  
  //|  თუ ნებისმიერი toolbar button არის აქტიური, და კურსორით მონიშნავ მას კონკრეტულ toolbarr-ის button-ს highlight-ს უკეთებს
  
  function toggleButtonState(button, isActive) {
    /// ეს კოდი ამოწმებს არის თუარა კონკრეტული string კონკრეტული ფორმატით დაწერილი
    if (typeof isActive === "string") {
      //// ამოწმებს command-ის ახლანდელ მდგომარეობას
      isActive = document.queryCommandState(isActive);
    }
  
    if (isActive) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  }
  
  /**
   * // ამოწმებს რა განლაგებით არის ტექსტი (მარცხნივ, ცენტრში, მარჯვნივ)
   * // გვიბრუნებს ტიპს ან null-ს
   */
  function getSelectionAlignment() {
    if (document.queryCommandState("justifyCenter")) return "center";
    if (document.queryCommandState("justifyRight")) return "right";
    if (document.queryCommandState("justifyLeft")) {
      ////  ამოწმებს არის თუარა ტექსტი განლაგებული მარცხნივ
      let selection = window.getSelection();
      if (selection.rangeCount > 0) {
        let range = selection.getRangeAt(0);
        let parent = range.commonAncestorContainer.parentNode;
        if (
          parent &&
          (parent.style.textAlign === "left" ||
            parent.getAttribute("align") === "left")
        ) {
          return "left";
        }
      }
      return null;
    }
    return null;
  }
  
  /// ==============================================
  /// KEYBOARD SHORTCUTS (Ctrl + B, I, U, S)
  /// ==============================================
  
  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          execCmd("bold");
          break;
        case "i":
          e.preventDefault();
          execCmd("italic");
          break;
        case "u":
          e.preventDefault();
          execCmd("underline");
          break;
        case "s":
          e.preventDefault();
          saveDoc();
          break;
      }
    }
  }
  
  //| ==============================================
  //| TEXT FORMATTING HANDLERS
  //| ==============================================
  
  ///  font family-ის ცვლილების ფუნქცია
  
  function onFontFamilyChange() {
    execCmdWithArg("fontName", elements.fontFamilySelect.value);
    elements.editor.focus();
  }
  
  //// font size-ის ცვლილების ფუნქცია
  
  function onFontSizeChange() {
    let size =
      elements.fontSizeSelect.options[elements.fontSizeSelect.selectedIndex].text;
    execCmdWithArg("fontSize", elements.fontSizeSelect.value);
    setStatus("Text size changed to " + size);
    elements.editor.focus();
  }
  
  //* ფერის შეცვლა color inputit
  
  function onTextColorChange() {
    execCmdWithArg("foreColor", elements.textColorInput.value);
    elements.editor.focus();
  }
  
  //\ themes-ის ცვლილების ფუნქცია
  
  function onThemeChange() {
    let body = document.body;
    body.className = ""; // შლის ძელი themes class name-ს
    if (elements.themeSelect.value !== "light") {
      body.classList.add("theme-" + elements.themeSelect.value);
    }
    setStatus("Theme changed to " + elements.themeSelect.value);
  }
  
  //// ==============================================
  //// FILE FUNCTIONS: Save / Load / Clear
  //// ==============================================
  
  /// ტექსტის ფაილის შენახვა
  function saveDoc() {
    let content = elements.editor.innerHTML;
    let blob = new Blob([content], { type: "text/html" });
    let url = URL.createObjectURL(blob);
  
    // Create and click a hidden link to download the file
    let a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  
    // Free memory after download
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  
    setStatus(STATUS.DOCUMENT_SAVED);
  }
  
  /**
   * Load a document file into the editor
   * @param {Event} e
   */
  function loadDoc(e) {
    let file = e.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        elements.editor.innerHTML = e.target.result;
        setStatus(STATUS.DOCUMENT_LOADED);
        saveToStorage();
        updateButtonStates();
      };
      reader.readAsText(file);
    }
    elements.fileInput.value = "";
  }
  
  /**
   * ედიტორის გასუფთავების clear-ის ფუნქცია
   */
  function clearEditor() {
    elements.editor.innerHTML = "";
    setStatus(STATUS.EDITOR_CLEARED);
    saveToStorage();
    elements.editor.focus();
    updateButtonStates();
    countReset();
  }
  
  // ==============================================
  //STORAGE FUNCTIONS
  // ==============================================
  
  /**
   * text editoris content-ის დაისეივების ფუნქცია
   */
  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, elements.editor.innerHTML);
  }
  
  /**
   * text editoris content-ის load-ის ფუნქცია
   */
  function loadFromStorage() {
    let saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      elements.editor.innerHTML = saved;
    }
  }
  
  // ==============================================
  // SETUP EVENT LISTENERS
  // ==============================================
  
  /**
   * დავაკავშიროთ ყველა button ფუნქციებთან
   */
  function attachEvents() {
    // Editor events
    elements.editor.addEventListener("focus", onEditorFocus);
    elements.editor.addEventListener("blur", onEditorBlur);
    elements.editor.addEventListener("input", onEditorInput);
    elements.editor.addEventListener("mouseup", updateButtonStates);
    elements.editor.addEventListener("keyup", updateButtonStates);
  
    // Formatting buttons
    elements.boldButton.addEventListener("click", () => execCmd("bold"));
    elements.italicButton.addEventListener("click", () => execCmd("italic"));
    elements.underlineButton.addEventListener("click", () =>
      execCmd("underline")
    );
    elements.alignLeftButton.addEventListener("click", () =>
      execCmd("justifyLeft")
    );
    elements.alignCenterButton.addEventListener("click", () =>
      execCmd("justifyCenter")
    );
    elements.alignRightButton.addEventListener("click", () =>
      execCmd("justifyRight")
    );
  
    // Dropdowns
    elements.fontFamilySelect.addEventListener("change", onFontFamilyChange);
    elements.fontSizeSelect.addEventListener("change", onFontSizeChange);
    elements.textColorInput.addEventListener("change", onTextColorChange);
    elements.themeSelect.addEventListener("change", onThemeChange);
  
    // File buttons
    elements.saveButton.addEventListener("click", saveDoc);
    elements.loadButton.addEventListener("click", () =>
      elements.fileInput.click()
    );
    elements.clearButton.addEventListener("click", clearEditor);
    elements.fileInput.addEventListener("change", loadDoc);
  
    // Keyboard shortcuts
    document.addEventListener("keydown", onKeyDown);
  
    // Text selection change
    document.addEventListener("selectionchange", onSelectionChange);
  }
  
  //// init გაეშვება როცა საიტი ბოლომდე ჩაიტვირთება
  
  function updateCounts() {
    let editor = document.getElementById("editor");
    //// რათა space-ები არ ჩაითვალოს ქარაქთერად
    let text = editor.textContent.replace(/\u200B/g, "").trim();
  
    //\ ქარაქთერების რაოდენობა
    let charCount = text.length;
    document.getElementById("charCount").textContent = charCount;
  }
  function countReset() {
    document.getElementById("charCount").textContent = "0";
  }
  let clickCnt = 0;
  let click = document.getElementById("click");
  function clickSound() {
    let buttons = document.querySelectorAll("button");
  
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        //// დაკლიკების ხმა იქნება თუ mute არ ადევს
        if (clickCnt % 2 === 0) {
          click.currentTime = 0;
          click.play();
        }
      });
    });
  }
  
  function typingSound() {
    let editor = document.getElementById("editor");
    let muteBtn = document.getElementById("muteBtn");
    let type = document.getElementById("type");
  
    //// გაჩუმების ღილაკის მდგომარეობის გასარკვევად
    muteBtn.textContent = clickCnt % 2 === 0 ? "🔊" : "🔇";
  
    muteBtn.addEventListener("click", () => {
      clickCnt++;
      muteBtn.textContent = clickCnt % 2 === 0 ? "🔊" : "🔇";
      editor.focus();
      if (clickCnt % 2 === 0) {
        type.currentTime = 0;
        click.play();
      }
    });
  
    //// როდის ქონდეს აკრეფვას ხმა
    editor.addEventListener("input", () => {
      if (clickCnt % 2 === 0) {
        type.currentTime = 0;
        type.play();
      }
    });
  }
  /// ==============================================
  /// ინიციალიზაცია
  /// ==============================================
  
  //// გაეშვება ყველა ფუნქცია როცა გვერდი ჩაიტვირთება
  function init() {
    cacheElements(); //// DOM-ის ელემენტები
    elements.editor.focus();
    loadFromStorage(); //// შენახული ფაილის გახსნა
    attachEvents(); //// ღილაკების და event-ების ლოგიკები
    updateButtonStates(); ////  ღილაკის სტილები
  
    clickSound(); //// ხმა დაკლიკებაზე
    typingSound(); //// ხმა აკრეფვაზე
  }
  document.addEventListener("DOMContentLoaded", init);
  