var Ector, FileConceptNetwork, ector, file_backup, just_listening, previousResponseNodes, quiet, speakReplies, util;

util = require('util');

Ector = require('ector');

FileConceptNetwork = require('file-concept-network').FileConceptNetwork;

file_backup = "cn.json";

ector = new Ector();

ector.injectConceptNetwork(FileConceptNetwork);

ector.cn.load(file_backup, function(err) {
  if (err) {
    return console.error('Error while loading cn.json\n%s', err);
  }
});

previousResponseNodes = null;

quiet = false;

just_listening = false;

speakReplies = ['Thanks.', 'OK', 'As you will.', 'Glad to be here again :)', ':)', 'Thank you.'];

module.exports = function(robot) {
  ector.setName(robot.name);
  robot.respond(/shut up/i, function(msg) {
    return quiet = true;
  });
  robot.respond(/just listen/i, function(msg) {
    just_listening = true;
    return msg.reply("Now I'm just listening.");
  });
  robot.respond(/speak/i, function(msg) {
    quiet = false;
    just_listening = false;
    return msg.reply(msg.random(speakReplies));
  });
  robot.respond(/save yourself/i, function(msg) {
    return ector.cn.save(file_backup, function(err) {
      if (err) {
        return msg.reply("An error occurred while saving cn.json:", err);
      } else {
        return msg.reply("Thanks, My mind is safe now!");
      }
    });
  });
  return robot.catchAll(function(msg) {
    var response, text;
    console.log("BEGIN OF MSG");
    console.log(msg);
    console.log("END OF MSG");
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
  });
};