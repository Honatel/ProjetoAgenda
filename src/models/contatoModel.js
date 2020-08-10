const mongoose = require('mongoose')
const validator = require('validator')

const ContatoSchema = mongoose.Schema({
    nome: { type: String, required: true },
    sobrenome: { type: String, required: false, default: '' },
    email: { type: String, required: false, default: '' },
    telefone: { type: String, required: false, default: '' },
    criadoEm: { type: Date, default: Date.now },
})

const ContatoModel = mongoose.model('Contato', ContatoSchema);

function Contato(body) {
    this.body = body;
    this.errors = [];
    this.contato = null;
}

Contato.buscaPorId = async function (id) {
    if (typeof id !== 'string') return;

    const contato = await ContatoModel.findById(id);
    return contato;
}

Contato.prototype.edit = async function (id) {
    if (typeof id !== 'string') return;

    this.valida();
    if(this.errors.length > 0) return;
    
    this.contato = await ContatoModel.findByIdAndUpdate(id, this.body, {new: true});
}

Contato.delete = async function (id) {
    if (typeof id !== 'string') return;  
    const contato = await ContatoModel.findByIdAndDelete(id);
    return contato;
}

Contato.prototype.register = async function () {
    this.valida();
    if (this.errors.length > 0) return;
    this.contato = await ContatoModel.create(this.body);
}

Contato.prototype.valida = function () {
    this.cleanUp();
    if (this.body.email && !validator.isEmail(this.body.email)) {
        this.errors.push("Esta e-mail não é valido. Insira um e-mail valido");
    }
    if (!this.body.nome) this.errors.push('O nome é obrigatório')

    if (!this.body.email && !this.body.telefone) {
        this.errors.push('Ao menos um cotato é obrigatório')
    }
}

Contato.prototype.cleanUp = function () {
    for (let key in this.body) {
        if (typeof this.body[key] !== 'string')
            this.body[key] = '';
    };

    this.body = {
        nome: this.body.nome,
        sobrenome: this.body.sobrenome,
        email: this.body.email,
        telefone: this.body.telefone
    };
}

Contato.buscaContatos = async function () {
    const contato = await ContatoModel.find()
        .sort({criadoEm: -1});
    return contato;
}


module.exports = Contato;