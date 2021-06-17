import {getObjectsByPrototype, getRange} from '/game/utils';
import {Creep, Flag, StructureTower} from '/game/prototypes';
//import {StructureTower} from "/game/prototypes/tower";
import {ATTACK, HEAL, MOVE, RANGED_ATTACK, TOUGH} from '/game/constants';

global.resources={};
global.elements={};
let App = {
    plugins: [
        resources_collect_plugin,
        element_collect_plugin,
        commander_plugin,
        creep_guide_flag_plugin,
        leader_elect_plugin,
        creep_attack_flag_plugin,
        tower_attack_plugin,
        creep_healthier_plugin,
        creep_ranged_attack_plugin,
        creep_attack_plugin,
    ],

    run: function () {
        for (let p of this.plugins) {
            p();
        }
    }
};
function commander_plugin() {
    global.enemy = global.resources.towers[0].findClosestByRange(getObjectsByPrototype(Creep).filter(creep => !creep.my));
}
function leader_elect_plugin(){
    let leader_seq = [TOUGH,RANGED_ATTACK,HEAL];

    for (let l of leader_seq){
        let tars=apply_creeps([{body_part_type:[l],amount:1}]);
        if (tars.length>0){
            for (let tar of tars){
                if (tar.body.some(b=>b.type==="move")){
                    global.leader = tar;
                    console.log("leader:"+tar.id);
                    return;
                }
            }

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
        console.log("guide:"+c.id);
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

        if (closest_enemy.length>0){
            range_attack.rangedAttack(closest_enemy[0]);
        }

    }

}

function creep_attack_plugin(){
    let attackers = getObjectsByPrototype(Creep).filter(c=>c.my&&c.body.some(b=>b.type==="attack"));
    for(let attacker of attackers){
        let closest_enemy = attacker.findInRange(getObjectsByPrototype(Creep).filter(c => !c.my),1);
        if (closest_enemy.length>0){
            attacker.attack(closest_enemy[0]);
        }

    }
}
function creep_attack_flag_plugin() {
    let leader = global.leader;
    if (!leader){
        return;
    }
    let move_target = global.enemy?global.enemy:global.elements.enermyFlag;
    if (global.resources.creeps.length<5 || leader.findInRange(getObjectsByPrototype(Creep).filter(c=>c.my),2).length>=5){
        leader.moveTo(move_target);
    }

    let attack_creeps = apply_resources( "creeps", 13);
    if (!attack_creeps) return;
    for (let c of attack_creeps) {
        c.moveTo(leader);

    }
}

function tower_attack_plugin() {
    let towers=global.resources.towers;
    if (!towers)return;
    let closest_enemy = towers[0]
        .findClosestByRange(getObjectsByPrototype(Creep).filter(c => !c.my));
    if (!closest_enemy)return;
    for (let t of towers){
        if (getRange(t,closest_enemy)<10){
            t.attack(closest_enemy);
        }

    }
}

function apply_resources(type, amount) {
    amount = Math.min(global.resources[type].length,amount);
    if (!global.resources[type] || amount === 0) {
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
            let satisfy = true;
            for (let bp of opt.body_part_type){
                if (c.body.every(b=>b.type!==bp)){
                    satisfy=false;
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
