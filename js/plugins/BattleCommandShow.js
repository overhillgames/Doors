'use strict';

// Untested, but very likely to work.
const oldGetActorCommandHelp = TS_Battle_Command_Descriptions.getActorCommandHelp;
TS_Battle_Command_Descriptions.getActorCommandHelp = function (commandData) {
  if (commandData && commandData.symbol === 'singleSkill') {
    const object = $dataSkills[commandData.ext];
    const help = object && object.description;
    if (typeof help === 'string') return help;
  }
  return oldGetActorCommandHelp.apply(this, arguments);
};