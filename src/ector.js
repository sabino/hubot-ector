var Ector, FileConceptNetwork, ector, file_backup, just_listening, previousResponseNodes, quiet, speakReplies, util;
var exec = require('child_process').exec;
var cmd = './gdrive update --refresh-token ' + process.env.GDRIVE + ' cn.json';

util = require('util');

Ector = require('ector');

FileConceptNetwork = require('file-concept-network').FileConceptNetwork;

file_backup = "cn.json";

ector = new Ector();

ector.injectConceptNetwork(FileConceptNetwork);

ector.cn.load(file_backup, function(err) {
  if (err) {
    return console.error('Erro ao carregar cn.json\n%s', err);
  }
});

previousResponseNodes = null;

quiet = false;

just_listening = false;

speakReplies = ['Obrigado.', 'OK', 'Como quiser.', 'Estou de volta! :)', ':)', 'Vlw'];

module.exports = function(robot) {
  ector.setName(robot.name);
  robot.respond(/cmd pare/i, function(msg) {
    return quiet = true;
  });
  robot.respond(/cmd escute/i, function(msg) {
    just_listening = true;
    return msg.reply("Agora estou apenas escutando.");
  });
  robot.respond(/cmd fale/i, function(msg) {
    quiet = false;
    just_listening = false;
    return msg.reply(msg.random(speakReplies));
  });
  robot.respond(/cmd salve/i, function(msg) {
    return ector.cn.save(file_backup, function(err) {
      if (err) {
        return msg.reply("Erro ao salvar no arquivo cn.json:", err);
      } else {
        return msg.reply("Obrigado, minha mente está segura agora!");
      }
    });
  });
  return robot.catchAll(function(msg) {
    var response, text;
    console.log("BEGIN OF MSG");
    console.log(msg);
    console.log("END OF MSG");

    if(msg.message.user.user == "fgsabino" && msg.message.text.replace("autobotico", "").indexOf("cmd salve") !== -1)
    {
      return ector.cn.save(file_backup, function(err) {
        if (err) {
          return msg.reply("Erro ao salvar no arquivo de backup: ", err);
        } else {
          exec(cmd, function(error, stdout, stderr) {
            console.log(error);
            console.log(stdout);
            console.log(stderr);
          });
          return msg.reply("Salvei minhas informações, minha mente está segura agora!");
        }
      });
    }

    if(msg.message.user.user != "autobotico") {
      if (!quiet) {
        text = msg.message.text.replace("autobotico","");
        ector.setUser(msg.message.user.user);
        console.log(msg.message.user.user);
        ector.addEntry(text);
        if (!just_listening) {
          ector.linkNodesToLastSentence(previousResponseNodes);
          response = ector.generateResponse();
          previousResponseNodes = response.nodes;
          console.log("RESPONSE");
          console.log(response.sentence);
          return msg.reply(response.sentence);
        }
      }
    }
  });
};