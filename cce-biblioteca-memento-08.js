////
////FUNTIONS
////

//Function
function getFirstEntry(entryFieldName, entryFieldValue) {
  var entries = lib().entries();
  for (var i = 0; i < entries.length; i++) {
    if(entries[i].field(entryFieldName) == entryFieldValue){
      return entries[i];
    }
  }
  return null;
}


//Function
function toReturn(entry, isContactField) {
  if( entry.field("Situação") == 'Disponível' ){

    if(!isContactField) entry.set("Emprestado para", null);
    entry.set("Data de empréstimo", null);
    entry.set("Paradeiro", "");
    entry.set("Histórico do paradeiro", null);
  }

  //Paradeiro
  if( entry.field("Paradeiro").length > 0){
    var historico = entry.field("Histórico do paradeiro");
    var registro = todayAsString() + ". " + entry.field("Paradeiro");
    var historico = registro + "\n" + historico;
    entry.set("Histórico do paradeiro", historico);
  }
}


//Function
function entryConsistency(entry, isContactField) {

  //checkNoPicture
  if(entry.field("Capa").length == 0){
    entry.set("checkNoPicture", 1);
  }else{
    entry.set("checkNoPicture", 0);
  }

  var semPessoa = isContactField ? entry.field("Emprestado para") == null : entry.field("Emprestado para").length == 0;
  
  //checkLendInconsistence
  if( entry.field("Situação") == 'Emprestado'){

    if( semPessoa || entry.field("Data de empréstimo") == null ){
      entry.set("checkLendInconsistence", 1);
    }else{
      entry.set("checkLendInconsistence", 0);
    }

  }else{

    //if( !semPessoa || entry.field("Data de empréstimo") != null ){
    //  entry.set("checkLendInconsistence", 1);
    //}else{
    //  entry.set("checkLendInconsistence", 0);
    //}
    if( (isContactField || semPessoa) && entry.field("Data de empréstimo") == null ){
      entry.set("checkLendInconsistence", 0);
    }else{
      entry.set("checkLendInconsistence", 1);
    }

  }

  //group all inconsistence
  if(entry.field("checkNoPicture") == 1 || entry.field("checkLendInconsistence") == 1 || entry.field("checkCodigoInconsistence") == 1 ){
    entry.set("checkAnyInconsistence", 1);
  }else{
    entry.set("checkAnyInconsistence", 0);
  }

  //normalize blank Paradeiro
  if( entry.field("Paradeiro") == null ){
    entry.set("Paradeiro", "");
  }
  
  //checkEmprestimoMais60Dias
  var checkDias = isDataEmprestimoAnterior(entry, 60) ? 1 : 0;
  entry.set("checkEmprestimoMais60Dias", checkDias);

  //checkEmprestimoMais120Dias
  var checkDias = isDataEmprestimoAnterior(entry, 120) ? 1 : 0;
  entry.set("checkEmprestimoMais120Dias", checkDias);

}


//Function
function generalCheck(isContactField, useSequenceCode) {
  var entries = lib().entries();
  var codigosArrayLib = [];

  for (var i = 0; i < entries.length; i++) {

    //Load codigosArrayLib
    entryConsistency(entries[i], isContactField);

    //Load codigosArrayLib
    if(useSequenceCode){
      codigosArrayLib.push(parseInt(entries[i].field("Código")));
	}
  }

  //checkUnique
  if(useSequenceCode){
    codeSequenceCheck(codigosArrayLib);
  }
  
  message("General Check - Concluído!");
}


//Function
function codeSequenceCheck(codigosArrayLib){
  
  //checkUnique
  codigosArrayLib.sort(sortNumber);
  var index = 0;
  for (var i = 0; i < codigosArrayLib.length; i++) {

    index++;

    if(codigosArrayLib[i] == index){
	  setCheckCodigoInconsistence("Código", codigosArrayLib[i],0);
    }else if(codigosArrayLib[i] < index){ //código duplicado
	  setCheckCodigoInconsistence("Código", codigosArrayLib[i],1);
  	  index--;
    }else if(codigosArrayLib[i] > index){ //lacuna de código
	  setCheckCodigoInconsistence("Código", codigosArrayLib[i],1);
	  index++;
    }
  }

  message("General Check - Concluído!");
}


//Function
function todayAsString() {
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth()+1; //January is 0!
  var yyyy = today.getFullYear();

  if(dd<10) {
      dd = '0'+dd
  } 
  if(mm<10) {
      mm = '0'+mm
  } 
  today = dd + '/' + mm + '/' + yyyy;
  return today;
}


//Function
function isDataEmprestimoAnterior(entry, diasAntes){
  var dataField = entry.field("Data de empréstimo");
  var dataEmprestimo = dataField == null ? null : moment(dataField);
  var dias = moment();
  dias.subtract(diasAntes,"d");

  return (entry.field("Situação") == 'Emprestado' && comparaData(dataEmprestimo, dias) < 0);
}


//Function
function sortNumber(a,b) {
    return a - b;
}


//Function
function setCheckCodigoInconsistence(codigo, value) {

  var entries = lib().entries();

  for (var i = 0; i < entries.length; i++) {
    if(entries[i].field("Código") == codigo){
      entries[i].set("checkCodigoInconsistence", value);
      break;
    }
  }
}


//Function
function comparaData(a, b){

  if(a.date() == b.date() && a.month() == b.month() && a.year() == b.year())
    return 0;

  return a < b ? -1 : 1;
}
