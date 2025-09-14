const { expect } = require("chai");
const sinon = require("sinon");

const checkoutController = require("../../rest/controllers/checkoutController");
const checkoutService = require("../../src/services/checkoutService");
const userService = require("../../src/services/userService");

describe("Checkout Controller - Unit Tests", () => {
  afterEach(() => sinon.restore());

  it("deve retornar 401 se token for inválido", () => {
    const req = { headers: {} }; // sem token
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    checkoutController.checkout(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWith({ error: "Token inválido" })).to.be.true;
  });

  it("deve retornar 400 se checkout lançar erro", () => {
    const req = {
      headers: { authorization: "Bearer TOKEN_FAKE" },
      body: { items: [], freight: 10, paymentMethod: "boleto" }
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    sinon.stub(userService, "verifyToken").returns({ id: 1 });
    sinon.stub(checkoutService, "checkout").throws(new Error("Erro de checkout"));

    checkoutController.checkout(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWith({ error: "Erro de checkout" })).to.be.true;
  });

  it("deve retornar sucesso se checkout for realizado", () => {
    const req = {
      headers: { authorization: "Bearer TOKEN_FAKE" },
      body: { items: [{ productId: 1, quantity: 2 }], freight: 20, paymentMethod: "boleto" }
    };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub() };

    sinon.stub(userService, "verifyToken").returns({ id: 1 });
    sinon.stub(checkoutService, "checkout").returns({
      userId: 1,
      items: req.body.items,
      freight: req.body.freight,
      paymentMethod: req.body.paymentMethod,
      total: 220
    });

    checkoutController.checkout(req, res);

    expect(res.json.calledWith({
      valorFinal: 220,
      userId: 1,
      items: req.body.items,
      freight: req.body.freight,
      paymentMethod: req.body.paymentMethod,
      total: 220
    })).to.be.true;
  });
});
