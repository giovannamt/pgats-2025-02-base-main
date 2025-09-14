const { expect } = require("chai");
const sinon = require("sinon");

const userController = require("../../rest/controllers/userController");
const userService = require("../../src/services/userService");

describe("User Controller - Unit Tests", () => {
  afterEach(() => sinon.restore()); // limpa mocks após cada teste

  it("register: deve retornar 201 quando o usuário é registrado com sucesso", () => {
    const req = {
      body: { name: "Teste", email: "teste@unit.com", password: "123456" }
    };
    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    // Mock do service para retornar usuário
    sinon.stub(userService, "registerUser").returns({ name: "Teste", email: "teste@unit.com" });

    userController.register(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledWith({ user: { name: "Teste", email: "teste@unit.com" } })).to.be.true;
  });

  it("login: deve retornar token quando credenciais válidas", () => {
    const req = { body: { email: "teste@unit.com", password: "123456" } };
    const res = { json: sinon.stub(), status: sinon.stub().returnsThis() };

    sinon.stub(userService, "authenticate").returns({ token: "JWT_TOKEN_FAKE" });

    userController.login(req, res);

    expect(res.json.calledWith({ token: "JWT_TOKEN_FAKE" })).to.be.true;
  });
});
