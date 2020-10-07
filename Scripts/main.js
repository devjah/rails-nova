exports.activate = function () {
  // Do work when the extension is activated
};

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
};

nova.commands.register("devjah.erbtag", async (editor) => {
  
  let selectedRanges = editor.selectedRanges
  const originalSelection = selectedRanges;

  const brackets = [
    ["<%= ", " %>"],
    ["<% ", " %>"],
    ["<%# ", " %>"],
  ];

  var bracketsToUseIndex = 0;

  
  // Selects the whole line for all "empty" ranges (ranges without selection, only a cursor position)
  selectedRanges = selectedRanges.map((r) =>
    r.empty ? editor.getLineRangeForRange(r) : r
  );
  

  const lengths = selectedRanges.map((r) => r.length);
  let newSelection = [];
  await editor.edit(function (e) {
    for (const [index, range] of selectedRanges.entries()) {
      const text = editor.getTextInRange(range);
      console.log("selected text: " + text);
      console.log("selected text length: " + text.length);

      var existingBrackets = [];
      let cursorMove = 0

      for (var i = 0; i < brackets.length; i++) {
        if (text.includes(brackets[i][0])) {
          existingBrackets = [brackets[i][0], brackets[i][1]];
          bracketsToUseIndex = i + 1;
          if (bracketsToUseIndex + 1 > brackets.length) {
            bracketsToUseIndex = 0;
          }
          cursorMove = brackets[bracketsToUseIndex][0].length - existingBrackets[0].length
          console.log("changing bracket " + bracketsToUseIndex);
        }
      }
      
      console.log("bracketsToUseIndex: " + bracketsToUseIndex);
      bracketsToUse = brackets[bracketsToUseIndex];
      const originalRange = originalSelection[index];

      if (existingBrackets.length > 0) {
        console.log("editor range: " + range);
        var new_text = text.replace(existingBrackets[0], bracketsToUse[0]);
        e.replace(range, new_text);
      } else {
        console.log("🤔originalRange "+ originalRange.length)
        if (originalRange.length > 0) {
          e.replace(originalRange, bracketsToUse[0] + text + bracketsToUse[1]);
          cursorMove = bracketsToUse[0].length + text.length
        } else {
          e.replace(originalRange, bracketsToUse[0] + "" + bracketsToUse[1]);
          cursorMove = bracketsToUse[0].length
        }
      }

      newSelection.push(
        new Range(
          originalRange.start + cursorMove,
          originalRange.start + cursorMove
        )
      );
    }
   
    
  });

  editor.selectedRanges = newSelection;
  
});
