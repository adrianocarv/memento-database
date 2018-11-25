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

////Funtion
function entryConsistency(entry) {

  //checkNoPicture
  if(entry.field("Capa").length == 0){
    entry.set("checkNoPicture", 1);
  }else{
    entry.set("checkNoPicture", 0);
  }

  //checkLendInconsistence
  if( entry.field("Situação") == 'Emprestado'){

    if( entry.field("Emprestado para").length == 0 || entry.field("Data de empréstimo") == null ){
      entry.set("checkLendInconsistence", 1);
    }else{
      entry.set("checkLendInconsistence", 0);
    }

  }else{

    if( entry.field("Emprestado para").length > 0 || entry.field("Data de empréstimo") != null ){
      entry.set("checkLendInconsistence", 1);
    }else{
      entry.set("checkLendInconsistence", 0);
    }

  }

  //checkEmprestimoMais60Dias
  var checkDias = isDataEmprestimoAnterior(entry, 60) ? 1 : 0;
  entry.set("checkEmprestimoMais60Dias", checkDias);

  //checkEmprestimoMais120Dias
  var checkDias = isDataEmprestimoAnterior(entry, 120) ? 1 : 0;
  entry.set("checkEmprestimoMais120Dias", checkDias);

}


////Funtion
function isDataEmprestimoAnterior(entry, diasAntes){
  var dataField = entry.field("Data de empréstimo");
  var dataEmprestimo = dataField == null ? null : moment(dataField);
  var dias = moment();
  dias.subtract(diasAntes,"d");

  return (entry.field("Situação") == 'Emprestado' && comparaData(dataEmprestimo, dias) < 0);
}


////Funtion
function comparaData(a, b){

  if(a.date() == b.date() && a.month() == b.month() && a.year() == b.year())
    return 0;

  return a < b ? -1 : 1;
}
