import {getObjectsByPrototype, getRange} from '/game/utils'
import {Creep, Flag} from '/game/prototypes';
import {StructureTower} from '/game/prototypes/tower'

export let context = {
    my_creeps: null,
    my_towers: null,
    my_flags: null,
    my_flag: null,
    enemy_flags: null,
    enemy_flag: null,
    enemy_creeps: null,
    enemy_towers: null,
    creeps_memory: {},

    refresh: function () {
        let creeps = groupBy(getObjectsByPrototype(Creep), function (creep) {
            return creep.my ? "my" : "enemy";
        });
        this.my_creeps = creeps["my"];
        this.my_creeps.forEach(c=>{
            this.creeps_memory[c.id]=this.creeps_memory[c.id] || [];
        })
        this.enemy_creeps = creeps["enemy"];

        let flags = groupBy(getObjectsByPrototype(Flag), function (flag) {
            return flag.my ? "my" : "enemy";
        });
        this.my_flags = flags["my"];
        this.enemy_flags = flags["enemy"];

        let towers = groupBy(getObjectsByPrototype(StructureTower), function (t) {
            return t.my ? "my" : "enemy";
        })
        this.my_towers = towers["my"];
        this.enemy_towers = towers["enemy"];

        this.my_flag = this.my_flags[0];
        this.enemy_flag = this.enemy_flags[0];
    }
}

function groupBy(array, f) {
    debugger;
    const groups = {};
    array.forEach(function (o) {
        const group = f(o);
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return groups;
}