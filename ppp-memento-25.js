////
////FUNTIONS
////

////Funtion
function zerarInfo(entry) {
  entry.set("infoMediaContatoPorDia", null);
  entry.set("infoDataUltimaAtualizacao", null);
  entry.set("infoDuracaoUltimaExecucao", null);
}

////Funtion
function atualizarInfo(entry, total, i, f) {

  //infoMediaContatoPorDia
  var mediaContatoPorDia = total / 365;
  entry.set("infoMediaContatoPorDia", mediaContatoPorDia);

  //infoDataUltimaAtualizacao
  entry.set("infoDataUltimaAtualizacao", moment().toDate().getTime());

  //infoDuracaoUltimaExecucao
  var duracao = f.diff(i, "seconds");
  entry.set("infoDuracaoUltimaExecucao", duracao);
}

////Funtion
function realizarChecagens(entry) {
  //checkSemDataProximaAcao
  if(entry.field("Data da próxima ação") == null){
    entry.set("checkSemDataProximaAcao", 1);
  }else{
    entry.set("checkSemDataProximaAcao", 0);
  }

  //checkDataProximaAcaoDistante
  var proximaAcao = entry.field("Data da próxima ação");
  var daquiHaUmAno = moment();
  daquiHaUmAno.add(1,"y");
  if(proximaAcao != null && comparaData( moment(proximaAcao), daquiHaUmAno) > 0 ){
    entry.set("checkDataProximaAcaoDistante", 1);
  }else{
    entry.set("checkDataProximaAcaoDistante", 0);
  }

  //checkSemFrequencia
  if(entry.field("Frequência").length == 0){
    entry.set("checkSemFrequencia", 1);
  }else{
    entry.set("checkSemFrequencia", 0);
  }

  //checkNomeDivergenteContato
  var contact = entry.field("Contato");
  if(contact != null && entry.field("Nome") == contact.fullName){
    entry.set("checkNomeDivergenteContato", 0);
  }else{
    entry.set("checkNomeDivergenteContato", 1);
  }

  //checkSemDataNascimento
  if(entry.field("Data de nascimento") == null){
    entry.set("checkSemDataNascimento", 1);
  }else{
    entry.set("checkSemDataNascimento", 0);
  }

  //checkPendencia
  entry.set("checkPendencia", 0);
  if( entry.field("checkSemDataProximaAcao") == 1 ||
      entry.field("checkDataProximaAcaoDistante") == 1 ||
      entry.field("checkSemFrequencia") == 1 ||
      entry.field("checkNomeDivergenteContato") == 1 ||
      entry.field("checkSemDataNascimento") == 1){
    entry.set("checkPendencia", 1);
  }
}

////Funtion
function atualizarProximaAcao(entry) {

  var dataField = entry.field("Data da próxima ação");
  var dataProximaAcao = dataField == null ? null : moment(dataField);

  // A) se não tiver próxima ação, seta
  if(dataProximaAcao == null){
    setDataProximaAcao(entry);
  }

  // B) se tiver aniversário antes, este será a próxima data
  var proximoNiver = getProximaDataAniversario(entry);

  if( proximoNiver != null && (dataProximaAcao == null || comparaData( proximoNiver , dataProximaAcao) <= 0 ) ){
    dataProximaAcao = proximoNiver;
    entry.set("Data da próxima ação", dataProximaAcao.toDate().getTime());
  }

  // C) Se tiver ação definida e concluída, loga a ação e calcula nova data
  if( entry.field("OK") && entry.field("Próxima ação").length > 0){

    //1. logar ação
    logarAcaoRealizada(entry);
	
    //2. setar próxima data, conforme a frequência
    setDataProximaAcao(entry);
  }

  //G) Atualiza a diferença de dias entre hoje e a data da próxima ação
  var diasProximaAcao = moment(entry.field("Data da próxima ação")).diff(moment(),'days') + 1;
  entry.set("diasProximaAcao", diasProximaAcao);

}

////Funtion
function setDataProximaAcao(entry) {
  var novaData = moment();
  novaData.add(getDiasFrequencia(entry),"d");
  entry.set("Data da próxima ação", novaData.toDate().getTime());
  entry.set("Próxima ação", "");
  entry.set("OK", false);
}

////Funtion
function getProximaDataAniversario(entry) {
  var dataField = entry.field("Data de nascimento");
  if(dataField == null)
    return null;

  var proximoNiver = moment(dataField);
  proximoNiver.year(moment().year());

  if( comparaData(proximoNiver, moment()) < 0 ){
    proximoNiver.add(1,"y");
  }

  return proximoNiver;
}

