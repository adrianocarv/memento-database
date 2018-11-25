////
////FUNTIONS
////

////Funtion
function uniqueCode(codeFieldName) {
  var myField = entry().field(codeFieldName);       // Value of myField
  var entries = lib().entries();                    // Array containing all entries
 
  var unique = true;                                // Presuming, initially
  for (var i = 0; i < entries.length; i++) {        // Loop through all entries
	if (entries[i].field(codeFieldName) == myField) // If there is ever a match,
		unique = false;                            	// Remember it
  }
 
  if (!unique) { // If not unique,
	cancel(); // Disallow the save
	message("Código já existente.");  // Tell the user
  }
}
