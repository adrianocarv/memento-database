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


////Funtion
function zerarInfo(entry) {
  entry.set("infoDataUltimaAtualizacao", null);
  entry.set("infoDuracaoUltimaExecucao", null);
}


////Funtion
function atualizarInfo(entry, i, f) {

  //infoDataUltimaAtualizacao
  entry.set("infoDataUltimaAtualizacao", moment().toDate().getTime());

  //infoDuracaoUltimaExecucao
  var duracao = f.diff(i, "seconds");
  entry.set("infoDuracaoUltimaExecucao", duracao);
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

    if( (isContactField || semPessoa) && entry.field("Data de empréstimo") == null ){
      entry.set("checkLendInconsistence", 0);
    }else{
      entry.set("checkLendInconsistence", 1);
    }

  }

  //group all inconsistence
  var inconsistences = entry.field("checkNoPicture") + entry.field("checkLendInconsistence");
  entry.set("checkAnyInconsistence", inconsistences);

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

  message("General Check - Starting...");

  var entries = lib().entries();
  var codigosArrayLib = [];

  message("Registros carregados. Percorrendo...");

  var inicio = moment();
  for (var i = 0; i < entries.length; i++) {

    //Load codigosArrayLib
    entryConsistency(entries[i], isContactField);

    //Load codigosArrayLib
    if(useSequenceCode){
      codigosArrayLib.push(parseInt(entries[i].field("Código")));
    }else{
      entries[i].set("checkCodigoInconsistence", 0);  
    }
	
    //zerarInfo
    zerarInfo(entries[i]);

    if(i % 25 == 0)
      message("Registro " + (i+1) + " de " + entries.length + "...");
  }

  //checkUnique
  if(useSequenceCode){
    codeSequenceCheck(entries, codigosArrayLib);
  }
  var fim = moment();

  //atualizarInfo
  atualizarInfo(entries[1], inicio, fim);

  
  message("General Check - Concluído!");
}


//Function
function codeSequenceCheck(entries, codigosArrayLib){
  
  message("Verificando o sequencial dos códigos...");

  //checkUnique
  codigosArrayLib.sort(sortNumber);
  var index = 0;
  var inconsistenceValue = 0;
  for (var i = 0; i < codigosArrayLib.length; i++) {

    index++;

    if(codigosArrayLib[i] < index){ //código duplicado
	  inconsistenceValue = 1;
  	  index--;
    }else if(codigosArrayLib[i] > index){ //lacuna de código
	  inconsistenceValue = 1;
	  index++;
    }else{
	  inconsistenceValue = 0;
	}
	
	entries[i].set("checkCodigoInconsistence", inconsistenceValue); 
    entries[i].set("checkAnyInconsistence", entries[i].field("checkAnyInconsistence") + inconsistenceValue);
	
    if(i % 25 == 0)
      message("Código " + (i+1) + " de " + entries.length + "...");
  }
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
function comparaData(a, b){

  if(a.date() == b.date() && a.month() == b.month() && a.year() == b.year())
    return 0;

  return a < b ? -1 : 1;
}
