////
////FUNTIONS
////

////Funtion
function atualizarInfo(entry) {

  //infoMediaContatoPorDia
  var mediaContatoPorDia = totalOcorrenciasContatoAno / 365;
  entry.set("infoMediaContatoPorDia", mediaContatoPorDia);

  //infoDataUltimaAtualizacao
  entry.set("infoDataUltimaAtualizacao", fim.toDate().getTime());

  //infoDuraçãoUltimaAtualizacao
  var duracao = fim.diff(inicio, "seconds");
  entry.set("infoDuraçãoUltimaAtualizacao", duracao);
}

////Funtion
function zerarInfo(entry) {
  entry.set("infoMediaContatoPorDia", 0);
  entry.set("infoDataUltimaAtualizacao", 0);
  entry.set("infoDuraçãoUltimaAtualizacao", 0);
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

  //atualizar próxima ação:
  entry.set("checkContatoSelecionado", 0);

  //DATAS FUTURAS
  var dataField = entry.field("Data da próxima ação");
  var dataProximaAcao = dataField == null ? null : moment(dataField);

  //se data da próxima ação for null, seta o próximo aniversário se tiver
  if( dataProximaAcao == null){
    var proximoNiver = getProximaDataAniversario(entry);
    if( proximoNiver != null )
      entry.set("Data da próxima ação", proximoNiver.toDate().getTime());
  }
  
  //limpa os campos de marcação de ação
  if( dataProximaAcao == null || comparaData(dataProximaAcao, moment()) > 0 ){
    entry.set("Próxima ação", "");
    entry.set("OK", false);
  }

  //DATAS DE HOJE OU ATRASADAS
  if( dataProximaAcao != null && comparaData(dataProximaAcao, moment()) <= 0 ){

    entry.set("checkContatoSelecionado", 1);    

    var ontem = moment();
    ontem.subtract(1,"d");

    if( comparaData(dataProximaAcao, ontem) <= 0 && entry.field("OK")  && entry.field("Próxima ação").length > 0){
      //1. logar ação
      logarAcaoRealizada(entry);
	
      //2. setar próxima data, conforme a frequência
      atualizarDataProximaAcao(entry);
    }
  }
}

////Funtion
function atualizarDataProximaAcao(entry) {
  entry.set("Próxima ação", "");
  entry.set("OK", false);
  entry.set("checkContatoSelecionado", 0);

  var novaData = moment();
  novaData.add(getDiasFrequencia(entry),"d");

  //se tiver aniversário antes, este será a próxima data
  var proximoNiver = getProximaDataAniversario(entry);
  if( proximoNiver != null && comparaData( proximoNiver , novaData) < 0 ){
    novaData = proximoNiver;
  }

  entry.set("Data da próxima ação", novaData.toDate().getTime());
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
  entry.set("statusSelecionado", null);

  var dataField = entry.field("Data da próxima ação");
  var dataProximaAcao = dataField == null ? null : moment(dataField);

  if( entry.field("checkContatoSelecionado") != 1 || dataProximaAcao == null)
    return;

  //Dias
  var hoje = moment();
  var ontem = moment();
  ontem.subtract(1,"d");
  var text = "";
  if( comparaData(dataProximaAcao, hoje) == 0 ){
    text = "HOJE";
  } else if( comparaData(dataProximaAcao, ontem) == 0 ){
    text = "🚫 Ontem";
  } else if( comparaData(dataProximaAcao, ontem) < 0 ){
    var dias = hoje.diff(dataProximaAcao, "days");
    text = "🚫 Atrasado " + dias + " dias";
  }

  //Aniversario 
  var proximoNiver = getProximaDataAniversario(entry);
  if( proximoNiver != null && comparaData(proximoNiver, hoje) == 0 ){
    var idade = getIdade(entry);
    text += ", " + idade + ( idade == 1 ? " aninho" : " anos" ) + "!  🎂";
  }

  entry.set("statusSelecionado", text);
}

////Funtion
function logarAcaoRealizada(entry) {

}

////Funtion
function comparaData(a, b){

  if(a.date() == b.date() && a.month() == b.month() && a.year() == b.year())
    return 0;

  return a < b ? -1 : 1;
}