////Funtion
function getIdade(entry) {
  var dataField = entry.field("Data de nascimento");
  if(dataField == null)
    return null;

  var nascimento = moment(dataField);
  var idade = moment().year() - nascimento.year();

  //subtrai um ano da idade, caso ainda não tenha feito aniversário neste ano
  nascimento.year(moment().year());
  if( comparaData(moment(), nascimento) < 0 )
    idade--;

  return idade;
}

////Funtion
function getDiasFrequencia(entry) {
  var dataField = entry.field("Frequência");
  if(dataField.length == 0)
    return 0;

  if(dataField == "Semanal")
    return 7;
  if(dataField == "Quinzenal")
    return 15;
  if(dataField == "Mensal")
    return 30;
  if(dataField == "Bimestral")
    return 60;
  if(dataField == "Trimestral")
    return 90;
  if(dataField == "Quadrimestral")
    return 120;
  if(dataField == "Semestral")
    return 180;
  if(dataField == "Anual")
    return 365;

  return 0;
}

////Funtion
function getFrequenciaPorAno(entry) {
  var dataField = entry.field("Frequência");
  if(dataField.length == 0)
    return 0;

  if(dataField == "Semanal")
    return 52;
  if(dataField == "Quinzenal")
    return 26;
  if(dataField == "Mensal")
    return 12;
  if(dataField == "Bimestral")
    return 6;
  if(dataField == "Trimestral")
    return 4;
  if(dataField == "Quadrimestral")
    return 3;
  if(dataField == "Semestral")
    return 2;
  if(dataField == "Anual")
    return 1;

  return 0;
}

////Funtion
function atualizarStatus(entry) {

  // A) statusPendencia
  entry.set("statusPendencia", null);

  var text = "";

  if( entry.field("checkSemDataProximaAcao") == 1 )
    text += " Sem data da próxima ação.  ";
  if( entry.field("checkDataProximaAcaoDistante") == 1 )
    text += "Data da próxima ação distante. ";
  if( entry.field("checkSemFrequencia") == 1 )
    text += "Sem frequência. ";
  if( entry.field("checkNomeDivergenteContato") == 1 )
    text += "Nome diverge do contato. ";
  if( entry.field("checkSemDataNascimento") == 1 )
    text += "Sem data de nascimento. ";

  entry.set("statusPendencia", text);

  // B) statusDataProximaAcao
  setStatusDataProximaAcao(entry);
}

////Funtion
function setStatusDataProximaAcao(entry) {
  var dataProximaAcao = moment(entry.field("Data da próxima ação"));
  var diasProximaAcao = entry.field("diasProximaAcao");

  text = "";

  if (diasProximaAcao == -1 ){
    text = "🚫 Ontem";
  } else if (diasProximaAcao == 0 ){
    text = "✔️ Hoje";
  } else if (diasProximaAcao == 1 ){
    text = "Amanhã";
  } else if (diasProximaAcao < -1 ){
    text = "🚫 Há " + (diasProximaAcao * -1) + " dias";
  } else if (diasProximaAcao < 7 ){
    text = getDiaSemanaPtBr(moment(diasProximaAcao).format('ddd'));
  }

  //Aniversário 
  var proximoNiver = getProximaDataAniversario(entry);
  if( proximoNiver != null && comparaData(proximoNiver, dataProximaAcao) == 0 ){
    var ano = moment(entry.field("Data de nascimento")).year();
    if(ano == 1900){
      text += ", Feliz aniversário! 🎂";
    } else {
      var idade = getIdade(entry);
      text += ", " + idade + ( idade == 1 ? " aninho" : " anos" ) + "!  🎂";
    }
  }
  
  entry.set("statusDataProximaAcao", text);

}

////Funtion
function getDiaSemanaPtBr(dayOfWeek) {
  switch (dayOfWeek) {
    case 'Sun': return "Domingo";
    case 'Mon': return "Segunda";
    case 'Tue': return "Terça";
    case 'Wed': return "Quarta";
    case 'Thu': return "Quinta";
    case 'Fri': return "Sexta";
    case 'Sat': return "Sábado";
    default: return dayOfWeek;
  }
}

////Funtion
function logarAcaoRealizada(entry) {

  var logLib = libByName("AC - PPP-log"); // This requires permission
  var logEntry = new Object();

  var dataField = entry.field("Data da próxima ação");
  var dataProximaAcao = dataField == null ? null : moment(dataField);

  logEntry["Data"] = dataProximaAcao.toDate().getTime();
  logEntry["Nome"] = entry.field("Nome");
  logEntry["Ação"] = entry.field("Próxima ação");
  logLib.create(logEntry);
}

////Funtion
function comparaData(a, b){

  if(a.date() == b.date() && a.month() == b.month() && a.year() == b.year())
    return 0;

  return a < b ? -1 : 1;
}
