////
////FUNTIONS
////

//Function
function inserirEmLote(entry) {

  message("Starting...");

  var current = entry;
  var novos = current.field("Novos");

  if( !current.field("Inserir em lote") || novos == null)
    novos = "";

  var linhas = novos.split("\n");
  var total = 0;

  for(var i = 0;i < linhas.length;i++){
    var linha = linhas[i].trim();

    if(linha == '')
      continue;

    message("Inserindo " + i + " de " +  linhas.length + ": " + linha);

    //Parse fields  
    linha = linha.replace(/\t/g,";")
    var campos = linha.split(";");
    var nome = campos[0];
    var tag1 = campos.length >= 2 && campos[1].trim() != "" ? campos[1] : "-";
    var tag2 = campos.length >= 3 && campos[2].trim() != "" ? campos[2] : "-";
    var tag3 = campos.length >= 4 && campos[3].trim() != "" ? campos[3] : "-";
    var tag4 = campos.length >= 5 && campos[4].trim() != "" ? campos[4] : "-";
    var id   = campos.length >= 6 && campos[5].trim() != "" ? campos[5] : 0;

  //Insert line
    var novo = new Object();
    novo["Nome"] = nome;
    novo["Guia"] = tag1;
    novo["tag2"] = tag2;
    novo["tag3"] = tag3;
    novo["tag4"] = tag4;
    novo["id"] = id;
    novo["Atividade"] = current.field("Atividade");

    novo["oriTag1"] = tag1;
    novo["oriTag2"] = tag2;
    novo["oriTag3"] = tag3;
    novo["oriTag4"] = tag4;

    //lib().create(novo);
    total++;
    sleep(500);
  }

  if( current.field("Inserir em lote")){
    current.set("Nome", "@@ Só deletar");
    current.set("Atividade", null);
  }

  current.set("Inserir em lote", false);
  current.set("Novos", null);

  if(total != 0)
    message(total + " Pessoas adicionadas em: " + novo["Atividade"]);

  //DEBUG
  //message(current.field("Nome") + " - " + current.field("Novos"));
}

//Function
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}