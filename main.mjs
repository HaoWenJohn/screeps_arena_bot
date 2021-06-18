import {getObjectsByPrototype, getRange} from '/game/utils';
import {Creep, Flag, StructureTower} from '/game/prototypes';
//import {StructureTower} from "/game/prototypes/tower";
import {ATTACK, HEAL, MOVE, RANGED_ATTACK, TOUGH} from '/game/constants';
import {move_by_memory} from "./movement.js";
import {creep_attack_plugin, creep_heal_plugin, creep_ranged_attack_plugin} from "./combat.js";
import {tower_plugin} from "./tower.js";

app.add_plugin(move_by_memory)
    .add_plugin(creep_ranged_attack_plugin)
    .add_plugin(creep_attack_plugin)
    .add_plugin(creep_heal_plugin)
    .add_plugin(move_by_memory)
    .add_plugin(tower_plugin)
export function loop() {
    app.run();
}
