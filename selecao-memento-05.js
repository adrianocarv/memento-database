////
////FUNTIONS
////

//Function
function generalCheck() {

  message("General Check - Starting...");

  var entries = lib().entries();

  for (var i = 0; i < entries.length; i++) {

    //checkStatus1
    if(entries[i].field("Status") == "1. Sabendo"){;
      entries[i].set("checkStatus1", 1);
    }else{
      entries[i].set("checkStatus1", 0);
    }

    //checkStatus2
    if(entries[i].field("Status") == "2. Tem chance"){
      entries[i].set("checkStatus2", 1);
    }else{
      entries[i].set("checkStatus2", 0);
    }

    //checkStatus3
    if(entries[i].field("Status") == "3. Vai"){
      entries[i].set("checkStatus3", 1);
    }else{
      entries[i].set("checkStatus3", 0);
    }

    //checkStatus4
    if(entries[i].field("Status") == "4. Quer ir no próximo"){
      entries[i].set("checkStatus4", 1);
    }else{
      entries[i].set("checkStatus4", 0);
    }

    //checkStatus5
    if(entries[i].field("Status") == "5. Não vai"){
      entries[i].set("checkStatus5", 1);
    }else{
      entries[i].set("checkStatus5", 0);
    }

    //revisar
    var is1 = entries[i].field("Guia").equals(entries[i].field("oriTag1"));
    var is2 = entries[0].field("oriTag2").equals( (entries[0].field("tag2") + "").replace("[","").replace("]",""));
    var is3 = entries[0].field("oriTag3").equals( (entries[0].field("tag3") + "").replace("[","").replace("]",""));
    var is4 = entries[0].field("oriTag4").equals( (entries[0].field("tag4") + "").replace("[","").replace("]",""));
    var revisarTags = null;
    if(entries[i].field("id") == null || (is1 && is2 && is3 && is4) ){
      entries[i].set("revisar", false);
    }else{
      entries[i].set("revisar", true);
      revisarTags = "";
      if(!is1)
        revisarTags += "Guia: " + entries[i].field("oriTag1") + "\n";
      if(!is2)
        revisarTags += "2: " + entries[i].field("oriTag2") + "\n";
      if(!is3)
        revisarTags += "3: " + entries[i].field("oriTag3") + "\n";
      if(!is4)
        revisarTags += "4: " + entries[i].field("oriTag4") + "\n";
    }
    entries[i].set("revisarTags", revisarTags);
	
    if(i % 25 == 0)
      message("Registro " + i + " de " + entries.length + "...");
  }

  message("General Check - Concluído!");
}

//Function
//Function
function inserirEmLote(entry) {

  message("Starting...");

  var current = entry;
  var novos = current.field("Novos");

  if( !current.field("Inserir em lote") || novos == null)
    novos = "";

  var linhas = novos.split("\n");
  var total = 0;

  for(var i = 0; i < linhas.length; i++){
    var linha = linhas[i].trim();

    if(linha == '')
      continue;

    message("Linha " + i + " de " +  linhas.length + ": " + linha);

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

    lib().create(novo);
    total++;
    sleep(1000);
  }

  if( current.field("Inserir em lote")){
    current.set("Nome", "@@ Só deletar");
    current.set("Atividade", null);
  }

  current.set("Inserir em lote", false);
  current.set("Novos", null);

  if(total != 0)
    message(total + " adicionadas em: " + novo["Atividade"]);

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