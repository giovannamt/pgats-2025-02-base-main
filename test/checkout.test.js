const request = require("supertest");
const { expect } = require("chai");
const app = require("../rest/app");

describe("API REST - Checkout", () => {
  let token;

  // ← Aqui: antes de qualquer teste do checkout, registra e loga o usuário
  before(async () => {
    // Registrar usuário (ignora se já existir)
    await request(app)
      .post("/api/users/register")
      .send({
        name: "Teste Usuário",
        email: "testeuser@email.com",
        password: "senha123"
      });

    // Login para pegar o token
    const res = await request(app)
      .post("/api/users/login")
      .send({
        email: "testeuser@email.com",
        password: "senha123"
      });
    token = res.body.token;
  });

  it("deve realizar checkout com boleto", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: 1, quantity: 2 }],
        freight: 20,
        paymentMethod: "boleto"
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("valorFinal");
    expect(res.body).to.have.property("paymentMethod", "boleto");
    expect(res.body.items).to.be.an("array");
  });

  it("deve realizar checkout com cartão de crédito", async () => {
    const res = await request(app)
      .post("/api/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: 2, quantity: 1 }],
        freight: 15,
        paymentMethod: "credit_card",
        cardData: {
          number: "4111111111111111",
          name: "Teste Usuário",
          expiry: "12/30",
          cvv: "123"
        }
      });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("valorFinal");
    expect(res.body).to.have.property("paymentMethod", "credit_card");
    expect(res.body.items).to.be.an("array");
  });
});
