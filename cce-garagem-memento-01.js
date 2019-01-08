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
function toSave(entry) {

  //Sugere valor inicial para os campos para o momento de finalizar a negociação
  if( entry.field("Ativo") ){
    entry.set("Valor negociado", entry.field("Valor inicial"));
    entry.set("Conclusão", moment().toDate().getTime());
  }

  //Regras sobre o campo "Destino"
  var destinoOld = entry.field("checkDestinoAnterior");
  var destinoNew = entry.field("Destino");
  if( destinoNew != destinoOld ){

    //update "Atualização do destino"
    entry.set("Atualização do destino", moment().toDate().getTime());

    //update "Histórico do destino"
    var historico = entry.field("Histórico do destino");
    var registro = todayAsString() + ". " + entry.field("Destino");
    historico = historico == null ? "" : historico;
    historico = registro + "\n" + historico;
    entry.set("Histórico do destino", historico);

    message(entry.field("Histórico do destino"));

	
    //update "checkDestinoAnterior"
    entry.set("checkDestinoAnterior", entry.field("Destino"));
  }
}


//Function
function getLastLogDescription(entry) {
  var log = entry.field("Histórico do destino");
  var linhas = log == null ? "oi\n" : log.split("\n");
  var linha1 = linhas[0].trim();
  var desc = linha1.substring(12, linha1.length);
  return desc;
}


//Function
function entryConsistency(entry) {

  //checkAtivoDestinoMais28Dias
  var checkDias = isAtivoDestinoAnterior(entry, 28) ? 1 : 0;
  entry.set("checkAtivoDestinoMais28Dias", checkDias);

}


//Function
function isAtivoDestinoAnterior(entry, diasAntes){
  var dataField = entry.field("Atualização do destino");
  var dataDestinoAnterior = dataField == null ? null : moment(dataField);
  var dias = moment();
  dias.subtract(diasAntes,"d");

  return (entry.field("Ativo") && comparaData(dataDestinoAnterior, dias) < 0);
}


//Function
function generalCheck() {
  var entries = lib().entries();

  for (var i = 0; i < entries.length; i++) {
    entryConsistency(entries[i]);
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
function comparaData(a, b){

  if(a.date() == b.date() && a.month() == b.month() && a.year() == b.year())
    return 0;

  return a < b ? -1 : 1;
}
