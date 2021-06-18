import {context} from "./context";

export let app = {
    ctx: context,
    plugins: [],
    add_plugin:function (plugin){
        let idx = this.plugins.indexOf(plugin);
        if (idx===-1)this.plugins.push(plugin);
        return this;
    },
    run:function (){
        this.ctx.refresh();
        this.plugins.forEach(p=>p(this.ctx));
    }
}