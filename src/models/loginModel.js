const mongoose = require('mongoose')
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true }
})

const LoginModel = mongoose.model('Home', LoginSchema)

class Login {
    constructor(body) {
        this.body = body;
        this.errors = [];
        this.user = null;
    }

    async login() {
        this.valida();
        if (this.errors.length > 0) return;
        this.user = await this.checkUser();
        console.log(this.user);

        if (!this.user) {
            this.errors.push('Usuário não existe!!')
            return;
        }

        if(!bcryptjs.compareSync(this.body.password, this.user.password)){
            this.errors.push('Senha invalida');
            this.user = null;
            return;
        }
    }

    async register() {
        this.valida();
        if (this.errors.length > 0) return;

        this.user = await this.checkUser();
        if (this.user) {
            this.errors.push('Usuário já existe!!')
            return;
        }

        const salt = bcryptjs.genSaltSync();
        this.body.password = bcryptjs.hashSync(this.body.password, salt);

        this.user = await LoginModel.create(this.body);
    }

    async checkUser() {
        return await LoginModel.findOne({ email: this.body.email })
    }

    valida() {
        this.cleanUp();
        if (!validator.isEmail(this.body.email)) {
            this.errors.push("Esta e-mail não é valido. Insira um e-mail valido");
        }

        if (this.body.password.length < 3 || this.body.password.length >= 50)
            this.errors.push("A senha deve ter entre 3 e 50 caracteres");
    }

    cleanUp() {
        for (let key in this.body) {
            if (typeof this.body[key] !== 'string')
                this.body[key] = '';
        };

        this.body = {
            email: this.body.email,
            password: this.body.password
        };
    }
}

module.exports = Login;