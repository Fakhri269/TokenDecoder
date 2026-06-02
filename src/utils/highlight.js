export function highlightJSON(json) {
  return json.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "syn-num";
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? "syn-key" : "syn-str";
      } else if (/true|false/.test(match)) {
        cls = "syn-bool";
      } else if (/null/.test(match)) {
        cls = "syn-null";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}
