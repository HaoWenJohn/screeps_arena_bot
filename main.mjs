import {getObjectsByPrototype, getRange} from '/game/utils';
import {Creep, Flag, StructureTower} from '/game/prototypes';
//import {StructureTower} from "/game/prototypes/tower";
import {MOVE,ATTACK,TOUGH,HEAL,RANGED_ATTACK} from '/game/constants';
import {} from '/arena';

global.resources={};
global.elements={};
let App = {
    plugins: [
        resources_collect_plugin,
        element_collect_plugin,
        creep_guide_flag_plugin,
        creep_attack_flag_plugin,
        tower_attack_plugin,
        creep_healthier_plugin,
        creep_ranged_attack_plugin,
        creep_attack_plugin
    ],

    run: function () {
        for (let p of this.plugins) {
            p();
        }
    }
}

function resources_collect_plugin() {
    global.resources.creeps = getObjectsByPrototype(Creep).filter(creep => creep.my);
    global.resources.towers = getObjectsByPrototype(StructureTower).filter(creep => creep.my);

}

function element_collect_plugin() {
    global.elements.myFlag = getObjectsByPrototype(Flag).find(flag => flag.my);
    global.elements.enermyFlag = getObjectsByPrototype(Flag).find(flag => !flag.my);
}

function creep_guide_flag_plugin() {
    let guide_creep = apply_creeps( [{body_part_type:[TOUGH],amount:1}]);

    if (!guide_creep) return;
    let myFlag = global.elements.myFlag;
    for (let c of guide_creep) {
        c.moveTo(myFlag);
    }
}
function creep_healthier_plugin(){
    let healthiers= getObjectsByPrototype(Creep).filter(c=>c.my&&c.body.some(b=>b.type==="heal"));
    for (let healthier of healthiers){
       let need_repair = healthier.findInRange(getObjectsByPrototype(Creep).filter(c=>c.my&&c.hits<c.hitsMax),3);
       if (need_repair.length>0){
           healthier.rangedHeal(need_repair.sort()[need_repair.length-1]);
       }
    }
}
function creep_ranged_attack_plugin(){
    let range_attackers = getObjectsByPrototype(Creep).filter(c=>c.my&&c.body.some(b=>b.type==="ranged_attack"));
    for(let range_attack of range_attackers){
        let closest_enemy = range_attack
            .findInRange(getObjectsByPrototype(Creep).filter(c => !c.my),3);
        range_attack.rangedAttack(closest_enemy);
    }

}

function creep_attack_plugin(){
    let attackers = getObjectsByPrototype(Creep).filter(c=>c.my&&c.body.some(b=>b.type==="attack"));
    for(let attacker of attackers){
        let closest_enemy = attacker
            .findInRange(getObjectsByPrototype(Creep).filter(c => !c.my),1);
        attacker.attack(closest_enemy);
    }
}
function creep_attack_flag_plugin() {
    let attack_creeps = apply_resources( "creeps", 13);
    if (!attack_creeps) return;
    let enemy_flag = global.elements.enermyFlag;
    for (let c of attack_creeps) {
        c.moveTo(enemy_flag);

    }
}

function tower_attack_plugin() {
    let towers=global.resources.towers;
    if (!towers)return;
    let closest_enemy = towers[0]
        .findClosestByRange(getObjectsByPrototype(Creep).filter(c => !c.my));
    for (let t of towers){
        if (getRange(t,closest_enemy)<10){
            t.attack(closest_enemy);
        }

    }
}

function apply_resources(type, amount) {
    if (!global.resources[type] || global.resources[type].length < amount) {
        return null;
    } else {
        let result = global.resources[type].slice(0, amount);
        global.resources[type] = global.resources[type].slice(amount, global.resources[type].length);
        return result;
    }
}

/***
 * @param opt=[{
 *     body_part_type:[body_part_type]
 *     amount:int
 * }]
 */
function apply_creeps(opts){
    let res = [];
    for (let opt of opts){
        for (let c of global.resources.creeps){
            let satisfy = false;
            for (let bp of opt.body_part_type){
                if (c.body.some(b=>b.type===bp)){
                    satisfy=true;
                    break;
                }
            }
            if (satisfy) {
                res.push(c);
                let idx = global.resources.creeps.indexOf(c);
                global.resources.creeps.splice(idx,1);
                if (res.length===opt.amount)break;
            }
        }
    }

    return res;
}
export function loop() {
    App.run();
}
