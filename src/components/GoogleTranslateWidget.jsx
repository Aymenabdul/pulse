import { useEffect } from "react";

let isScriptLoaded = false;

const GoogleTranslateWidget = () => {
  useEffect(() => {
    const setLanguageToTamil = () => {
      const selectElement = document.querySelector(".goog-te-combo");
      if (selectElement) {
        selectElement.value = "ta";
        selectElement.dispatchEvent(new Event("change"));
        return true;
      }
      return false;
    };

    const initializeWidgetAndSetLanguage = () => {
      new window.google.translate.TranslateElement(
        {
          includedLanguages: "ta,en", 
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );

     const maxAttempts = 10;
      let attemptCount = 0;
      const interval = setInterval(() => {
        if (setLanguageToTamil() || attemptCount >= maxAttempts) {
          clearInterval(interval);
        }
        attemptCount++;
      }, 500); 
    };

    window.googleTranslateElementInit = initializeWidgetAndSetLanguage;

    if (!isScriptLoaded) {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
      isScriptLoaded = true;
    }

  }, []); 

  return (
    <div className="p-2">
      <div id="google_translate_element"></div>
    </div>
  );
};

export default GoogleTranslateWidget;